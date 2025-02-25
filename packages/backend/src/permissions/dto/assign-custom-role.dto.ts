import { IsNotEmpty, IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCustomRoleDto {
  @ApiProperty({ description: 'ユーザーID' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'カスタムロールID' })
  @IsNotEmpty()
  @IsUUID()
  customRoleId: string;
}

export class AssignCustomRolesToUserDto {
  @ApiProperty({ description: 'カスタムロールIDのリスト' })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  customRoleIds: string[];
}

export class AssignUsersToCustomRoleDto {
  @ApiProperty({ description: 'ユーザーIDのリスト' })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  userIds: string[];
} 