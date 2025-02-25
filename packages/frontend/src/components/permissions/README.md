# 権限管理システム

## 実装済み機能

- 権限（Permissions）一覧の表示
- カスタムロール（CustomRoles）の作成・編集・削除
- ユーザーへのカスタムロール割り当て
- リソースごとの権限管理（Resource Permissions）
- 権限に基づくUI要素の制御（PermissionGuard, ResourcePermissionGuard）

## コンポーネント一覧

1. **PermissionsList**: システム権限の一覧表示
2. **CustomRolesList**: カスタムロールの一覧表示とアクション
3. **CustomRoleForm**: カスタムロール作成・編集フォーム
4. **CustomRoleDetail**: カスタムロールの詳細表示
5. **PermissionGuard**: 権限に基づくコンポーネント表示制御
6. **ResourcePermissionGuard**: リソース単位の権限に基づくコンポーネント表示制御

## 使用方法

### 標準的な権限チェック（PermissionGuard）

特定のアクション（CREATE, READ, UPDATE, DELETE, MANAGE）とリソースに対する権限をチェックします。

```tsx
<PermissionGuard
  action={PermissionAction.CREATE}
  resource={PermissionResource.CANDIDATE}
>
  <Button 
    type="primary" 
    icon={<UserAddOutlined />} 
    onClick={onAddCandidate}
  >
    候補者を追加
  </Button>
</PermissionGuard>
```

### リソース固有の権限チェック（ResourcePermissionGuard）

特定のリソースインスタンス（例：特定の候補者や求人）に対する権限をチェックします。

```tsx
<ResourcePermissionGuard
  action={PermissionAction.UPDATE}
  resourceType="candidate"
  resourceId={candidate.id}
>
  <Button
    icon={<EditOutlined />}
    onClick={() => setShowEditModal(true)}
  />
</ResourcePermissionGuard>
```

## 次のステップ

### 1. 認証フローとの統合強化

- ログイン時に権限情報をプリロード
- 権限キャッシュによるパフォーマンス向上

### 2. リソース単位の権限管理の拡充

- より詳細な権限設定UI（例：特定の求人や候補者へのアクセス制御）
- チームやプロジェクト単位でのアクセス制御

### 3. 監査ログの実装

- 権限変更の履歴記録
- ユーザーアクションの記録とレポート

### 4. 権限の動的反映

- 権限変更時のリアルタイム反映
- 画面遷移なしでの権限更新

### 5. 権限プリセット機能

- よく使われる権限セットをプリセットとして保存
- ワンクリックでの権限セット適用

## APIリファレンス

- `getAllPermissions()`: 全権限の取得
- `getCompanyCustomRoles()`: 会社のカスタムロール取得
- `createCustomRole()`: カスタムロール作成
- `assignCustomRoleToUser()`: ユーザーへのロール割り当て
- `checkPermission()`: 権限チェック
- `checkResourcePermission()`: リソース固有の権限チェック 