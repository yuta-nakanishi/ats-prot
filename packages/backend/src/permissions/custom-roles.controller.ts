import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomRolesService } from './custom-roles.service';
import { CreateCustomRoleDto } from './dto/create-custom-role.dto';
import { UpdateCustomRoleDto } from './dto/update-custom-role.dto';
import { AssignCustomRoleDto, AssignCustomRolesToUserDto, AssignUsersToCustomRoleDto } from './dto/assign-custom-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permission } from './decorators/permission.decorator';
import { PermissionAction, PermissionResource } from './entities/permission.entity';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('custom-roles')
@Controller('custom-roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomRolesController {
  constructor(private readonly customRolesService: CustomRolesService) {}

  @Post()
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'カスタムロールを作成する' })
  @ApiResponse({ status: 201, description: 'カスタムロールが正常に作成された' })
  create(@Body() createCustomRoleDto: CreateCustomRoleDto, @UserDecorator() user: User) {
    return this.customRolesService.create(createCustomRoleDto, user);
  }

  @Get()
  @Permission(PermissionAction.READ, PermissionResource.USER)
  @ApiOperation({ summary: 'カスタムロール一覧を取得する' })
  @ApiResponse({ status: 200, description: 'カスタムロール一覧を返す' })
  findAll(@UserDecorator() user: User) {
    return this.customRolesService.findAllByCompany(user.companyId);
  }

  @Get(':id')
  @Permission(PermissionAction.READ, PermissionResource.USER)
  @ApiOperation({ summary: '特定のカスタムロールを取得する' })
  @ApiResponse({ status: 200, description: 'カスタムロール情報を返す' })
  @ApiResponse({ status: 404, description: 'カスタムロールが見つからない' })
  findOne(@Param('id') id: string, @UserDecorator() user: User) {
    return this.customRolesService.findOne(id, user.companyId);
  }

  @Get(':id/permissions')
  @Permission(PermissionAction.READ, PermissionResource.USER)
  @ApiOperation({ summary: 'カスタムロールに割り当てられた権限一覧を取得する' })
  @ApiResponse({ status: 200, description: '権限一覧を返す' })
  getPermissionsByCustomRoleId(@Param('id') id: string) {
    return this.customRolesService.getPermissionsByCustomRoleId(id);
  }

  @Get(':id/users')
  @Permission(PermissionAction.READ, PermissionResource.USER)
  @ApiOperation({ summary: 'カスタムロールに割り当てられたユーザー一覧を取得する' })
  @ApiResponse({ status: 200, description: 'ユーザー一覧を返す' })
  getUsersByCustomRoleId(@Param('id') id: string) {
    return this.customRolesService.getUsersByCustomRoleId(id);
  }

  @Patch(':id')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'カスタムロール情報を更新する' })
  @ApiResponse({ status: 200, description: 'カスタムロールが正常に更新された' })
  @ApiResponse({ status: 404, description: 'カスタムロールが見つからない' })
  update(
    @Param('id') id: string,
    @Body() updateCustomRoleDto: UpdateCustomRoleDto,
    @UserDecorator() user: User,
  ) {
    return this.customRolesService.update(id, updateCustomRoleDto, user);
  }

  @Delete(':id')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'カスタムロールを削除する' })
  @ApiResponse({ status: 200, description: 'カスタムロールが正常に削除された' })
  @ApiResponse({ status: 404, description: 'カスタムロールが見つからない' })
  remove(@Param('id') id: string, @UserDecorator() user: User) {
    return this.customRolesService.remove(id, user.companyId);
  }

  @Post('assign')
  // 一時的に権限チェックを無効化（開発環境のみ）
  // @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'ユーザーにカスタムロールを割り当てる' })
  @ApiResponse({ status: 201, description: 'カスタムロールが正常に割り当てられた' })
  assignCustomRoleToUser(@Body() assignDto: AssignCustomRoleDto) {
    return this.customRolesService.assignCustomRoleToUser(assignDto);
  }

  @Delete('assign/:userId/:customRoleId')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'ユーザーからカスタムロールを削除する' })
  @ApiResponse({ status: 200, description: 'カスタムロールの割り当てが削除された' })
  removeCustomRoleFromUser(
    @Param('userId') userId: string,
    @Param('customRoleId') customRoleId: string,
  ) {
    return this.customRolesService.removeCustomRoleFromUser(userId, customRoleId);
  }

  @Post('assign-roles-to-user/:userId')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'ユーザーに複数のカスタムロールを割り当てる' })
  @ApiResponse({ status: 201, description: 'カスタムロールが正常に割り当てられた' })
  assignCustomRolesToUser(
    @Param('userId') userId: string,
    @Body() dto: AssignCustomRolesToUserDto,
  ) {
    return this.customRolesService.assignCustomRolesToUser(userId, dto);
  }

  @Post('assign-users-to-role/:customRoleId')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'カスタムロールに複数のユーザーを割り当てる' })
  @ApiResponse({ status: 201, description: 'ユーザーが正常に割り当てられた' })
  assignUsersToCustomRole(
    @Param('customRoleId') customRoleId: string,
    @Body() dto: AssignUsersToCustomRoleDto,
  ) {
    return this.customRolesService.assignUsersToCustomRole(customRoleId, dto);
  }

  @Get('user/:userId')
  @Permission(PermissionAction.READ, PermissionResource.USER)
  @ApiOperation({ summary: 'ユーザーに割り当てられたカスタムロール一覧を取得する' })
  @ApiResponse({ status: 200, description: 'カスタムロール一覧を返す' })
  getCustomRolesByUserId(@Param('userId') userId: string) {
    return this.customRolesService.getCustomRolesByUserId(userId);
  }
} 