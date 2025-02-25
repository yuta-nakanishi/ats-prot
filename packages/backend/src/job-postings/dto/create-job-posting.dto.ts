import { IsString, IsEnum, IsArray, IsInt, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobPostingStatus, EmploymentType } from '../entities/job-posting.entity';

export class CreateJobPostingDto {
  @ApiProperty({ example: 'シニアフロントエンドエンジニア' })
  @IsString()
  title: string;

  @ApiProperty({ example: '開発部' })
  @IsString()
  department: string;

  @ApiProperty({ example: '東京' })
  @IsString()
  location: string;

  @ApiProperty({ enum: ['full-time', 'part-time', 'contract'] })
  @IsEnum(['full-time', 'part-time', 'contract'])
  employmentType: EmploymentType;

  @ApiProperty({ enum: ['open', 'closed', 'draft'] })
  @IsEnum(['open', 'closed', 'draft'])
  status: JobPostingStatus;

  @ApiProperty({ example: 'モダンなWebアプリケーションの開発をリードする...' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['5年以上のフロントエンド開発経験'] })
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty({ example: ['Next.js', 'GraphQL'] })
  @IsArray()
  @IsString({ each: true })
  preferredSkills: string[];

  @ApiProperty({ example: 6000000 })
  @IsInt()
  salaryRangeMin: number;

  @ApiProperty({ example: 10000000 })
  @IsInt()
  salaryRangeMax: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  closingDate?: string;
}