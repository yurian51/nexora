import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreatePackageDto, ListPackagesQueryDto, UpdatePackageDto } from './packages.dto';
import { PackagesService } from './packages.service';

@Controller('packages')
@UseGuards(AuthGuard)
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}
  @Get() list(@Req() req: AuthenticatedRequest, @Query() query: ListPackagesQueryDto) { return this.packages.list(req.user!.tenantId, query); }
  @Get(':id') get(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.packages.get(req.user!.tenantId, id); }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePackageDto) { return this.packages.create(req.user!.tenantId, dto); }
  @Put(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdatePackageDto) { return this.packages.update(req.user!.tenantId, id, dto); }
  @Delete(':id') deactivate(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.packages.deactivate(req.user!.tenantId, id); }
}
