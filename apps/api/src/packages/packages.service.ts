import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreatePackageDto, ListPackagesQueryDto, UpdatePackageDto } from './packages.dto';

@Injectable()
export class PackagesService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async list(tenantId: string, query: ListPackagesQueryDto = new ListPackagesQueryDto()) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const offset = (page - 1) * limit;
    const search = query.search?.trim() || null;
    const activeOnly = query.activeOnly === true;
    const result = await this.db.query(`SELECT id, name, price, currency, duration_seconds AS "durationSeconds", data_limit_bytes AS "dataLimitBytes", download_bps AS "downloadBps", upload_bps AS "uploadBps", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt" FROM packages WHERE tenant_id = $1 AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%') AND ($3::boolean = false OR is_active = true) ORDER BY created_at DESC LIMIT $4 OFFSET $5`, [tenantId, search, activeOnly, limit, offset]);
    const count = await this.db.query(`SELECT COUNT(*)::int AS count FROM packages WHERE tenant_id = $1 AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%') AND ($3::boolean = false OR is_active = true)`, [tenantId, search, activeOnly]);
    const total = count.rows[0]?.count ?? 0;
    return { data: result.rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async get(tenantId: string, id: string) {
    const result = await this.db.query(`SELECT id, name, price, currency, duration_seconds AS "durationSeconds", data_limit_bytes AS "dataLimitBytes", download_bps AS "downloadBps", upload_bps AS "uploadBps", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt" FROM packages WHERE tenant_id = $1 AND id = $2`, [tenantId, id]);
    if (!result.rowCount) throw new NotFoundException('WiFi plan not found');
    return result.rows[0];
  }

  async create(tenantId: string, input: CreatePackageDto) {
    try {
      const result = await this.db.query(`INSERT INTO packages (tenant_id, name, price, currency, duration_seconds, data_limit_bytes, download_bps, upload_bps, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, name, price, currency, duration_seconds AS "durationSeconds", data_limit_bytes AS "dataLimitBytes", download_bps AS "downloadBps", upload_bps AS "uploadBps", is_active AS "isActive", created_at AS "createdAt"`, [tenantId, input.name.trim(), input.price, (input.currency ?? 'TZS').trim().toUpperCase(), input.durationSeconds, input.dataLimitBytes ?? null, input.downloadBps ?? null, input.uploadBps ?? null, input.isActive ?? true]);
      return result.rows[0];
    } catch (error: any) {
      if (error?.code === '23505') throw new ConflictException('WiFi plan already exists');
      throw error;
    }
  }

  async update(tenantId: string, id: string, input: UpdatePackageDto) {
    const current = await this.get(tenantId, id);
    const result = await this.db.query(`UPDATE packages SET name=$3, price=$4, currency=$5, duration_seconds=$6, data_limit_bytes=$7, download_bps=$8, upload_bps=$9, is_active=$10, updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id, name, price, currency, duration_seconds AS "durationSeconds", data_limit_bytes AS "dataLimitBytes", download_bps AS "downloadBps", upload_bps AS "uploadBps", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`, [tenantId, id, input.name?.trim() ?? current.name, input.price ?? current.price, input.currency?.trim().toUpperCase() ?? current.currency, input.durationSeconds ?? current.durationSeconds, input.dataLimitBytes ?? current.dataLimitBytes, input.downloadBps ?? current.downloadBps, input.uploadBps ?? current.uploadBps, input.isActive ?? current.isActive]);
    return result.rows[0];
  }

  async deactivate(tenantId: string, id: string) { return this.update(tenantId, id, { isActive: false }); }
}
