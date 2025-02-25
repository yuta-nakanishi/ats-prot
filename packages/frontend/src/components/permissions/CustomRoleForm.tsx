import { FC, useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  FormControl, 
  FormLabel, 
  FormGroup, 
  FormControlLabel, 
  Checkbox,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { Permission, PermissionAction, PermissionResource, CustomRole } from '../../lib/types';

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

const CustomRoleForm: FC<CustomRoleFormProps> = ({ 
  permissions, 
  initialRole, 
  initialPermissionIds = [], 
  onSubmit, 
  onCancel 
}) => {
  const [name, setName] = useState(initialRole?.name || '');
  const [description, setDescription] = useState(initialRole?.description || '');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(initialPermissionIds);
  const [formError, setFormError] = useState('');

  // 権限をリソースタイプごとにグループ化
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setFormError('ロール名は必須です');
      return;
    }
    
    if (selectedPermissionIds.length === 0) {
      setFormError('権限を1つ以上選択してください');
      return;
    }
    
    onSubmit(name, description, selectedPermissionIds);
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {formError && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {formError}
        </Typography>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="ロール名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
      
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        付与する権限
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
        <Box key={resource} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FormLabel component="legend" sx={{ fontWeight: 'bold', mr: 2 }}>
              {getResourceLabel(resource as PermissionResource)}
            </FormLabel>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => handleToggleAllResourcePermissions(
                resource, 
                resourcePermissions.map(p => p.id)
              )}
            >
              全て選択/解除
            </Button>
          </Box>
          
          <FormControl component="fieldset" sx={{ ml: 2 }}>
            <FormGroup>
              <Grid container spacing={1}>
                {resourcePermissions.map((permission) => (
                  <Grid item xs={12} sm={6} md={4} key={permission.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={() => handleTogglePermission(permission.id)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={getActionLabel(permission.action)}
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
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </FormControl>
        </Box>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="outlined" onClick={onCancel} sx={{ mr: 2 }}>
          キャンセル
        </Button>
        <Button variant="contained" color="primary" type="submit">
          {initialRole ? '更新' : '作成'}
        </Button>
      </Box>
    </Box>
  );
};

export default CustomRoleForm; 