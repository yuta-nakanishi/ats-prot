'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Alert,
  DialogContentText,
  IconButton
} from '@mui/material';
import { authApi, permissionsApi } from '../../lib/api';
import { UserWithRoles, CustomRole } from '../../lib/types';
import InfoIcon from '@mui/icons-material/Info';

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [assignmentError, setAssignmentError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, customRolesData] = await Promise.all([
        authApi.getAllUsers(),
        permissionsApi.getCompanyCustomRoles()
      ]);
      setUsers(usersData);
      setCustomRoles(customRolesData);
      setError('');
    } catch (err) {
      console.error('データの取得に失敗しました:', err);
      setError('データの取得に失敗しました。再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRoleDialog = (user: UserWithRoles) => {
    setSelectedUser(user);
    setSelectedRoleId('');
    setOpenRoleDialog(true);
    setAssignmentSuccess(false);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRoleId(event.target.value as string);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;
    
    try {
      await permissionsApi.assignCustomRoleToUser({
        userId: selectedUser.id,
        customRoleId: selectedRoleId
      });
      
      // 成功メッセージを表示
      setAssignmentSuccess(true);
      
      // ユーザーリストを更新（割り当てたロールが反映されるように）
      const updatedUserData = await authApi.getUserById(selectedUser.id);
      setUsers(users.map(user => 
        user.id === updatedUserData.id ? updatedUserData : user
      ));
      
      // ダイアログを閉じる
      handleCloseRoleDialog();
    } catch (error: any) {
      console.error('ロール割り当てエラー:', error);
      // エラーメッセージをセット
      setErrorMessage(error.message || 'ロール割り当て中にエラーが発生しました');
      // エラー状態をセット
      setAssignmentError(true);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await permissionsApi.removeCustomRoleFromUser({
        userId,
        customRoleId: roleId
      });
      
      // ユーザーリストを更新（削除したロールが反映されるように）
      const updatedUserData = await authApi.getUserById(userId);
      setUsers(users.map(user => 
        user.id === updatedUserData.id ? updatedUserData : user
      ));
    } catch (err) {
      console.error('ロールの削除に失敗しました:', err);
      setError('ロールの削除に失敗しました。再度お試しください。');
    }
  };

  // 既に割り当てられているロールをフィルタリング
  const getAvailableRoles = () => {
    if (!selectedUser) return customRoles;
    
    // customRolesプロパティが存在することを確認
    const assignedRoleIds = selectedUser.customRoles?.map(role => role.id) || [];
    return customRoles.filter(role => !assignedRoleIds.includes(role.id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ユーザー管理
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          ユーザー一覧
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>名前</TableCell>
                  <TableCell>メールアドレス</TableCell>
                  <TableCell>
                    システムロール
                    <IconButton 
                      size="small" 
                      onClick={() => window.open('/system-roles', '_blank')}
                      title="システムロールの詳細を表示"
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>カスタムロール</TableCell>
                  <TableCell>アクション</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.customRoles && user.customRoles.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {user.customRoles.map(role => (
                            <Chip 
                              key={role.id} 
                              label={role.name}
                              onDelete={() => handleRemoveRole(user.id, role.id)}
                              color="primary"
                              size="small"
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          なし
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenRoleDialog(user)}
                      >
                        ロール割り当て
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ロール割り当てダイアログ */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>ユーザーにロールを割り当て</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.name} さんに割り当てるロールを選択してください。
          </DialogContentText>
          
          {assignmentSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ロールが正常に割り当てられました。
            </Alert>
          )}
          
          {assignmentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">カスタムロール</InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRoleId}
              label="カスタムロール"
              onChange={handleRoleChange}
            >
              {getAvailableRoles().map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name} - {role.description || 'なし'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>キャンセル</Button>
          <Button 
            onClick={handleAssignRole} 
            disabled={!selectedRoleId}
            variant="contained"
          >
            割り当て
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 