import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '../../permissions/entities/permission.entity';

export const RequirePermission = (action: PermissionAction, resource: PermissionResource) =>
  SetMetadata('permission', { action, resource }); 