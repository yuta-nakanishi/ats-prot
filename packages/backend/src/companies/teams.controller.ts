import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { Permission } from '../permissions/decorators/permission.decorator';
import { PermissionAction, PermissionResource } from '../permissions/entities/permission.entity';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('teams')
@Controller('teams')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Permission(PermissionAction.CREATE, PermissionResource.TEAM)
  @ApiOperation({ summary: 'チームを作成する' })
  @ApiResponse({ status: 201, description: 'チームが正常に作成された' })
  create(@Body() createTeamDto: CreateTeamDto, @UserDecorator() user: User) {
    return this.teamsService.create(createTeamDto, user);
  }

  @Get()
  @Permission(PermissionAction.READ, PermissionResource.TEAM)
  @ApiOperation({ summary: 'チーム一覧を取得する' })
  @ApiResponse({ status: 200, description: 'チーム一覧を返す' })
  @ApiQuery({ name: 'departmentId', required: false, description: '部署IDでフィルタリング' })
  findAll(@UserDecorator() user: User, @Query('departmentId') departmentId?: string) {
    return this.teamsService.findAllByCompany(user.companyId, departmentId);
  }

  @Get(':id')
  @Permission(PermissionAction.READ, PermissionResource.TEAM)
  @ApiOperation({ summary: '特定のチームを取得する' })
  @ApiResponse({ status: 200, description: 'チーム情報を返す' })
  @ApiResponse({ status: 404, description: 'チームが見つからない' })
  findOne(@Param('id') id: string, @UserDecorator() user: User) {
    return this.teamsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Permission(PermissionAction.UPDATE, PermissionResource.TEAM)
  @ApiOperation({ summary: 'チーム情報を更新する' })
  @ApiResponse({ status: 200, description: 'チームが正常に更新された' })
  @ApiResponse({ status: 404, description: 'チームが見つからない' })
  update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @UserDecorator() user: User,
  ) {
    return this.teamsService.update(id, updateTeamDto, user.companyId);
  }

  @Delete(':id')
  @Permission(PermissionAction.DELETE, PermissionResource.TEAM)
  @ApiOperation({ summary: 'チームを削除する' })
  @ApiResponse({ status: 200, description: 'チームが正常に削除された' })
  @ApiResponse({ status: 404, description: 'チームが見つからない' })
  remove(@Param('id') id: string, @UserDecorator() user: User) {
    return this.teamsService.remove(id, user.companyId);
  }
} 