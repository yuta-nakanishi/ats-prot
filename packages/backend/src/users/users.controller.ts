import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'ユーザー一覧を取得' })
  @ApiResponse({ status: 200, description: 'ユーザー一覧を返します', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ユーザー詳細を取得' })
  @ApiParam({ name: 'id', description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: 'ユーザー詳細を返します', type: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'ユーザーを新規作成' })
  @ApiResponse({ status: 201, description: 'ユーザーが作成されました', type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ユーザー情報を更新' })
  @ApiParam({ name: 'id', description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: 'ユーザー情報が更新されました', type: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ユーザーを削除' })
  @ApiParam({ name: 'id', description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: 'ユーザーが削除されました' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/change-password')
  @ApiOperation({ summary: 'パスワードを変更' })
  @ApiParam({ name: 'id', description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: 'パスワードが変更されました' })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(id, changePasswordDto);
    return { message: 'パスワードが正常に変更されました' };
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'パスワードをリセット（管理者用）' })
  @ApiParam({ name: 'id', description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: '新しいパスワードが生成されました' })
  async resetPassword(@Param('id') id: string) {
    const newPassword = await this.usersService.resetPassword(id);
    return { message: 'パスワードがリセットされました', temporaryPassword: newPassword };
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'ユーザーアカウントを無効化' })
  @ApiParam({ name: 'id', description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: 'ユーザーが無効化されました', type: User })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'ユーザーアカウントを再有効化' })
  @ApiParam({ name: 'id', description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: 'ユーザーが再有効化されました', type: User })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }
}

// 企業ユーザー管理用のコントローラー
@ApiTags('companies')
@Controller('companies/:companyId/users')
@UseGuards(JwtAuthGuard)
export class CompanyUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '企業に所属するユーザー一覧を取得' })
  @ApiParam({ name: 'companyId', description: '企業ID' })
  @ApiResponse({ status: 200, description: 'ユーザー一覧を返します', type: [User] })
  findByCompany(@Param('companyId') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('企業IDが必要です');
    }
    return this.usersService.findByCompany(companyId);
  }

  @Post()
  @ApiOperation({ summary: '企業に所属するユーザーを新規作成' })
  @ApiParam({ name: 'companyId', description: '企業ID' })
  @ApiResponse({ status: 201, description: 'ユーザーが作成されました', type: User })
  createForCompany(
    @Param('companyId') companyId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    if (!companyId) {
      throw new BadRequestException('企業IDが必要です');
    }
    
    // DTOに企業IDをセット（パスの値を優先）
    createUserDto.companyId = companyId;
    
    return this.usersService.create(createUserDto);
  }
} 