import { IsNotEmpty, IsUUID, IsEnum, IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionAction } from '../entities/permission.entity';

export class CreateResourcePermissionDto {
  @ApiProperty({ description: 'ユーザーID' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'リソースタイプ（例: job_posting, candidate, interview）' })
  @IsNotEmpty()
  @IsString()
  resourceType: string;

  @ApiProperty({ description: 'リソースID' })
  @IsNotEmpty()
  @IsUUID()
  resourceId: string;

  @ApiProperty({ description: '権限アクション', enum: PermissionAction })
  @IsNotEmpty()
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiPropertyOptional({ description: '権限の付与状態（true: 付与、false: 拒否）', default: true })
  @IsOptional()
  @IsBoolean()
  isGranted?: boolean = true;
}

export class UpdateResourcePermissionDto {
  @ApiPropertyOptional({ description: '権限の付与状態（true: 付与、false: 拒否）' })
  @IsNotEmpty()
  @IsBoolean()
  isGranted: boolean;
} 