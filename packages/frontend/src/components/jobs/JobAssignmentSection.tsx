import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Input,
  Switch,
  message,
  Tooltip,
  Popconfirm,
  Avatar
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
  BellFilled
} from '@ant-design/icons';
import { getJobAssignmentsByJobPosting, createJobAssignment, updateJobAssignment, deleteJobAssignment, JobAssignment as ApiJobAssignment } from '@/lib/api/job-assignments';
import { JobAssignment, AssignmentRole, User } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

// 役割に応じたラベルと色の設定
const roleConfig = {
  [AssignmentRole.PRIMARY]: { label: '主担当', color: 'blue' },
  [AssignmentRole.SECONDARY]: { label: '副担当', color: 'green' },
  [AssignmentRole.VIEWER]: { label: '閲覧のみ', color: 'default' }
};

interface JobAssignmentSectionProps {
  jobPostingId: string;
  users: User[]; // 企業のユーザー一覧
  canEdit: boolean; // 編集権限があるかどうか
  afterUpdate?: () => void; // 更新後のコールバック
}

// ユーザー表示用の簡易型
interface DisplayUser {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
}

// コンポーネント内での表示用の割り当て型
interface DisplayAssignment {
  id: string;
  userId: string;
  jobPostingId: string;
  role: AssignmentRole;
  notificationsEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: DisplayUser;
}

const JobAssignmentSection: React.FC<JobAssignmentSectionProps> = ({
  jobPostingId,
  users,
  canEdit,
  afterUpdate
}) => {
  const [assignments, setAssignments] = useState<DisplayAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<DisplayAssignment | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 担当者データの取得
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await getJobAssignmentsByJobPosting(jobPostingId);
      // APIからのデータをフロントエンドの表示用型に変換
      const displayData: DisplayAssignment[] = data.map(item => ({
        id: item.id,
        userId: item.userId,
        jobPostingId: item.jobPostingId,
        role: item.role as AssignmentRole,
        notificationsEnabled: item.notificationsEnabled,
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user ? {
          id: item.user.id,
          name: item.user.name,
          email: item.user.email,
          jobTitle: item.user.jobTitle
        } : undefined
      }));
      setAssignments(displayData);
    } catch (error) {
      console.error('担当者データの取得に失敗しました:', error);
      message.error('担当者データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [jobPostingId]);

  // 担当者追加モーダルを表示
  const showAddModal = () => {
    setEditingAssignment(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 担当者編集モーダルを表示
  const showEditModal = (assignment: DisplayAssignment) => {
    setEditingAssignment(assignment);
    form.setFieldsValue({
      userId: assignment.userId,
      role: assignment.role,
      notificationsEnabled: assignment.notificationsEnabled,
      notes: assignment.notes || ''
    });
    setModalVisible(true);
  };

  // モーダルを閉じる
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // フォーム送信処理
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingAssignment) {
        // 担当者情報の更新
        await updateJobAssignment(editingAssignment.id, {
          role: values.role,
          notificationsEnabled: values.notificationsEnabled,
          notes: values.notes
        });
        message.success('担当者情報を更新しました');
      } else {
        // 新規担当者の追加
        await createJobAssignment({
          jobPostingId,
          userId: values.userId,
          role: values.role,
          notificationsEnabled: values.notificationsEnabled,
          notes: values.notes
        });
        message.success('担当者を追加しました');
      }

      // モーダルを閉じてデータを再取得
      setModalVisible(false);
      fetchAssignments();
      if (afterUpdate) {
        afterUpdate();
      }
    } catch (error) {
      console.error('担当者の保存に失敗しました:', error);
      message.error('担当者の保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // 担当者削除処理
  const handleDelete = async (id: string) => {
    try {
      await deleteJobAssignment(id);
      message.success('担当者を削除しました');
      fetchAssignments();
      if (afterUpdate) {
        afterUpdate();
      }
    } catch (error) {
      console.error('担当者の削除に失敗しました:', error);
      message.error('担当者の削除に失敗しました');
    }
  };

  // 未割り当てのユーザーをフィルタリング
  const getUnassignedUsers = () => {
    const assignedUserIds = assignments.map(a => a.userId);
    return users.filter(user => !assignedUserIds.includes(user.id));
  };

  // テーブルのカラム定義
  const columns = [
    {
      title: '担当者',
      dataIndex: 'user',
      key: 'user',
      render: (user: DisplayUser) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar style={{ marginRight: 8 }}>
            {user?.name?.charAt(0) || '?'}
          </Avatar>
          <div>
            <div>{user?.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '役職',
      dataIndex: ['user', 'jobTitle'],
      key: 'jobTitle',
      render: (jobTitle: string) => jobTitle || '-',
    },
    {
      title: '役割',
      dataIndex: 'role',
      key: 'role',
      render: (role: AssignmentRole) => (
        <Tag color={roleConfig[role]?.color || 'default'}>
          {roleConfig[role]?.label || role}
        </Tag>
      ),
    },
    {
      title: '通知',
      dataIndex: 'notificationsEnabled',
      key: 'notifications',
      render: (enabled: boolean) => (
        <Tooltip title={enabled ? '通知オン' : '通知オフ'}>
          {enabled ? <BellFilled style={{ color: '#1890ff' }} /> : <BellOutlined style={{ color: '#d9d9d9' }} />}
        </Tooltip>
      ),
    },
    {
      title: '備考',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes: string) => notes || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DisplayAssignment) => (
        canEdit && (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
            <Popconfirm
              title="この担当者を削除しますか？"
              onConfirm={() => handleDelete(record.id)}
              okText="削除"
              cancelText="キャンセル"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          <span>担当者</span>
        </div>
      }
      extra={
        canEdit && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            disabled={getUnassignedUsers().length === 0}
          >
            担当者を追加
          </Button>
        )
      }
    >
      <Table
        dataSource={assignments}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: '担当者が設定されていません' }}
      />

      {/* 担当者追加・編集モーダル */}
      <Modal
        title={editingAssignment ? '担当者を編集' : '担当者を追加'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={submitting}
        okText={editingAssignment ? '更新' : '追加'}
        cancelText="キャンセル"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            role: AssignmentRole.SECONDARY,
            notificationsEnabled: true,
            notes: ''
          }}
        >
          {!editingAssignment && (
            <Form.Item
              name="userId"
              label="担当者"
              rules={[{ required: true, message: '担当者を選択してください' }]}
            >
              <Select placeholder="担当者を選択">
                {getUnassignedUsers().map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="役割"
            rules={[{ required: true, message: '役割を選択してください' }]}
          >
            <Select placeholder="役割を選択">
              <Option value={AssignmentRole.PRIMARY}>
                <Tag color={roleConfig[AssignmentRole.PRIMARY].color}>{roleConfig[AssignmentRole.PRIMARY].label}</Tag>
                - 主な責任者として求人を管理
              </Option>
              <Option value={AssignmentRole.SECONDARY}>
                <Tag color={roleConfig[AssignmentRole.SECONDARY].color}>{roleConfig[AssignmentRole.SECONDARY].label}</Tag>
                - 補助的な立場で求人に関わる
              </Option>
              <Option value={AssignmentRole.VIEWER}>
                <Tag color={roleConfig[AssignmentRole.VIEWER].color}>{roleConfig[AssignmentRole.VIEWER].label}</Tag>
                - 閲覧のみ可能
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notificationsEnabled"
            label="通知"
            valuePropName="checked"
          >
            <Switch checkedChildren="オン" unCheckedChildren="オフ" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="備考"
          >
            <TextArea
              placeholder="備考を入力（任意）"
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default JobAssignmentSection; 