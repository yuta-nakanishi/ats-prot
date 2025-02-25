'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button,
  Tag,
  Spin,
  Card,
  Divider,
  Alert,
  Modal,
  Form,
  Select,
  Space,
  message
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { authApi, permissionsApi } from '../../lib/api';
import { UserWithRoles, CustomRole } from '../../lib/types';

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
  const [form] = Form.useForm();

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
    form.resetFields();
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRoleId(value);
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
      message.success('ロールが正常に割り当てられました');
      
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
      message.error(error.message || 'ロール割り当て中にエラーが発生しました');
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
      message.success('ロールが正常に削除されました');
    } catch (err) {
      console.error('ロールの削除に失敗しました:', err);
      setError('ロールの削除に失敗しました。再度お試しください。');
      message.error('ロールの削除に失敗しました');
    }
  };

  // 既に割り当てられているロールをフィルタリング
  const getAvailableRoles = () => {
    if (!selectedUser) return customRoles;
    
    // customRolesプロパティが存在することを確認
    const assignedRoleIds = selectedUser.customRoles?.map(role => role.id) || [];
    return customRoles.filter(role => !assignedRoleIds.includes(role.id));
  };

  // テーブル列の定義
  const columns = [
    {
      title: '名前',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'メールアドレス',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: (
        <Space>
          システムロール
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            size="small"
            onClick={() => window.open('/system-roles', '_blank')}
            title="システムロールの詳細を表示"
          />
        </Space>
      ),
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'カスタムロール',
      dataIndex: 'customRoles',
      key: 'customRoles',
      render: (_: unknown, record: UserWithRoles) => (
        <>
          {record.customRoles && record.customRoles.length > 0 ? (
            <Space wrap>
              {record.customRoles.map(role => (
                <Tag 
                  key={role.id} 
                  closable
                  color="blue"
                  onClose={() => handleRemoveRole(record.id, role.id)}
                >
                  {role.name}
                </Tag>
              ))}
            </Space>
          ) : (
            <Typography.Text type="secondary">
              なし
            </Typography.Text>
          )}
        </>
      ),
    },
    {
      title: 'アクション',
      key: 'action',
      render: (_: unknown, record: UserWithRoles) => (
        <Button 
          type="primary" 
          onClick={() => handleOpenRoleDialog(record)}
        >
          ロール割り当て
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={4}>
        ユーザー管理
      </Typography.Title>
      <Divider />

      {error && (
        <Alert
          message={error}
          type="error"
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}
      
      <Card title="ユーザー一覧">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users.map(user => ({ ...user, key: user.id }))}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      {/* ロール割り当てダイアログ */}
      <Modal
        title="ユーザーにロールを割り当て"
        open={openRoleDialog}
        onOk={handleAssignRole}
        onCancel={handleCloseRoleDialog}
        okText="割り当て"
        cancelText="キャンセル"
      >
        {selectedUser && (
          <Form form={form} layout="vertical">
            <Form.Item>
              <Typography.Text>
                {selectedUser?.name} さんに割り当てるロールを選択してください。
              </Typography.Text>
            </Form.Item>
            
            {assignmentSuccess && (
              <Form.Item>
                <Alert
                  message="ロールが正常に割り当てられました"
                  type="success"
                  showIcon
                />
              </Form.Item>
            )}
            
            {assignmentError && (
              <Form.Item>
                <Alert
                  message={errorMessage}
                  type="error"
                  showIcon
                />
              </Form.Item>
            )}
            
            <Form.Item label="カスタムロール" name="customRole">
              <Select
                placeholder="ロールを選択"
                style={{ width: '100%' }}
                onChange={handleRoleChange}
                value={selectedRoleId}
                options={getAvailableRoles().map(role => ({
                  value: role.id,
                  label: role.name
                }))}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
} 