import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  planId!: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;
}
