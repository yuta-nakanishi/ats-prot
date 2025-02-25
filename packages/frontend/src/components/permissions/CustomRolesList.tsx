import { FC, useState } from 'react';
import { 
  Table, 
  Spin,
  Alert,
  Modal,
  Button,
  Tooltip,
  Space
} from 'antd';
import { DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
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

  const columns = [
    {
      title: 'ロール名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '説明',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '説明なし'
    },
    {
      title: '作成日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ja-JP')
    },
    {
      title: 'アクション',
      key: 'action',
      align: 'right' as const,
      render: (_: unknown, record: CustomRole) => (
        <Space>
          <Tooltip title="詳細を表示">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined />} 
              size="small" 
              onClick={() => onViewDetails && onViewDetails(record)}
            />
          </Tooltip>
          {onEdit && (
            <Tooltip title="編集">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                size="small" 
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="削除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              onClick={() => handleDeleteClick(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={customRoles.map(role => ({ ...role, key: role.id }))}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'カスタムロールが見つかりません' }}
      />

      {/* 削除確認ダイアログ */}
      <Modal
        title="カスタムロールの削除"
        open={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
        okText="削除"
        cancelText="キャンセル"
        okButtonProps={{ danger: true }}
      >
        <p>
          カスタムロール「{roleToDelete?.name}」を削除してもよろしいですか？
          削除すると、このロールを持つユーザーからも権限が削除されます。
        </p>
      </Modal>
    </>
  );
};

export default CustomRolesList; 