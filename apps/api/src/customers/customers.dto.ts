import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(5, 32)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(3, 100)
  username?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
