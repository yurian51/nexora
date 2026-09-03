import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateVoucherBatchDto {
  @IsUUID()
  packageId!: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  quantity!: number;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(31536000)
  expiresInSeconds?: number;
}

export class RedeemVoucherDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsUUID()
  routerId?: string;
}
