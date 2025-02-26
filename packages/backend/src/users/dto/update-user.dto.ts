import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../auth/entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'ユーザーの名前' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    description: 'ユーザーのロール', 
    enum: UserRole 
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: '所属部署のID' })
  @IsUUID()
  @IsOptional()
  departmentId?: string | null;

  @ApiPropertyOptional({ description: '所属チームのID' })
  @IsUUID()
  @IsOptional()
  teamId?: string | null;

  @ApiPropertyOptional({ description: '役職' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({ description: '電話番号' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: '企業管理者権限の有無' })
  @IsBoolean()
  @IsOptional()
  isCompanyAdmin?: boolean;

  @ApiPropertyOptional({ description: 'アカウントのアクティブ状態' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 