import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionAction, PermissionResource } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from '../auth/entities/user.entity';
import { UserCustomRole } from './entities/user-custom-role.entity';
import { CustomRolePermission } from './entities/custom-role-permission.entity';
import { ResourcePermission } from './entities/resource-permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionsRepository: Repository<RolePermission>,
    @InjectRepository(UserCustomRole)
    private userCustomRoleRepository: Repository<UserCustomRole>,
    @InjectRepository(CustomRolePermission)
    private customRolePermissionRepository: Repository<CustomRolePermission>,
    @InjectRepository(ResourcePermission)
    private resourcePermissionRepository: Repository<ResourcePermission>,
  ) {}

  async initializePermissions(): Promise<void> {
    // 権限が存在するか確認
    const count = await this.permissionsRepository.count();
    if (count > 0) {
      return; // 既に初期化済み
    }

    // 基本的な権限を定義
    const permissions = [
      // 企業管理
      this.createPermissionData('company:manage', PermissionAction.MANAGE, PermissionResource.COMPANY, '企業の完全な管理権限'),
      this.createPermissionData('company:read', PermissionAction.READ, PermissionResource.COMPANY, '企業情報の閲覧権限'),
      
      // ユーザー管理
      this.createPermissionData('user:manage', PermissionAction.MANAGE, PermissionResource.USER, 'ユーザーの完全な管理権限'),
      this.createPermissionData('user:read', PermissionAction.READ, PermissionResource.USER, 'ユーザー情報の閲覧権限'),
      
      // 部署管理
      this.createPermissionData('department:manage', PermissionAction.MANAGE, PermissionResource.DEPARTMENT, '部署の完全な管理権限'),
      this.createPermissionData('department:create', PermissionAction.CREATE, PermissionResource.DEPARTMENT, '部署の作成権限'),
      this.createPermissionData('department:read', PermissionAction.READ, PermissionResource.DEPARTMENT, '部署の閲覧権限'),
      this.createPermissionData('department:update', PermissionAction.UPDATE, PermissionResource.DEPARTMENT, '部署の更新権限'),
      this.createPermissionData('department:delete', PermissionAction.DELETE, PermissionResource.DEPARTMENT, '部署の削除権限'),
      
      // チーム管理
      this.createPermissionData('team:manage', PermissionAction.MANAGE, PermissionResource.TEAM, 'チームの完全な管理権限'),
      this.createPermissionData('team:create', PermissionAction.CREATE, PermissionResource.TEAM, 'チームの作成権限'),
      this.createPermissionData('team:read', PermissionAction.READ, PermissionResource.TEAM, 'チームの閲覧権限'),
      this.createPermissionData('team:update', PermissionAction.UPDATE, PermissionResource.TEAM, 'チームの更新権限'),
      this.createPermissionData('team:delete', PermissionAction.DELETE, PermissionResource.TEAM, 'チームの削除権限'),
      
      // 求人管理
      this.createPermissionData('job_posting:manage', PermissionAction.MANAGE, PermissionResource.JOB_POSTING, '求人の完全な管理権限'),
      this.createPermissionData('job_posting:create', PermissionAction.CREATE, PermissionResource.JOB_POSTING, '求人の作成権限'),
      this.createPermissionData('job_posting:read', PermissionAction.READ, PermissionResource.JOB_POSTING, '求人の閲覧権限'),
      this.createPermissionData('job_posting:update', PermissionAction.UPDATE, PermissionResource.JOB_POSTING, '求人の更新権限'),
      
      // 候補者管理
      this.createPermissionData('candidate:manage', PermissionAction.MANAGE, PermissionResource.CANDIDATE, '候補者の完全な管理権限'),
      this.createPermissionData('candidate:create', PermissionAction.CREATE, PermissionResource.CANDIDATE, '候補者の作成権限'),
      this.createPermissionData('candidate:read', PermissionAction.READ, PermissionResource.CANDIDATE, '候補者の閲覧権限'),
      this.createPermissionData('candidate:update', PermissionAction.UPDATE, PermissionResource.CANDIDATE, '候補者の更新権限'),
      
      // 面接管理
      this.createPermissionData('interview:manage', PermissionAction.MANAGE, PermissionResource.INTERVIEW, '面接の完全な管理権限'),
      this.createPermissionData('interview:create', PermissionAction.CREATE, PermissionResource.INTERVIEW, '面接の作成権限'),
      this.createPermissionData('interview:read', PermissionAction.READ, PermissionResource.INTERVIEW, '面接の閲覧権限'),
      this.createPermissionData('interview:update', PermissionAction.UPDATE, PermissionResource.INTERVIEW, '面接の更新権限'),
      
      // 評価管理
      this.createPermissionData('evaluation:manage', PermissionAction.MANAGE, PermissionResource.EVALUATION, '評価の完全な管理権限'),
      this.createPermissionData('evaluation:create', PermissionAction.CREATE, PermissionResource.EVALUATION, '評価の作成権限'),
      this.createPermissionData('evaluation:read', PermissionAction.READ, PermissionResource.EVALUATION, '評価の閲覧権限'),
      
      // レポート管理
      this.createPermissionData('report:read', PermissionAction.READ, PermissionResource.REPORT, 'レポートの閲覧権限'),
    ];

    // 権限をデータベースに保存
    const savedPermissions = await this.permissionsRepository.save(permissions);

    // ロールと権限のマッピングを定義
    const rolePermissionMappings = [
      // 企業管理者 - すべての権限
      ...savedPermissions.map(permission => ({
        role: UserRole.COMPANY_ADMIN,
        permissionId: permission.id
      })),
      
      // 採用マネージャー
      ...savedPermissions
        .filter(p => {
          // 企業とユーザー管理は閲覧権限のみ付与
          if (p.resource === PermissionResource.COMPANY && p.action === PermissionAction.READ) return true;
          if (p.resource === PermissionResource.USER && p.action === PermissionAction.READ) return true;
          
          // 部署とチームは読み取りと更新の権限
          if (p.resource === PermissionResource.DEPARTMENT && 
              (p.action === PermissionAction.READ || p.action === PermissionAction.UPDATE)) return true;
          if (p.resource === PermissionResource.TEAM && 
              (p.action === PermissionAction.READ || p.action === PermissionAction.UPDATE || 
               p.action === PermissionAction.CREATE)) return true;
          
          // その他のリソースは全ての権限
          if (p.resource !== PermissionResource.COMPANY && p.resource !== PermissionResource.USER && 
              p.resource !== PermissionResource.DEPARTMENT) return true;
          
          return false;
        })
        .map(permission => ({
          role: UserRole.HIRING_MANAGER,
          permissionId: permission.id
        })),
      
      // 採用担当者
      ...savedPermissions
        .filter(p => {
          // 企業、ユーザー、部署、チームは閲覧権限のみ
          if ((p.resource === PermissionResource.COMPANY || 
               p.resource === PermissionResource.USER ||
               p.resource === PermissionResource.DEPARTMENT ||
               p.resource === PermissionResource.TEAM) && 
              p.action === PermissionAction.READ) return true;
          
          if (p.resource === PermissionResource.JOB_POSTING && p.action === PermissionAction.READ) return true;
          if (p.resource === PermissionResource.CANDIDATE) return true;
          if (p.resource === PermissionResource.INTERVIEW) return true;
          if (p.resource === PermissionResource.EVALUATION) return true;
          if (p.resource === PermissionResource.REPORT && p.action === PermissionAction.READ) return true;
          return false;
        })
        .map(permission => ({
          role: UserRole.RECRUITER,
          permissionId: permission.id
        })),
      
      // 面接官
      ...savedPermissions
        .filter(p => {
          // 部署とチームは閲覧権限のみ
          if ((p.resource === PermissionResource.DEPARTMENT || 
               p.resource === PermissionResource.TEAM) && 
              p.action === PermissionAction.READ) return true;
          
          if (p.resource === PermissionResource.CANDIDATE && p.action === PermissionAction.READ) return true;
          if (p.resource === PermissionResource.INTERVIEW && p.action === PermissionAction.READ) return true;
          if (p.resource === PermissionResource.EVALUATION && (p.action === PermissionAction.CREATE || p.action === PermissionAction.READ)) return true;
          return false;
        })
        .map(permission => ({
          role: UserRole.INTERVIEWER,
          permissionId: permission.id
        })),
      
      // 閲覧専用
      ...savedPermissions
        .filter(p => p.action === PermissionAction.READ)
        .map(permission => ({
          role: UserRole.READONLY,
          permissionId: permission.id
        })),
    ];

    // ロールと権限のマッピングをデータベースに保存
    await this.rolePermissionsRepository.save(rolePermissionMappings);
  }

  private createPermissionData(
    name: string,
    action: PermissionAction,
    resource: PermissionResource,
    description: string,
  ): Partial<Permission> {
    return { name, action, resource, description };
  }

  async getPermissionsByRole(role: UserRole): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionsRepository.find({
      where: { role },
      relations: ['permission'],
    });
    
    return rolePermissions.map(rp => rp.permission);
  }

  async hasPermission(role: UserRole, action: PermissionAction, resource: PermissionResource): Promise<boolean> {
    // COMPANY_ADMINは常にすべての権限を持つ
    if (role === UserRole.COMPANY_ADMIN) {
      return true;
    }
    
    const count = await this.rolePermissionsRepository.count({
      where: {
        role,
        permission: {
          action,
          resource,
        }
      },
      relations: ['permission'],
    });
    
    return count > 0;
  }

  async hasUserPermission(
    userId: string,
    action: PermissionAction,
    resource: PermissionResource | string,
    resourceId?: string
  ): Promise<boolean> {
    // ユーザーとロールの情報を取得
    const user = await this.getUserWithRoleById(userId);
    if (!user) {
      return false;
    }

    // スーパー管理者またはCOMPANY_ADMINは常にすべての権限を持つ
    if (user.isSuperAdmin || user.role === UserRole.COMPANY_ADMIN) {
      return true;
    }

    // 1. リソース単位の権限設定がある場合はそれを優先
    if (resourceId) {
      const resourcePermission = await this.resourcePermissionRepository.findOne({
        where: {
          userId,
          resourceType: resource as string,
          resourceId,
          action,
        },
      });

      if (resourcePermission) {
        return resourcePermission.isGranted;
      }
    }

    // 2. カスタムロールによる権限を確認
    const userCustomRoles = await this.userCustomRoleRepository.find({
      where: { userId },
      relations: ['customRole'],
    });

    for (const userCustomRole of userCustomRoles) {
      const customRolePermissions = await this.customRolePermissionRepository.find({
        where: { customRoleId: userCustomRole.customRoleId },
        relations: ['permission'],
      });

      const hasPermission = customRolePermissions.some(
        crp => crp.permission.resource === resource && 
              (crp.permission.action === action || crp.permission.action === PermissionAction.MANAGE)
      );

      if (hasPermission) {
        return true;
      }
    }

    // 3. システムロールによる権限を確認
    return this.hasPermission(user.role, action, resource as PermissionResource);
  }

  /**
   * リソース特有の権限チェック
   * フロントエンドのResourcePermissionGuardからの呼び出し用
   */
  async hasUserResourcePermission(
    userId: string,
    action: PermissionAction,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    return this.hasUserPermission(userId, action, resourceType, resourceId);
  }

  private async getUserWithRoleById(userId: string): Promise<any> {
    // TODO: UserServiceを使用して適切に実装。これはモック実装
    return { id: userId, role: UserRole.RECRUITER, isSuperAdmin: false };
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }
} 