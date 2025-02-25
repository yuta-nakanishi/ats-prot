import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: 'チーム名' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'チームの説明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '所属部署ID' })
  @IsNotEmpty()
  @IsUUID()
  departmentId: string;
} 