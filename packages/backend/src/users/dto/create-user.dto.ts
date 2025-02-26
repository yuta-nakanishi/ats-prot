import { IsEmail, IsString, IsOptional, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../auth/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'ユーザーのメールアドレス' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ユーザーの名前' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'ユーザーの初期パスワード（設定しない場合は自動生成）' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ 
    description: 'ユーザーのロール', 
    enum: UserRole,
    default: UserRole.RECRUITER 
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: '所属企業のID' })
  @IsUUID()
  companyId: string;

  @ApiPropertyOptional({ description: '所属部署のID' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: '所属チームのID' })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({ description: '役職' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({ description: '電話番号' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: '企業管理者権限の有無', default: false })
  @IsBoolean()
  @IsOptional()
  isCompanyAdmin?: boolean;
} 