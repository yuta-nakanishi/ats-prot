import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { EmailTemplateType } from '../entities/email-template.entity';

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsEnum(['interview_invitation', 'offer', 'rejection', 'general'])
  type?: EmailTemplateType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 