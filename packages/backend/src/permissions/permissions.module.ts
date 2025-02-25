import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CustomRole } from './entities/custom-role.entity';
import { CustomRolePermission } from './entities/custom-role-permission.entity';
import { UserCustomRole } from './entities/user-custom-role.entity';
import { ResourcePermission } from './entities/resource-permission.entity';
import { PermissionsService } from './permissions.service';
import { CustomRolesService } from './custom-roles.service';
import { ResourcePermissionsService } from './resource-permissions.service';
import { CustomRolesController } from './custom-roles.controller';
import { ResourcePermissionsController } from './resource-permissions.controller';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      RolePermission,
      CustomRole,
      CustomRolePermission,
      UserCustomRole,
      ResourcePermission,
    ]),
  ],
  controllers: [CustomRolesController, ResourcePermissionsController, PermissionsController],
  providers: [PermissionsService, CustomRolesService, ResourcePermissionsService],
  exports: [PermissionsService, CustomRolesService, ResourcePermissionsService],
})
export class PermissionsModule {} 