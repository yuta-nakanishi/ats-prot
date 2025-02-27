import { FC } from 'react';
import { 
  Table, 
  Tag,
  Spin,
  Alert} from 'antd';
import { Permission, PermissionAction, PermissionResource } from '../../lib/types';

interface PermissionsListProps {
  permissions: Permission[];
  isLoading: boolean;
  error: string;
}

// 権限アクションに応じた色を返す関数
const getActionColor = (action: PermissionAction): string => {
  switch (action) {
    case PermissionAction.CREATE:
      return 'green';
    case PermissionAction.READ:
      return 'blue';
    case PermissionAction.UPDATE:
      return 'orange';
    case PermissionAction.DELETE:
      return 'red';
    case PermissionAction.MANAGE:
      return 'purple';
    default:
      return 'default';
  }
};

// リソースタイプに応じた日本語名を返す関数
const getResourceLabel = (resource: PermissionResource): string => {
  const resourceMap: Record<PermissionResource, string> = {
    [PermissionResource.COMPANY]: '企業',
    [PermissionResource.USER]: 'ユーザー',
    [PermissionResource.DEPARTMENT]: '部署',
    [PermissionResource.TEAM]: 'チーム',
    [PermissionResource.JOB_POSTING]: '求人',
    [PermissionResource.CANDIDATE]: '候補者',
    [PermissionResource.INTERVIEW]: '面接',
    [PermissionResource.EVALUATION]: '評価',
    [PermissionResource.REPORT]: 'レポート',
  };
  return resourceMap[resource] || resource;
};

// 権限アクションに応じた日本語名を返す関数
const getActionLabel = (action: PermissionAction): string => {
  const actionMap: Record<PermissionAction, string> = {
    [PermissionAction.CREATE]: '作成',
    [PermissionAction.READ]: '閲覧',
    [PermissionAction.UPDATE]: '更新',
    [PermissionAction.DELETE]: '削除',
    [PermissionAction.MANAGE]: '管理',
  };
  return actionMap[action] || action;
};

const PermissionsList: FC<PermissionsListProps> = ({ permissions, isLoading, error }) => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  const columns = [
    {
      title: '権限名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'アクション',
      dataIndex: 'action',
      key: 'action',
      render: (_: unknown, record: Permission) => (
        <Tag color={getActionColor(record.action)}>
          {getActionLabel(record.action)}
        </Tag>
      ),
    },
    {
      title: 'リソース',
      dataIndex: 'resource',
      key: 'resource',
      render: (_: unknown, record: Permission) => getResourceLabel(record.resource),
    },
    {
      title: '説明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={permissions.map(permission => ({ ...permission, key: permission.id }))}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: '権限が見つかりません' }}
    />
  );
};

export default PermissionsList; 