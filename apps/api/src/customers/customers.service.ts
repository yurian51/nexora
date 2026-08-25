import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async list(tenantId: string, search?: string) {
    const result = await this.db.query(
      `SELECT id, full_name AS "fullName", phone, email, username, is_active AS "isActive", created_at AS "createdAt"
       FROM customers
       WHERE tenant_id = $1
         AND ($2::text IS NULL OR full_name ILIKE '%' || $2 || '%' OR phone ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%' OR username ILIKE '%' || $2 || '%')
       ORDER BY created_at DESC
       LIMIT 100`,
      [tenantId, search?.trim() || null],
    );
    return { data: result.rows, count: result.rowCount ?? 0 };
  }

  async create(tenantId: string, input: CreateCustomerDto) {
    try {
      const result = await this.db.query(
        `INSERT INTO customers (tenant_id, full_name, phone, email, username, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, full_name AS "fullName", phone, email, username, is_active AS "isActive", created_at AS "createdAt"`,
        [tenantId, input.fullName?.trim() || null, input.phone?.trim() || null, input.email?.trim().toLowerCase() || null, input.username?.trim() || null, input.isActive ?? true],
      );
      return result.rows[0];
    } catch (error: any) {
      if (error?.code === '23505') throw new ConflictException('Customer username already exists');
      throw error;
    }
  }
}
