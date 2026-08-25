import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreateCustomerDto } from './customers.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('search') search?: string) {
    return this.customers.list(request.user!.tenantId, search);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() input: CreateCustomerDto) {
    return this.customers.create(request.user!.tenantId, input);
  }
}
