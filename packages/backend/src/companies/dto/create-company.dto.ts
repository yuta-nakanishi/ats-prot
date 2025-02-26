import { IsNotEmpty, IsOptional, IsString, IsEmail, IsEnum, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyPlanType } from '../entities/company.entity';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '株式会社サンプル' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'IT', required: false })
  industry?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '東京都渋谷区〇〇', required: false })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '03-1234-5678', required: false })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'https://example.com', required: false })
  websiteUrl?: string;

  @IsOptional()
  @IsEnum(CompanyPlanType)
  @ApiProperty({ enum: CompanyPlanType, default: CompanyPlanType.BASIC })
  planType?: CompanyPlanType;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'tenantId' })
  tenantId?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'admin@example.com' })
  adminEmail?: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 