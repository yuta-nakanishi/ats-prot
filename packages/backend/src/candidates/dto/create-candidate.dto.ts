import { IsString, IsEmail, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CandidateStatus } from '../entities/candidate.entity';

export class CreateCandidateDto {
  @ApiProperty({ example: '山田 太郎' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'taro.yamada@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'フロントエンドエンジニア' })
  @IsString()
  role: string;

  @ApiProperty({ enum: ['new', 'reviewing', 'interviewed', 'offered', 'rejected'] })
  @IsEnum(['new', 'reviewing', 'interviewed', 'offered', 'rejected'])
  status: CandidateStatus;

  @ApiProperty({ example: 5 })
  @IsNumber()
  experience: number;

  @ApiProperty({ example: ['React', 'TypeScript'] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ example: 7000000, required: false })
  @IsOptional()
  @IsNumber()
  expectedSalary?: number;

  @ApiProperty({ example: 6000000, required: false })
  @IsOptional()
  @IsNumber()
  currentSalary?: number;

  @ApiProperty({ example: 'リファラル' })
  @IsString()
  source: string;

  @ApiProperty({ example: '東京' })
  @IsString()
  location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsString()
  jobPostingId: string;
}