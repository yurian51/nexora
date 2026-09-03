import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreatePaymentIntentDto, PaymentWebhookDto } from './payments.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @UseGuards(AuthGuard)
  list(@Req() req: AuthenticatedRequest) {
    return this.payments.list(req.user!.tenantId);
  }

  @Post('intents')
  @UseGuards(AuthGuard)
  createIntent(@Req() req: AuthenticatedRequest, @Body() dto: CreatePaymentIntentDto) {
    return this.payments.createIntent(req.user!.tenantId, dto);
  }

  // Provider webhooks must be authenticated by the provider signature in production.
  // The current endpoint is deliberately tenant-scoped for the internal adapter layer.
  @Post('webhooks')
  @UseGuards(AuthGuard)
  webhook(@Req() req: AuthenticatedRequest, @Body() dto: PaymentWebhookDto) {
    return this.payments.webhook(req.user!.tenantId, dto);
  }
}
