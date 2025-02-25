import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true; // 権限要件が指定されていない場合はアクセスを許可
    }

    const { user, params } = context.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException('認証が必要です');
    }

    // リソースIDがパラメータから取得できる場合
    const resourceId = params?.id;

    return this.permissionsService.hasUserPermission(
      user.id,
      requiredPermission.action,
      requiredPermission.resource,
      resourceId
    );
  }
} 