// エンティティのエクスポート
export * from './entities/permission.entity';
export * from './entities/role-permission.entity';
export * from './entities/custom-role.entity';
export * from './entities/custom-role-permission.entity';
export * from './entities/user-custom-role.entity';
export * from './entities/resource-permission.entity';

// DTOのエクスポート
export * from './dto/create-custom-role.dto';
export * from './dto/update-custom-role.dto';
export * from './dto/resource-permission.dto';

// デコレータのエクスポート
export { RequirePermission, RequiredPermission, PERMISSION_KEY } from './decorators/permission.decorator';
// Permissionデコレータは名前衝突のため、明示的にエクスポートしない

// ガードのエクスポート
export * from './guards/permissions.guard';

// サービスとコントローラーのエクスポート
export * from './permissions.service';
export * from './custom-roles.service';
export * from './resource-permissions.service';
export * from './custom-roles.controller';
export * from './resource-permissions.controller';

// モジュールのエクスポート
export * from './permissions.module'; 