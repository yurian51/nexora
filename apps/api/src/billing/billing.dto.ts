import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateWifiPurchaseDto {
  @IsUUID() customerId!: string;
  @IsUUID() packageId!: string;
  @IsOptional() @IsUUID() routerId?: string;
}

export class InitiatePaymentDto {
  @IsUUID() purchaseId!: string;
  @IsString() @MinLength(2) @MaxLength(40) provider!: string;
  @IsString() @MinLength(8) @MaxLength(100) idempotencyKey!: string;
  @IsOptional() @IsString() @MaxLength(32) phone?: string;
}
