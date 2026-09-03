import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreateVoucherBatchDto, RedeemVoucherDto } from './vouchers.dto';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
@UseGuards(AuthGuard)
export class VouchersController {
  constructor(private readonly vouchers: VouchersService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) { return this.vouchers.list(req.user!.tenantId); }

  @Post('batches')
  createBatch(@Req() req: AuthenticatedRequest, @Body() dto: CreateVoucherBatchDto) { return this.vouchers.createBatch(req.user!.tenantId, dto); }

  @Post(':code/redeem')
  redeem(@Req() req: AuthenticatedRequest, @Param('code') code: string, @Body() dto: RedeemVoucherDto) { return this.vouchers.redeem(req.user!.tenantId, code, dto); }
}
