import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '現在のパスワード' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: '新しいパスワード（8文字以上）' })
  @IsString()
  @MinLength(8)
  newPassword: string;
} 