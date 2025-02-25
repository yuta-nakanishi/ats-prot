import { FC, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { CustomRole } from '../../lib/types';

interface CustomRolesListProps {
  customRoles: CustomRole[];
  isLoading: boolean;
  error: string;
  onDelete: (id: string) => void;
  onEdit?: (role: CustomRole) => void;
  onViewDetails?: (role: CustomRole) => void;
}

const CustomRolesList: FC<CustomRolesListProps> = ({ 
  customRoles, 
  isLoading, 
  error, 
  onDelete,
  onEdit,
  onViewDetails
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<CustomRole | null>(null);

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

  const handleDeleteClick = (role: CustomRole) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      onDelete(roleToDelete.id);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ロール名</TableCell>
              <TableCell>説明</TableCell>
              <TableCell>作成日</TableCell>
              <TableCell align="right">アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description || '説明なし'}</TableCell>
                <TableCell>{new Date(role.createdAt).toLocaleDateString('ja-JP')}</TableCell>
                <TableCell align="right">
                  <Tooltip title="詳細を表示">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => onViewDetails && onViewDetails(role)}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {onEdit && (
                    <Tooltip title="編集">
                      <IconButton size="small" color="primary" onClick={() => onEdit(role)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="削除">
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteClick(role)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {customRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  カスタムロールが見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>カスタムロールの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            カスタムロール「{roleToDelete?.name}」を削除してもよろしいですか？
            削除すると、このロールを持つユーザーからも権限が削除されます。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>キャンセル</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomRolesList; 