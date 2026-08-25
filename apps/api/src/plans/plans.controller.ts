import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { PlansService } from './plans.service';

@Controller('plans')
@UseGuards(AuthGuard)
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.plans.list(req.user!.tenantId);
  }
}
