import { Controller, Get } from '@nestjs/common';

@Controller('ready')
export class ReadinessController {
  @Get()
  getReadiness() {
    return {
      status: 'ready',
      service: 'nexora-api',
      timestamp: new Date().toISOString(),
    };
  }
}
