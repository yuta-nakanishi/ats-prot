import { FC } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
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
      return 'success';
    case PermissionAction.READ:
      return 'info';
    case PermissionAction.UPDATE:
      return 'warning';
    case PermissionAction.DELETE:
      return 'error';
    case PermissionAction.MANAGE:
      return 'secondary';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>権限名</TableCell>
            <TableCell>アクション</TableCell>
            <TableCell>リソース</TableCell>
            <TableCell>説明</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.id}>
              <TableCell>{permission.name}</TableCell>
              <TableCell>
                <Chip 
                  label={getActionLabel(permission.action)} 
                  color={getActionColor(permission.action) as any}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{getResourceLabel(permission.resource)}</TableCell>
              <TableCell>{permission.description}</TableCell>
            </TableRow>
          ))}
          {permissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                権限が見つかりません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PermissionsList; 