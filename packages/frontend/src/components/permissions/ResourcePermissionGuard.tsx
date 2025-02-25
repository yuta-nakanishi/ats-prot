import { FC, ReactNode, useState, useEffect } from 'react';
import { PermissionAction } from '../../lib/types';
import { permissionsApi } from '../../lib/api';
import { CircularProgress, Box } from '@mui/material';

interface ResourcePermissionGuardProps {
  action: PermissionAction;
  resourceType: string;
  resourceId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * リソース固有の権限ガードコンポーネント
 * 
 * 指定された特定のリソース（例：特定の候補者、求人など）に対するアクションの権限がある場合のみ、
 * 子コンポーネントを表示します。
 * 権限がない場合は、fallbackコンポーネントを表示するか、何も表示しません。
 */
const ResourcePermissionGuard: FC<ResourcePermissionGuardProps> = ({
  action,
  resourceType,
  resourceId,
  children,
  fallback = null
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await permissionsApi.checkResourcePermission(
          action,
          resourceType,
          resourceId
        );
        setHasPermission(result);
      } catch (error) {
        console.error('リソース権限チェックに失敗しました:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [action, resourceType, resourceId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default ResourcePermissionGuard; 