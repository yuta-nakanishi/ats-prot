import { IsString, IsEmail, IsNumber, IsOptional, IsArray, IsEnum, IsObject, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CandidateStatus, CandidateSource } from '../entities/candidate.entity';

export class CreateCandidateDto {
  @ApiProperty({ example: '山田 太郎' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'taro.yamada@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '090-1234-5678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'フロントエンドエンジニア', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ enum: ['new', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected', 'withdrawn'], default: 'new' })
  @IsEnum(['new', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected', 'withdrawn'])
  @IsOptional()
  status?: CandidateStatus;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  experience?: number;

  @ApiProperty({ example: ['React', 'TypeScript'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ example: '600万円', required: false })
  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @ApiProperty({ example: '株式会社テックスタート', required: false })
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiProperty({ enum: ['company_website', 'indeed', 'linkedin', 'referral', 'agency', 'job_fair', 'other'], default: 'other' })
  @IsEnum(['company_website', 'indeed', 'linkedin', 'referral', 'agency', 'job_fair', 'other'])
  @IsOptional()
  source?: CandidateSource;

  @ApiProperty({ example: '東京', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '1990-05-15', required: false })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({ example: '1ヶ月後', required: false })
  @IsOptional()
  @IsString()
  availableFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  urls?: {
    website?: string;
    linkedin?: string;
    github?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resumeFileName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resumeFilePath?: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobId?: string;
}