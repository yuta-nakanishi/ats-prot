import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PermissionsService } from './permissions/permissions.service';
import { CustomRolesService } from './permissions/custom-roles.service';
import { ResourcePermissionsService } from './permissions/resource-permissions.service';
import { PermissionAction, PermissionResource } from './permissions/entities/permission.entity';
import { UserRole } from './auth/entities/user.entity';
import * as fs from 'fs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { Company } from './companies/entities/company.entity';
import { Department } from './companies/entities/department.entity';
import { Repository } from 'typeorm';
import { CompanyPlanType } from './companies/entities/company.entity';

// テスト用の一時データベースファイル
const TEST_DB_PATH = './src/test-permissions.sqlite';

// テスト用データベースがあれば削除
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
  console.log('既存のテスト用データベースを削除しました');
}

// 環境変数を設定してテスト用データベースを使用する
process.env.DATABASE_PATH = TEST_DB_PATH;

async function testPermissions() {
  const app = await NestFactory.create(AppModule);
  
  // 各サービスの取得
  const permissionsService = app.get(PermissionsService);
  const customRolesService = app.get(CustomRolesService);
  const resourcePermissionsService = app.get(ResourcePermissionsService);
  
  // リポジトリの取得
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const companyRepository = app.get<Repository<Company>>(getRepositoryToken(Company));
  const departmentRepository = app.get<Repository<Department>>(getRepositoryToken(Department));

  try {
    // 1. 権限の初期化
    await permissionsService.initializePermissions();
    console.log('💡 権限の初期化が完了しました');

    // 2. システムロールの権限をテスト
    const companyAdminHasPermission = await permissionsService.hasPermission(
      UserRole.COMPANY_ADMIN,
      PermissionAction.MANAGE,
      PermissionResource.DEPARTMENT
    );
    console.log(`COMPANY_ADMINは部署の管理権限を持っていますか？: ${companyAdminHasPermission}`);

    const recruiterHasPermission = await permissionsService.hasPermission(
      UserRole.RECRUITER,
      PermissionAction.READ,
      PermissionResource.DEPARTMENT
    );
    console.log(`RECRUITERは部署の閲覧権限を持っていますか？: ${recruiterHasPermission}`);

    const recruiterCantManage = await permissionsService.hasPermission(
      UserRole.RECRUITER,
      PermissionAction.MANAGE,
      PermissionResource.DEPARTMENT
    );
    console.log(`RECRUITERは部署の管理権限を持っていますか？: ${recruiterCantManage}`);

    // 3. 全権限のリストを取得
    const allPermissions = await permissionsService.getAllPermissions();
    console.log(`全権限数: ${allPermissions.length}`);
    console.log('権限サンプル:', allPermissions.slice(0, 3));

    console.log('\n--- カスタムロールテスト ---');
    
    // テスト用の会社を作成
    const company = await companyRepository.save({
      id: 'test-company-id',
      name: 'テスト会社',
      planType: CompanyPlanType.PREMIUM,
      isActive: true
    });
    console.log(`テスト用会社を作成しました: ${company.name} (ID: ${company.id})`);
    
    // テスト用のユーザーを作成
    const user = await userRepository.save({
      id: 'test-user-id',
      email: 'test@example.com',
      password: 'password123',
      name: 'テストユーザー',
      role: UserRole.COMPANY_ADMIN,
      companyId: company.id,
      isActive: true
    });
    console.log(`テスト用ユーザーを作成しました: ${user.name} (ID: ${user.id})`);
    
    // テスト用の部署を作成
    const department = await departmentRepository.save({
      name: 'テスト部署',
      companyId: company.id,
      isActive: true
    });
    console.log(`テスト用部署を作成しました: ${department.name} (ID: ${department.id})`);

    // 4. カスタムロールの作成
    const customRole = await customRolesService.create(
      {
        name: 'テスト権限グループ',
        description: 'テスト用の権限グループです',
        permissionIds: allPermissions
          .filter(p => p.resource === PermissionResource.CANDIDATE)
          .map(p => p.id),
      },
      user
    );
    console.log(`作成したカスタムロール: ${customRole.name} (ID: ${customRole.id})`);

    // 5. カスタムロールに割り当てられた権限を確認
    const rolePermissions = await customRolesService.getPermissionsByCustomRoleId(customRole.id);
    console.log(`カスタムロールに割り当てられた権限数: ${rolePermissions.length}`);
    console.log('割り当てられた権限:', rolePermissions.map(p => p.name));

    console.log('\n--- リソース権限テスト ---');
    
    // 6. リソース権限の作成（部署リソースを使用）
    const resourcePermission = await resourcePermissionsService.create(
      {
        userId: user.id,
        resourceType: 'department',
        resourceId: department.id,
        action: PermissionAction.UPDATE,
        isGranted: true,
      },
      user
    );
    console.log(`作成したリソース権限: ${resourcePermission.id}`);

    // 7. リソース権限の確認
    const hasResourcePermission = await resourcePermissionsService.hasResourcePermission(
      user.id,
      'department',
      department.id,
      PermissionAction.UPDATE
    );
    console.log(`ユーザーはリソースの更新権限を持っていますか？: ${hasResourcePermission}`);

    console.log('\n✅ 権限システムのテストが完了しました');
  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  } finally {
    await app.close();
    // テスト終了後、テスト用データベースファイルを削除
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
      console.log('テスト用データベースを削除しました');
    }
  }
}

// スクリプト実行
testPermissions()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 