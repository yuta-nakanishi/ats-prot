import { IsString, IsEmail, MinLength, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '山田 太郎' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCompanyAdmin?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @ApiProperty({ required: false, enum: UserRole, default: UserRole.RECRUITER })
  @IsOptional()
  @IsString()
  role?: UserRole;
}