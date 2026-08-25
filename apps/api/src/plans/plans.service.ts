import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class PlansService {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  async list(tenantId: string) {
    const result = await this.db.query(
      `SELECT id, name, price, duration_seconds, data_limit_bytes, download_bps, upload_bps, is_active, created_at
       FROM plans WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId],
    );
    return result.rows;
  }
}
