import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ReadinessController } from './readiness.controller';

@Module({ controllers: [HealthController, ReadinessController] })
export class HealthModule {}
