'use client';

import { useState, useEffect } from 'react';
import { Typography, Tabs, Card, Button, Divider, Modal } from 'antd';
import { permissionsApi } from '../../lib/api';
import { Permission, CustomRole, PermissionAction, PermissionResource } from '../../lib/types';
import PermissionsList from '../../components/permissions/PermissionsList';
import CustomRolesList from '../../components/permissions/CustomRolesList';
import CustomRoleForm from '../../components/permissions/CustomRoleForm';
import CustomRoleDetail from '../../components/permissions/CustomRoleDetail';

const { Title, Text } = Typography;

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState('1');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [permissionsData, customRolesData] = await Promise.all([
          permissionsApi.getAllPermissions(),
          permissionsApi.getCompanyCustomRoles()
        ]);
        setPermissions(permissionsData);
        setCustomRoles(customRolesData);
        setError('');
      } catch (err) {
        console.error('データの取得に失敗しました:', err);
        setError('データの取得に失敗しました。再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRole = async (name: string, description: string, permissionIds: string[]) => {
    try {
      const newRole = await permissionsApi.createCustomRole({
        name,
        description,
        permissionIds
      });
      setCustomRoles([...customRoles, newRole]);
      setShowCreateRole(false);
    } catch (err) {
      console.error('カスタムロールの作成に失敗しました:', err);
      setError('カスタムロールの作成に失敗しました。再度お試しください。');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await permissionsApi.deleteCustomRole(roleId);
      setCustomRoles(customRoles.filter(role => role.id !== roleId));
    } catch (err) {
      console.error('カスタムロールの削除に失敗しました:', err);
      setError('カスタムロールの削除に失敗しました。再度お試しください。');
    }
  };

  const handleViewRoleDetails = (role: CustomRole) => {
    setSelectedRole(role);
    setShowRoleDetails(true);
  };

  const handleCloseRoleDetails = () => {
    setShowRoleDetails(false);
    setSelectedRole(null);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // タブアイテムの定義
  const tabItems = [
    {
      key: '1',
      label: 'システム権限',
      children: (
        <>
          <Title level={5}>システム権限一覧</Title>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            システムで定義されている権限の一覧です。これらの権限はカスタムロールに付与できます。
          </Text>
          <PermissionsList permissions={permissions} isLoading={isLoading} error={error} />
        </>
      )
    },
    {
      key: '2',
      label: 'カスタムロール',
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0 }}>
              カスタムロール一覧
            </Title>
            <Button 
              type="primary"
              onClick={() => setShowCreateRole(true)}
            >
              新規ロール作成
            </Button>
          </div>
          
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            会社内のカスタムロールを管理できます。カスタムロールにはシステム権限を組み合わせて付与できます。
          </Text>
          
          {showCreateRole ? (
            <Card style={{ marginBottom: 24 }}>
              <Title level={5}>新規カスタムロール作成</Title>
              <CustomRoleForm 
                permissions={permissions} 
                onSubmit={handleCreateRole}
                onCancel={() => setShowCreateRole(false)}
              />
            </Card>
          ) : null}
          
          <CustomRolesList 
            customRoles={customRoles} 
            isLoading={isLoading} 
            error={error}
            onDelete={handleDeleteRole}
            onViewDetails={handleViewRoleDetails}
          />
        </>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>
        権限管理
      </Title>
      <Divider />
      
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange} 
          items={tabItems}
        />
      </Card>

      {/* ロール詳細ダイアログ */}
      <Modal
        title="ロール詳細"
        open={showRoleDetails}
        onCancel={handleCloseRoleDetails}
        footer={null}
        width={800}
      >
        {selectedRole && (
          <CustomRoleDetail 
            roleId={selectedRole.id} 
            onClose={handleCloseRoleDetails} 
          />
        )}
      </Modal>
    </div>
  );
} 