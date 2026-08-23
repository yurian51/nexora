import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = Symbol('PG_POOL');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Pool({
          connectionString: config.get<string>('DATABASE_URL'),
          max: config.get<number>('DATABASE_POOL_MAX', 10),
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
        }),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
