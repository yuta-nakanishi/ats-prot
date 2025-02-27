import { IsString, IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentRole } from '../entities/job-assignment.entity';

export class CreateAssignmentDto {
  @ApiProperty({ description: '担当者（ユーザー）のID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: '担当する求人のID' })
  @IsUUID()
  jobPostingId: string;

  @ApiPropertyOptional({ 
    description: '担当者の役割',
    enum: AssignmentRole,
    default: AssignmentRole.SECONDARY
  })
  @IsEnum(AssignmentRole)
  @IsOptional()
  role?: AssignmentRole;

  @ApiPropertyOptional({ 
    description: '通知の有効・無効',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({ description: '備考・メモ' })
  @IsString()
  @IsOptional()
  notes?: string;
} 