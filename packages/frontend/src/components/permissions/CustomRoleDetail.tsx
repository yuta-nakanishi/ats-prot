import { FC, useState, useEffect } from 'react';
import { 
  Card, 
  Typography,
  Spin,
  Alert,
  Row,
  Col,
  Divider,
  List,
  Button,
  Tabs,
  Tag,
  Space
} from 'antd';
import { CheckCircleOutlined, SecurityScanOutlined, TeamOutlined } from '@ant-design/icons';
import { CustomRoleWithPermissions, Permission, UserWithRoles } from '../../lib/types';
import { permissionsApi } from '../../lib/api';

interface CustomRoleDetailProps {
  roleId: string;
  onClose: () => void;
  onEdit?: () => void;
}

const CustomRoleDetail: FC<CustomRoleDetailProps> = ({ roleId, onClose, onEdit }) => {
  const [roleData, setRoleData] = useState<CustomRoleWithPermissions | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('permissions');

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        setIsLoading(true);
        const role = await permissionsApi.getCustomRoleById(roleId);
        setRoleData(role);
        
        // 別途ロールに関連する権限を取得する
        const perms = await permissionsApi.getPermissionsByCustomRoleId(roleId);
        setPermissions(perms);
        
        // ロールに割り当てられているユーザーを取得
        const usersWithRole = await permissionsApi.getUsersByCustomRoleId(roleId);
        setUsers(usersWithRole);
        
        setError('');
      } catch (err) {
        console.error('ロールデータの取得に失敗しました:', err);
        setError('ロールデータの取得に失敗しました。再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    if (roleId) {
      fetchRoleData();
    }
  }, [roleId]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 権限を機能別にグループ化する
  const groupPermissionsByResource = (permissions: Permission[]) => {
    if (!permissions || permissions.length === 0) {
      return {};
    }
    
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (!roleData) {
    return <Alert message="ロールが見つかりません" type="warning" />;
  }

  const groupedPermissions = groupPermissionsByResource(permissions);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography.Title level={5}>{roleData.name}</Typography.Title>
          {onEdit && (
            <Button type="primary" ghost onClick={onEdit}>
              編集
            </Button>
          )}
        </div>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Typography.Text type="secondary">
              説明
            </Typography.Text>
            <div>
              {roleData.description || '説明なし'}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Typography.Text type="secondary">
              作成日
            </Typography.Text>
            <div>
              {new Date(roleData.createdAt).toLocaleDateString('ja-JP')}
            </div>
          </Col>
        </Row>
        
        <Divider style={{ marginBottom: 16 }} />
        
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'permissions',
              label: (
                <span>
                  <SecurityScanOutlined />
                  権限
                </span>
              ),
              children: (
                <div>
                  <Typography.Title level={5} style={{ marginBottom: 16 }}>
                    付与されている権限（{permissions.length}）
                  </Typography.Title>
                  
                  {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                    <div key={resource} style={{ marginBottom: 24 }}>
                      <Typography.Title level={5} style={{ marginBottom: 8 }}>
                        {resource}
                      </Typography.Title>
                      
                      <List
                        itemLayout="horizontal"
                        dataSource={permissions}
                        renderItem={(permission) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                              title={
                                <Space>
                                  <Tag>{permission.action}</Tag>
                                  <span>{permission.description}</span>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  ))}
                  
                  {permissions.length === 0 && (
                    <Alert message="このロールには権限が付与されていません。" type="info" />
                  )}
                </div>
              ),
            },
            {
              key: 'users',
              label: (
                <span>
                  <TeamOutlined />
                  ユーザー
                </span>
              ),
              children: (
                <div>
                  <Typography.Title level={5} style={{ marginBottom: 16 }}>
                    割り当てられているユーザー（{users.length}）
                  </Typography.Title>
                  
                  <List
                    itemLayout="horizontal"
                    dataSource={users}
                    renderItem={(user) => (
                      <List.Item>
                        <List.Item.Meta
                          title={user.name}
                          description={user.email}
                        />
                      </List.Item>
                    )}
                  />
                  
                  {users.length === 0 && (
                    <Alert message="このロールはどのユーザーにも割り当てられていません。" type="info" />
                  )}
                </div>
              ),
            }
          ]}
        />
      </Card>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>
          閉じる
        </Button>
      </div>
    </div>
  );
};

export default CustomRoleDetail; 