import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async list(tenantId: string, search?: string) {
    const q = search?.trim() ?? '';
    const result = await this.db.query(
      `SELECT id, username, full_name, email, phone, is_active, created_at, updated_at
       FROM customers
       WHERE tenant_id = $1
         AND ($2 = '' OR full_name ILIKE '%' || $2 || '%' OR username ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%' OR phone ILIKE '%' || $2 || '%')
       ORDER BY created_at DESC
       LIMIT 100`,
      [tenantId, q],
    );
    return result.rows;
  }

  async get(tenantId: string, id: string) {
    const result = await this.db.query(
      `SELECT id, username, full_name, email, phone, is_active, created_at, updated_at
       FROM customers WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id],
    );
    if (!result.rowCount) throw new NotFoundException('Customer not found');
    return result.rows[0];
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    try {
      const result = await this.db.query(
        `INSERT INTO customers (tenant_id, username, full_name, email, phone, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING id, username, full_name, email, phone, is_active, created_at, updated_at`,
        [tenantId, dto.username, dto.fullName, dto.email ?? null, dto.phone ?? null],
      );
      return result.rows[0];
    } catch (error) {
      if (this.isUniqueViolation(error)) throw new ConflictException('Customer username already exists');
      throw error;
    }
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    const current = await this.get(tenantId, id);
    const result = await this.db.query(
      `UPDATE customers
       SET full_name = $3,
           email = $4,
           phone = $5,
           is_active = $6,
           updated_at = now()
       WHERE tenant_id = $1 AND id = $2
       RETURNING id, username, full_name, email, phone, is_active, created_at, updated_at`,
      [tenantId, id, dto.fullName ?? current.full_name, dto.email ?? current.email, dto.phone ?? current.phone, dto.isActive ?? current.is_active],
    );
    return result.rows[0];
  }

  async deactivate(tenantId: string, id: string) {
    return this.update(tenantId, id, { isActive: false });
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505';
  }
}
