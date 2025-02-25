import { IsString, IsEnum, IsUrl, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyPlanType } from '../entities/company.entity';

export class CreateCompanyDto {
  @ApiProperty({ example: '株式会社サンプル' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'IT', required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ example: '東京都渋谷区〇〇', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '03-1234-5678', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiProperty({ enum: CompanyPlanType, default: CompanyPlanType.BASIC })
  @IsEnum(CompanyPlanType)
  planType: CompanyPlanType;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 