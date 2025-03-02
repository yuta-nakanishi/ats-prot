import { IsString, IsEnum, IsOptional, IsUUID, IsArray } from 'class-validator';
import { EmailTemplateType } from '../entities/email-template.entity';

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsEnum(['interview_invitation', 'offer', 'rejection', 'general'])
  type: EmailTemplateType;

  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @IsOptional()
  @IsUUID()
  companyId?: string;
} 