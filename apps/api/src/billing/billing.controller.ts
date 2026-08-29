import { Body, Controller, Get, Headers, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreateWifiPurchaseDto, InitiatePaymentDto, PaymentWebhookDto } from './billing.dto';
import { BillingService } from './billing.service';

type WebhookRequest = { rawBody?: Buffer; params: { provider: string } };

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('purchases')
  @UseGuards(AuthGuard)
  listPurchases(@Req() req: AuthenticatedRequest, @Query('customerId') customerId?: string) {
    return this.billing.listPurchases(req.user!.tenantId, customerId);
  }

  @Post('purchases')
  @UseGuards(AuthGuard)
  createPurchase(@Req() req: AuthenticatedRequest, @Body() dto: CreateWifiPurchaseDto) {
    return this.billing.createPurchase(req.user!.tenantId, dto);
  }

  @Post('payments')
  @UseGuards(AuthGuard)
  initiatePayment(@Req() req: AuthenticatedRequest, @Body() dto: InitiatePaymentDto) {
    return this.billing.initiatePayment(req.user!.tenantId, dto);
  }

  @Post('webhooks/:provider')
  async paymentWebhook(
    @Req() req: WebhookRequest,
    @Headers('x-nexora-signature') signature: string | undefined,
    @Headers('x-payment-signature') providerSignature: string | undefined,
    @Body() dto: PaymentWebhookDto,
  ) {
    if (!req.rawBody) throw new UnauthorizedException('Raw webhook body is unavailable');
    this.billing.verifyWebhookSignature(req.rawBody, signature ?? providerSignature);
    return this.billing.processPaymentWebhook(req.params.provider, dto);
  }
}
