import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { Permission } from '../permissions/decorators/permission.decorator';
import { PermissionAction, PermissionResource } from '../permissions/entities/permission.entity';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('departments')
@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Permission(PermissionAction.CREATE, PermissionResource.DEPARTMENT)
  @ApiOperation({ summary: '部署を作成する' })
  @ApiResponse({ status: 201, description: '部署が正常に作成された' })
  create(@Body() createDepartmentDto: CreateDepartmentDto, @UserDecorator() user: User) {
    return this.departmentsService.create(createDepartmentDto, user);
  }

  @Get()
  @Permission(PermissionAction.READ, PermissionResource.DEPARTMENT)
  @ApiOperation({ summary: '部署一覧を取得する' })
  @ApiResponse({ status: 200, description: '部署一覧を返す' })
  findAll(@UserDecorator() user: User) {
    return this.departmentsService.findAllByCompany(user.companyId);
  }

  @Get(':id')
  @Permission(PermissionAction.READ, PermissionResource.DEPARTMENT)
  @ApiOperation({ summary: '特定の部署を取得する' })
  @ApiResponse({ status: 200, description: '部署情報を返す' })
  @ApiResponse({ status: 404, description: '部署が見つからない' })
  findOne(@Param('id') id: string, @UserDecorator() user: User) {
    return this.departmentsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Permission(PermissionAction.UPDATE, PermissionResource.DEPARTMENT)
  @ApiOperation({ summary: '部署情報を更新する' })
  @ApiResponse({ status: 200, description: '部署が正常に更新された' })
  @ApiResponse({ status: 404, description: '部署が見つからない' })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @UserDecorator() user: User,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto, user.companyId);
  }

  @Delete(':id')
  @Permission(PermissionAction.DELETE, PermissionResource.DEPARTMENT)
  @ApiOperation({ summary: '部署を削除する' })
  @ApiResponse({ status: 200, description: '部署が正常に削除された' })
  @ApiResponse({ status: 404, description: '部署が見つからない' })
  remove(@Param('id') id: string, @UserDecorator() user: User) {
    return this.departmentsService.remove(id, user.companyId);
  }
} 