import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: '部署名' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '部署の説明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '所属企業ID（ログインユーザーの企業IDが自動入力される場合は不要）' })
  @IsOptional()
  @IsUUID()
  companyId?: string;
} 