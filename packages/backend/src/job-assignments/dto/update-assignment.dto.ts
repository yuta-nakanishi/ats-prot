import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentRole } from '../entities/job-assignment.entity';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ 
    description: '担当者の役割',
    enum: AssignmentRole
  })
  @IsEnum(AssignmentRole)
  @IsOptional()
  role?: AssignmentRole;

  @ApiPropertyOptional({ 
    description: '通知の有効・無効'
  })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({ description: '備考・メモ' })
  @IsString()
  @IsOptional()
  notes?: string;
} 