import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreateSubscriptionDto } from './subscriptions.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query('customerId') customerId?: string) {
    return this.subscriptions.list(req.user!.tenantId, customerId);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptions.create(req.user!.tenantId, dto);
  }
}
