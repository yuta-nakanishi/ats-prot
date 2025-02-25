import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '../entities/permission.entity';

export interface RequiredPermission {
  action: PermissionAction;
  resource: PermissionResource;
}

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (action: PermissionAction, resource: PermissionResource) => 
  SetMetadata(PERMISSION_KEY, { action, resource });

// コントローラー内でのインポート互換性のためのエイリアス
export const Permission = RequirePermission; 