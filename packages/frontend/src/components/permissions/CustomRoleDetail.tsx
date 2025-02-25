import { FC, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
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
  const [activeTab, setActiveTab] = useState(0);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!roleData) {
    return <Alert severity="warning">ロールが見つかりません</Alert>;
  }

  const groupedPermissions = groupPermissionsByResource(permissions);

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{roleData.name}</Typography>
          {onEdit && (
            <Button variant="outlined" color="primary" onClick={onEdit}>
              編集
            </Button>
          )}
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              説明
            </Typography>
            <Typography variant="body1">
              {roleData.description || '説明なし'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              作成日
            </Typography>
            <Typography variant="body1">
              {new Date(roleData.createdAt).toLocaleDateString('ja-JP')}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 2 }} />
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab icon={<SecurityIcon />} label="権限" />
          <Tab icon={<PeopleIcon />} label="ユーザー" iconPosition="start" />
        </Tabs>
        
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              付与されている権限（{permissions.length}）
            </Typography>
            
            {Object.entries(groupedPermissions).map(([resource, permissions]) => (
              <Box key={resource} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {resource}
                </Typography>
                
                <List dense>
                  {permissions.map((permission) => (
                    <ListItem key={permission.id}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={permission.action}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2">
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
            
            {permissions.length === 0 && (
              <Alert severity="info">このロールには権限が付与されていません。</Alert>
            )}
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              割り当てられているユーザー（{users.length}）
            </Typography>
            
            <List>
              {users.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                  />
                </ListItem>
              ))}
              
              {users.length === 0 && (
                <Alert severity="info">このロールはどのユーザーにも割り当てられていません。</Alert>
              )}
            </List>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="outlined">
          閉じる
        </Button>
      </Box>
    </Box>
  );
};

export default CustomRoleDetail; 