'use client';

import { useState, useEffect } from 'react';
import { Typography, Tabs, Tab, Box, Paper, Button, Divider, Dialog } from '@mui/material';
import { permissionsApi } from '../../lib/api';
import { Permission, CustomRole, PermissionAction, PermissionResource } from '../../lib/types';
import PermissionsList from '../../components/permissions/PermissionsList';
import CustomRolesList from '../../components/permissions/CustomRolesList';
import CustomRoleForm from '../../components/permissions/CustomRoleForm';
import CustomRoleDetail from '../../components/permissions/CustomRoleDetail';

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState(0);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        権限管理
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="システム権限" />
          <Tab label="カスタムロール" />
        </Tabs>
        
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                システム権限一覧
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                システムで定義されている権限の一覧です。これらの権限はカスタムロールに付与できます。
              </Typography>
              <PermissionsList permissions={permissions} isLoading={isLoading} error={error} />
            </>
          )}
          
          {activeTab === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  カスタムロール一覧
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setShowCreateRole(true)}
                >
                  新規ロール作成
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                会社内のカスタムロールを管理できます。カスタムロールにはシステム権限を組み合わせて付与できます。
              </Typography>
              
              {showCreateRole ? (
                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    新規カスタムロール作成
                  </Typography>
                  <CustomRoleForm 
                    permissions={permissions} 
                    onSubmit={handleCreateRole}
                    onCancel={() => setShowCreateRole(false)}
                  />
                </Paper>
              ) : null}
              
              <CustomRolesList 
                customRoles={customRoles} 
                isLoading={isLoading} 
                error={error}
                onDelete={handleDeleteRole}
                onViewDetails={handleViewRoleDetails}
              />
            </>
          )}
        </Box>
      </Paper>

      {/* ロール詳細ダイアログ */}
      <Dialog
        open={showRoleDetails}
        onClose={handleCloseRoleDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedRole && (
          <CustomRoleDetail 
            roleId={selectedRole.id} 
            onClose={handleCloseRoleDetails} 
          />
        )}
      </Dialog>
    </Box>
  );
} 