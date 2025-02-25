import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PermissionsService } from '../../permissions/permissions.service';
import { PermissionAction, PermissionResource } from '../../permissions/entities/permission.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<{ action: PermissionAction; resource: PermissionResource }>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // 必要な権限が指定されていない場合はアクセスを許可
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('認証が必要です');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      request.user = decoded;

      // ユーザーの役割を取得（デコードしたJWTから）
      const userRole = decoded.role as UserRole;

      // 指定されたアクションとリソースに対する権限を持っているか確認
      const hasPermission = await this.permissionsService.hasPermission(
        userRole,
        requiredPermission.action,
        requiredPermission.resource,
      );

      if (!hasPermission) {
        throw new ForbiddenException('このアクションを実行する権限がありません');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('認証に失敗しました');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
} 