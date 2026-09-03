import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength, Min, Max } from 'class-validator';

const toInt = ({ value }: { value: unknown }) => value === undefined || value === '' ? value : Number(value);
const toBoolean = ({ value }: { value: unknown }) => value === undefined || value === '' ? value : value === true || value === 'true';

export class ListCustomersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @Transform(toInt)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  page = 1;

  @Transform(toInt)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(32)
  username!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCustomerDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) fullName?: string;
  @IsOptional() @IsEmail() @MaxLength(160) email?: string;
  @IsOptional() @IsString() @MaxLength(32) phone?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
