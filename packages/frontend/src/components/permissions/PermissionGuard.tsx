import { FC, ReactNode, useState, useEffect } from 'react';
import { PermissionAction, PermissionResource } from '../../lib/types';
import { permissionsApi } from '../../lib/api';
import { CircularProgress, Box } from '@mui/material';

interface PermissionGuardProps {
  action: PermissionAction;
  resource: PermissionResource;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 権限ガードコンポーネント
 * 
 * 指定されたリソースに対するアクションの権限がある場合のみ、子コンポーネントを表示します。
 * 権限がない場合は、fallbackコンポーネントを表示するか、何も表示しません。
 */
const PermissionGuard: FC<PermissionGuardProps> = ({
  action,
  resource,
  children,
  fallback = null
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await permissionsApi.checkPermission(action, resource);
        setHasPermission(result);
      } catch (error) {
        console.error('権限チェックに失敗しました:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [action, resource]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard; 