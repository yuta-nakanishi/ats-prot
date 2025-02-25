import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionAction, PermissionResource } from './entities/permission.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '全ての権限を取得' })
  @ApiResponse({ status: 200, description: '権限のリスト' })
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '権限チェック' })
  @ApiQuery({ name: 'action', enum: PermissionAction, required: true })
  @ApiQuery({ name: 'resource', enum: PermissionResource, required: true })
  @ApiResponse({ status: 200, description: '権限チェック結果' })
  async checkPermission(
    @Request() req: any,
    @Query('action') action: PermissionAction,
    @Query('resource') resource: PermissionResource,
  ) {
    const userId = req.user.id;
    const hasPermission = await this.permissionsService.hasUserPermission(
      userId,
      action,
      resource
    );
    
    return { hasPermission };
  }

  @Get('check-resource')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'リソース特有の権限チェック' })
  @ApiQuery({ name: 'action', enum: PermissionAction, required: true })
  @ApiQuery({ name: 'resourceType', required: true })
  @ApiQuery({ name: 'resourceId', required: true })
  @ApiResponse({ status: 200, description: 'リソース権限チェック結果' })
  async checkResourcePermission(
    @Request() req: any,
    @Query('action') action: PermissionAction,
    @Query('resourceType') resourceType: string,
    @Query('resourceId') resourceId: string,
  ) {
    const userId = req.user.id;
    const hasPermission = await this.permissionsService.hasUserResourcePermission(
      userId,
      action,
      resourceType,
      resourceId
    );
    
    return { hasPermission };
  }
} 