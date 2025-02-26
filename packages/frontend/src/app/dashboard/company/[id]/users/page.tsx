'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, Typography, Card, Spin, Layout, Space, Alert, Table, Tag, Empty } from 'antd';
import { UserAddOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { User, UserRole } from '../../../../../types';
import { getTenantUsers } from '../../../../../lib/api/tenant';

const { Title, Text } = Typography;
const { Content } = Layout;

// ユーザーロールの日本語表示名
const roleLabels: Record<UserRole, string> = {
  [UserRole.COMPANY_ADMIN]: '企業管理者',
  [UserRole.HIRING_MANAGER]: '採用担当責任者',
  [UserRole.RECRUITER]: '採用担当者',
  [UserRole.INTERVIEWER]: '面接官',
  [UserRole.READONLY]: '閲覧のみ',
};

// 日付フォーマット関数
const formatDate = (date: string | undefined): string => {
  if (!date) return '-';
  
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  } catch (error) {
    return String(date);
  }
};

export default function CompanyUsersPage() {
  // useParamsを使用してルートパラメータを取得
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        // テナントAPIを使ってユーザーデータを取得
        const data = await getTenantUsers(companyId);
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('ユーザー一覧の取得に失敗しました', err);
        setError('ユーザー一覧の取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [companyId]);
  
  if (!companyId) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert type="error" message="会社IDが見つかりません" />
      </div>
    );
  }
  
  const columns = [
    {
      title: '名前',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'メールアドレス',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '役職',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text: string | undefined) => text || '-',
    },
    {
      title: '所属部署',
      key: 'department',
      render: (_: any, record: User) => record.departmentId || '-',
    },
    {
      title: '権限',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={role === UserRole.COMPANY_ADMIN ? 'blue' : 'default'}>
          {roleLabels[role] || role}
        </Tag>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? '有効' : '無効'}
        </Tag>
      ),
    },
    {
      title: '最終ログイン',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Link href={`/dashboard/company/${companyId}/users/${record.id}/edit`}>
          <Button type="text" icon={<EditOutlined />}>
            編集
          </Button>
        </Link>
      ),
    },
  ];
  
  // ユーザーコンテンツの表示
  const renderUserContent = () => {
    if (error) {
      return <Alert type="error" message={error} />;
    }

    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>ユーザー情報を読み込み中...</div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <Empty
          description="登録ユーザーがいません"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Link href={`/dashboard/company/${companyId}/users/new`}>
            <Button type="primary">新規ユーザー作成</Button>
          </Link>
        </Empty>
      );
    }

    return <Table columns={columns} dataSource={users} rowKey="id" />;
  };
  
  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <Link href={`/dashboard/company/${companyId}`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              ダッシュボードに戻る
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>ユーザー管理</Title>
        </Space>
        
        <Link href={`/dashboard/company/${companyId}/users/new`}>
          <Button type="primary" icon={<UserAddOutlined />}>
            新規ユーザー作成
          </Button>
        </Link>
      </div>

      <Card>
        {renderUserContent()}
      </Card>
    </Content>
  );
} 