import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreateWifiPurchaseDto, InitiatePaymentDto, PaymentWebhookDto } from './billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @Inject(PG_POOL) private readonly db: Pool,
    private readonly config: ConfigService,
  ) {}

  async listPurchases(tenantId: string, customerId?: string) {
    const result = await this.db.query(`SELECT p.id, p.customer_id, p.package_id, p.router_id, p.status, p.price, p.currency, p.starts_at, p.ends_at, p.created_at, c.full_name AS customer_name, pkg.name AS package_name FROM wifi_plan_purchases p JOIN customers c ON c.id = p.customer_id AND c.tenant_id = p.tenant_id JOIN packages pkg ON pkg.id = p.package_id AND pkg.tenant_id = p.tenant_id WHERE p.tenant_id = $1 AND ($2::uuid IS NULL OR p.customer_id = $2::uuid) ORDER BY p.created_at DESC LIMIT 100`, [tenantId, customerId ?? null]);
    return result.rows;
  }

  async createPurchase(tenantId: string, dto: CreateWifiPurchaseDto) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const customer = await client.query('SELECT id FROM customers WHERE tenant_id = $1 AND id = $2', [tenantId, dto.customerId]);
      const pkg = await client.query('SELECT id, price, currency, duration_seconds FROM packages WHERE tenant_id = $1 AND id = $2 AND is_active = TRUE', [tenantId, dto.packageId]);
      if (!customer.rowCount) throw new NotFoundException('Customer not found');
      if (!pkg.rowCount) throw new NotFoundException('Active WiFi plan not found');
      if (dto.routerId) {
        const router = await client.query('SELECT id FROM routers WHERE tenant_id = $1 AND id = $2', [tenantId, dto.routerId]);
        if (!router.rowCount) throw new NotFoundException('Router not found');
      }
      const row = pkg.rows[0];
      const result = await client.query(`INSERT INTO wifi_plan_purchases (tenant_id, customer_id, package_id, router_id, price, currency, status) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_PAYMENT') RETURNING id, customer_id, package_id, router_id, status, price, currency, starts_at, ends_at, created_at`, [tenantId, dto.customerId, dto.packageId, dto.routerId ?? null, row.price, row.currency]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async initiatePayment(tenantId: string, dto: InitiatePaymentDto) {
    const purchase = await this.db.query('SELECT id, customer_id, price, currency, status FROM wifi_plan_purchases WHERE tenant_id = $1 AND id = $2', [tenantId, dto.purchaseId]);
    if (!purchase.rowCount) throw new NotFoundException('WiFi purchase not found');
    if (purchase.rows[0].status !== 'PENDING_PAYMENT') throw new ConflictException('Purchase is not awaiting payment');

    const existing = await this.db.query('SELECT id, purchase_id, provider, provider_reference, status, amount, currency, idempotency_key, created_at FROM payments WHERE tenant_id = $1 AND idempotency_key = $2', [tenantId, dto.idempotencyKey]);
    if (existing.rowCount) return existing.rows[0];

    const payment = await this.db.query(`INSERT INTO payments (tenant_id, customer_id, purchase_id, provider, amount, currency, status, idempotency_key) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7) RETURNING id, purchase_id, provider, amount, currency, status, idempotency_key, created_at`, [tenantId, purchase.rows[0].customer_id, dto.purchaseId, dto.provider, purchase.rows[0].price, purchase.rows[0].currency, dto.idempotencyKey]);
    return payment.rows[0];
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string | undefined) {
    const secret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET');
    if (!secret || !signature) throw new UnauthorizedException('Webhook signature is not configured');
    const supplied = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const a = Buffer.from(supplied, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid webhook signature');
  }

  async processPaymentWebhook(provider: string, dto: PaymentWebhookDto) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const tenant = await client.query('SELECT id FROM tenants WHERE id = $1', [dto.tenantId]);
      if (!tenant.rowCount) throw new NotFoundException('Tenant not found');

      const payment = await client.query(`SELECT p.id, p.tenant_id, p.customer_id, p.purchase_id, p.provider, p.amount, p.currency, p.status, w.package_id, pkg.duration_seconds FROM payments p LEFT JOIN wifi_plan_purchases w ON w.tenant_id = p.tenant_id AND w.id = p.purchase_id LEFT JOIN packages pkg ON pkg.tenant_id = w.tenant_id AND pkg.id = w.package_id WHERE p.tenant_id = $1 AND p.id = $2 FOR UPDATE`, [dto.tenantId, dto.paymentId]);
      if (!payment.rowCount) throw new NotFoundException('Payment not found');
      const current = payment.rows[0];
      if (current.provider !== provider) throw new ConflictException('Payment provider mismatch');

      const eventInsert = await client.query(`INSERT INTO payment_events (tenant_id, payment_id, provider, provider_event_id, event_type, payload, signature_valid, processed_at) VALUES ($1, $2, $3, $4, $5, $6::jsonb, TRUE, now()) ON CONFLICT (provider, provider_event_id) WHERE provider_event_id IS NOT NULL DO NOTHING RETURNING id`, [dto.tenantId, dto.paymentId, provider, dto.eventId, dto.eventType, JSON.stringify(dto)]);
      if (!eventInsert.rowCount) {
        await client.query('ROLLBACK');
        return { accepted: true, duplicate: true, paymentId: dto.paymentId, eventId: dto.eventId };
      }

      if (dto.status === 'SUCCESS') {
        if (current.status !== 'SUCCESS') {
          const startsAt = new Date();
          const endsAt = new Date(startsAt.getTime() + Number(current.duration_seconds ?? 0) * 1000);
          await client.query(`UPDATE payments SET status = 'SUCCESS', provider_reference = COALESCE($3, provider_reference), raw_payload = $4::jsonb, updated_at = now() WHERE tenant_id = $1 AND id = $2`, [dto.tenantId, dto.paymentId, dto.providerReference ?? null, JSON.stringify(dto)]);
          if (current.purchase_id) {
            await client.query(`UPDATE wifi_plan_purchases SET status = 'ACTIVE', starts_at = $3, ends_at = $4, updated_at = now() WHERE tenant_id = $1 AND id = $2`, [dto.tenantId, current.purchase_id, startsAt, endsAt]);
            await client.query(`INSERT INTO access_grants (tenant_id, purchase_id, customer_id, router_id, status, starts_at, ends_at) SELECT tenant_id, id, customer_id, router_id, 'ACTIVE', $3, $4 FROM wifi_plan_purchases WHERE tenant_id = $1 AND id = $2 ON CONFLICT (purchase_id) DO UPDATE SET status = 'ACTIVE', starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at, updated_at = now()`, [dto.tenantId, current.purchase_id, startsAt, endsAt]);
          }
        }
      } else if (dto.status === 'FAILED') {
        await client.query(`UPDATE payments SET status = 'FAILED', provider_reference = COALESCE($3, provider_reference), raw_payload = $4::jsonb, updated_at = now() WHERE tenant_id = $1 AND id = $2 AND status = 'PENDING'`, [dto.tenantId, dto.paymentId, dto.providerReference ?? null, JSON.stringify(dto)]);
      } else {
        await client.query(`UPDATE payments SET status = 'REFUNDED', provider_reference = COALESCE($3, provider_reference), raw_payload = $4::jsonb, updated_at = now() WHERE tenant_id = $1 AND id = $2`, [dto.tenantId, dto.paymentId, dto.providerReference ?? null, JSON.stringify(dto)]);
        if (current.purchase_id) {
          await client.query(`UPDATE wifi_plan_purchases SET status = 'REFUNDED', updated_at = now() WHERE tenant_id = $1 AND id = $2`, [dto.tenantId, current.purchase_id]);
          await client.query(`UPDATE access_grants SET status = 'REVOKED', updated_at = now() WHERE tenant_id = $1 AND purchase_id = $2 AND status IN ('PENDING','ACTIVE')`, [dto.tenantId, current.purchase_id]);
        }
      }

      await client.query('COMMIT');
      return { accepted: true, duplicate: false, paymentId: dto.paymentId, eventId: dto.eventId, status: dto.status };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
