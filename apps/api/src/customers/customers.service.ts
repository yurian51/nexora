import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreateCustomerDto, ListCustomersQueryDto, UpdateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async list(tenantId: string, query: ListCustomersQueryDto = new ListCustomersQueryDto()) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const offset = (page - 1) * limit;
    const search = query.search?.trim() || null;
    const activeOnly = query.activeOnly === true;
    const params = [tenantId, search, activeOnly, limit, offset];

    const result = await this.db.query(
      `SELECT id, full_name AS "fullName", phone, email, username, is_active AS "isActive", created_at AS "createdAt"
       FROM customers
       WHERE tenant_id = $1
         AND ($2::text IS NULL OR full_name ILIKE '%' || $2 || '%' OR phone ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%' OR username ILIKE '%' || $2 || '%')
         AND ($3::boolean = false OR is_active = true)
       ORDER BY created_at DESC
       LIMIT $4 OFFSET $5`,
      params,
    );

    const count = await this.db.query(
      `SELECT COUNT(*)::int AS count
       FROM customers
       WHERE tenant_id = $1
         AND ($2::text IS NULL OR full_name ILIKE '%' || $2 || '%' OR phone ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%' OR username ILIKE '%' || $2 || '%')
         AND ($3::boolean = false OR is_active = true)`,
      [tenantId, search, activeOnly],
    );

    const total = count.rows[0]?.count ?? 0;
    return {
      data: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async get(tenantId: string, id: string) {
    const result = await this.db.query(
      `SELECT id, full_name AS "fullName", phone, email, username, is_active AS "isActive", created_at AS "createdAt"
       FROM customers WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id],
    );
    if (!result.rowCount) throw new NotFoundException('Customer not found');
    return result.rows[0];
  }

  async create(tenantId: string, input: CreateCustomerDto) {
    try {
      const result = await this.db.query(
        `INSERT INTO customers (tenant_id, full_name, phone, email, username, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, full_name AS "fullName", phone, email, username, is_active AS "isActive", created_at AS "createdAt"`,
        [tenantId, input.fullName.trim(), input.phone?.trim() || null, input.email?.trim().toLowerCase() || null, input.username.trim(), input.isActive ?? true],
      );
      return result.rows[0];
    } catch (error: any) {
      if (error?.code === '23505') throw new ConflictException('Customer username already exists');
      throw error;
    }
  }

  async update(tenantId: string, id: string, input: UpdateCustomerDto) {
    const current = await this.get(tenantId, id);
    const result = await this.db.query(
      `UPDATE customers SET full_name = $3, phone = $4, email = $5, is_active = $6, updated_at = now()
       WHERE tenant_id = $1 AND id = $2
       RETURNING id, full_name AS "fullName", phone, email, username, is_active AS "isActive", created_at AS "createdAt"`,
      [tenantId, id, input.fullName?.trim() ?? current.fullName, input.phone?.trim() ?? current.phone, input.email?.trim().toLowerCase() ?? current.email, input.isActive ?? current.isActive],
    );
    return result.rows[0];
  }

  async deactivate(tenantId: string, id: string) {
    return this.update(tenantId, id, { isActive: false });
  }
}
