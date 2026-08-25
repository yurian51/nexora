import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreateSubscriptionDto } from './subscriptions.dto';

@Injectable()
export class SubscriptionsService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async list(tenantId: string, customerId?: string) {
    const result = await this.db.query(
      `SELECT s.id, s.customer_id, s.plan_id, s.status, s.starts_at, s.ends_at, s.created_at,
              c.full_name AS customer_name, p.name AS plan_name, p.price
       FROM subscriptions s
       JOIN customers c ON c.id = s.customer_id AND c.tenant_id = s.tenant_id
       JOIN plans p ON p.id = s.plan_id AND p.tenant_id = s.tenant_id
       WHERE s.tenant_id = $1 AND ($2::uuid IS NULL OR s.customer_id = $2::uuid)
       ORDER BY s.created_at DESC LIMIT 100`,
      [tenantId, customerId ?? null],
    );
    return result.rows;
  }

  async create(tenantId: string, dto: CreateSubscriptionDto) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const customer = await client.query('SELECT id FROM customers WHERE tenant_id = $1 AND id = $2', [tenantId, dto.customerId]);
      const plan = await client.query('SELECT id, duration_seconds FROM plans WHERE tenant_id = $1 AND id = $2 AND is_active = TRUE', [tenantId, dto.planId]);
      if (!customer.rowCount) throw new NotFoundException('Customer not found');
      if (!plan.rowCount) throw new NotFoundException('Active plan not found');

      const startsAt = dto.startsAt ? new Date(dto.startsAt) : new Date();
      if (Number.isNaN(startsAt.getTime())) throw new BadRequestException('Invalid start date');
      const duration = Number(plan.rows[0].duration_seconds ?? 0);
      const result = await client.query(
        `INSERT INTO subscriptions (tenant_id, customer_id, plan_id, status, starts_at, ends_at)
         VALUES ($1, $2, $3, 'PENDING_PAYMENT', $4, $5)
         RETURNING id, customer_id, plan_id, status, starts_at, ends_at, created_at`,
        [tenantId, dto.customerId, dto.planId, startsAt, duration > 0 ? new Date(startsAt.getTime() + duration * 1000) : null],
      );
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
