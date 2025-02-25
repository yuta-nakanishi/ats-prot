import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomRoleDto {
  @ApiProperty({ description: 'カスタムロール名' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'カスタムロールの説明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '企業ID（ログインユーザーの企業IDが自動設定される場合は不要）' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: '付与する権限IDのリスト' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  permissionIds?: string[];
} 