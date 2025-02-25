import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ResourcePermissionsService } from './resource-permissions.service';
import { CreateResourcePermissionDto, UpdateResourcePermissionDto } from './dto/resource-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permission } from './decorators/permission.decorator';
import { PermissionAction, PermissionResource } from './entities/permission.entity';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('resource-permissions')
@Controller('resource-permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ResourcePermissionsController {
  constructor(private readonly resourcePermissionsService: ResourcePermissionsService) {}

  @Post()
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'リソース権限を作成/更新する' })
  @ApiResponse({ status: 201, description: 'リソース権限が正常に作成/更新された' })
  create(@Body() createResourcePermissionDto: CreateResourcePermissionDto, @UserDecorator() user: User) {
    return this.resourcePermissionsService.create(createResourcePermissionDto, user);
  }

  @Get()
  @Permission(PermissionAction.READ, PermissionResource.USER)
  @ApiOperation({ summary: 'リソース権限一覧を取得する' })
  @ApiResponse({ status: 200, description: 'リソース権限一覧を返す' })
  @ApiQuery({ name: 'userId', required: false, description: 'ユーザーIDでフィルタリング' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'リソースタイプでフィルタリング' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'リソースIDでフィルタリング' })
  @ApiQuery({ name: 'action', required: false, description: 'アクションでフィルタリング' })
  findAll(
    @Query('userId') userId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('action') action?: PermissionAction,
  ) {
    return this.resourcePermissionsService.findAll({
      userId,
      resourceType,
      resourceId,
      action,
    });
  }

  @Get(':id')
  @Permission(PermissionAction.READ, PermissionResource.USER)
  @ApiOperation({ summary: '特定のリソース権限を取得する' })
  @ApiResponse({ status: 200, description: 'リソース権限情報を返す' })
  @ApiResponse({ status: 404, description: 'リソース権限が見つからない' })
  findOne(@Param('id') id: string) {
    return this.resourcePermissionsService.findOne(id);
  }

  @Patch(':id')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'リソース権限情報を更新する' })
  @ApiResponse({ status: 200, description: 'リソース権限が正常に更新された' })
  @ApiResponse({ status: 404, description: 'リソース権限が見つからない' })
  update(
    @Param('id') id: string,
    @Body() updateResourcePermissionDto: UpdateResourcePermissionDto,
  ) {
    return this.resourcePermissionsService.update(id, updateResourcePermissionDto);
  }

  @Delete(':id')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: 'リソース権限を削除する' })
  @ApiResponse({ status: 200, description: 'リソース権限が正常に削除された' })
  @ApiResponse({ status: 404, description: 'リソース権限が見つからない' })
  remove(@Param('id') id: string) {
    return this.resourcePermissionsService.remove(id);
  }

  @Delete('resource/:resourceType/:resourceId')
  @Permission(PermissionAction.MANAGE, PermissionResource.USER)
  @ApiOperation({ summary: '特定リソースのすべての権限設定を削除する' })
  @ApiResponse({ status: 200, description: 'リソース権限が正常に削除された' })
  removeAllByResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.resourcePermissionsService.removeAllByResource(resourceType, resourceId);
  }
} 