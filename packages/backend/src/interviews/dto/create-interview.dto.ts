import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewType, InterviewStatus, InterviewLocation } from '../entities/interview.entity';

export class CreateInterviewDto {
  @ApiProperty({ enum: ['initial', 'technical', 'cultural', 'final'] })
  @IsEnum(['initial', 'technical', 'cultural', 'final'])
  type: InterviewType;

  @ApiProperty({ example: '2024-03-20' })
  @IsString()
  date: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  time: string;

  @ApiProperty({ example: '鈴木 部長' })
  @IsString()
  interviewer: string;

  @ApiProperty({ enum: ['online', 'office'] })
  @IsEnum(['online', 'office'])
  location: InterviewLocation;

  @ApiProperty({ enum: ['scheduled', 'completed', 'cancelled'] })
  @IsEnum(['scheduled', 'completed', 'cancelled'])
  status: InterviewStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty()
  @IsString()
  candidateId: string;
}