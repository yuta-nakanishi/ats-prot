import { FC, useState } from 'react';
import { 
  Input, 
  Button, 
  Typography, 
  Form, 
  Checkbox,
  Divider,
  Row,
  Col,
  Tag,
  Space,
  Alert,
  Card
} from 'antd';
import { Permission, PermissionAction, PermissionResource, CustomRole } from '../../lib/types';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface CustomRoleFormProps {
  permissions: Permission[];
  initialRole?: CustomRole;
  initialPermissionIds?: string[];
  onSubmit: (name: string, description: string, permissionIds: string[]) => void;
  onCancel: () => void;
}

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

// アクションに応じた色を返す関数
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

const CustomRoleForm: FC<CustomRoleFormProps> = ({ 
  permissions, 
  initialRole, 
  initialPermissionIds = [], 
  onSubmit, 
  onCancel 
}) => {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(initialPermissionIds);
  const [formError, setFormError] = useState('');
  const [form] = Form.useForm();

  // 権限をリソースタイプごとにグループ化
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleFinish = (values: { name: string; description: string }) => {
    if (selectedPermissionIds.length === 0) {
      setFormError('権限を1つ以上選択してください');
      return;
    }
    
    onSubmit(values.name, values.description, selectedPermissionIds);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleToggleAllResourcePermissions = (resource: string, permissionIds: string[]) => {
    setSelectedPermissionIds(prev => {
      const isAllSelected = permissionIds.every(id => prev.includes(id));
      
      if (isAllSelected) {
        // すべて選択されている場合、すべて解除
        return prev.filter(id => !permissionIds.includes(id));
      } else {
        // すべて選択されていない場合、すべて選択
        const newSelected = [...prev];
        permissionIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      }
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: initialRole?.name || '',
        description: initialRole?.description || '',
      }}
      onFinish={handleFinish}
    >
      {formError && (
        <Alert
          message={formError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label="ロール名"
            rules={[{ required: true, message: 'ロール名は必須です' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="description"
            label="説明"
          >
            <TextArea rows={2} />
          </Form.Item>
        </Col>
      </Row>
      
      <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>
        付与する権限
      </Title>
      <Divider style={{ marginBottom: 16 }} />
      
      {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
        <div key={resource} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <Text strong style={{ marginRight: 16 }}>
              {getResourceLabel(resource as PermissionResource)}
            </Text>
            <Button 
              size="small"
              onClick={() => handleToggleAllResourcePermissions(
                resource, 
                resourcePermissions.map(p => p.id)
              )}
            >
              全て選択/解除
            </Button>
          </div>
          
          <div style={{ marginLeft: 16 }}>
            <Row gutter={[8, 8]}>
              {resourcePermissions.map((permission) => (
                <Col xs={24} sm={12} md={8} key={permission.id}>
                  <Checkbox
                    checked={selectedPermissionIds.includes(permission.id)}
                    onChange={() => handleTogglePermission(permission.id)}
                  >
                    <Space>
                      <Tag color={getActionColor(permission.action)}>
                        {getActionLabel(permission.action)}
                      </Tag>
                      <Text>{permission.description}</Text>
                    </Space>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      ))}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          キャンセル
        </Button>
        <Button type="primary" htmlType="submit">
          {initialRole ? '更新' : '作成'}
        </Button>
      </div>
    </Form>
  );
};

export default CustomRoleForm; 