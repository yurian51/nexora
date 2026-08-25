import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query('search') search?: string) {
    return this.customers.list(req.user!.tenantId, search);
  }

  @Get(':id')
  get(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.customers.get(req.user!.tenantId, id);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCustomerDto) {
    return this.customers.create(req.user!.tenantId, dto);
  }

  @Put(':id')
  update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customers.update(req.user!.tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.customers.deactivate(req.user!.tenantId, id);
  }
}
