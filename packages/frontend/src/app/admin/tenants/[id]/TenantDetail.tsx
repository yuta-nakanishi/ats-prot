'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Typography, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Tabs, 
  Table, 
  Card, 
  Avatar, 
  Row, 
  Col, 
  Statistic,
  Spin
} from 'antd';
import {
  UserOutlined,
  GlobalOutlined,
  TeamOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  EditOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { getTenantById } from '../../../../lib/api/tenant';
import { formatDate } from '../../../../lib/utils/format';
import { UserRole, Company } from '@/types';

interface TenantDetailProps {
  id: string;
}

export default function TenantDetail({ id }: TenantDetailProps) {
  const [tenant, setTenant] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { Title, Paragraph } = Typography;

  useEffect(() => {
    async function fetchTenant() {
      try {
        setLoading(true);
        const data = await getTenantById(id);
        
        // デバッグログ: ユーザー情報が含まれているか確認
        console.log(`テナント「${data.name}」のユーザー情報:`, {
          usersArray: data.users,
          usersCount: data.users?.length || 0
        });
        
        setTenant(data);
      } catch (err) {
        console.error('テナント情報の取得に失敗しました:', err);
        setError('テナント情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchTenant();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <div style={{ marginTop: 16 }}>テナント情報を読み込み中...</div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>
        {error || 'テナント情報の取得に失敗しました'}
      </div>
    );
  }

  // ユーザーロール名の日本語表示マッピング
  const roleLabels: { [key in UserRole]: string } = {
    [UserRole.COMPANY_ADMIN]: '管理者',
    [UserRole.HIRING_MANAGER]: '採用マネージャー',
    [UserRole.RECRUITER]: 'リクルーター',
    [UserRole.INTERVIEWER]: '面接官',
    [UserRole.READONLY]: '閲覧専用'
  };

  // ユーザー一覧用のテーブルカラム定義
  const userColumns = [
    {
      title: '名前',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'メールアドレス',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'ロール',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color="blue">{roleLabels[role] || role}</Tag>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        isActive 
          ? <Tag color="success">アクティブ</Tag>
          : <Tag color="error">無効</Tag>
      ),
    },
    {
      title: '最終ログイン',
      dataIndex: 'lastLoginAt',
      key: 'lastLogin',
      render: (date: string) => date ? formatDate(date) : '-',
    },
  ];

  // タブアイテムの定義
  const tabItems = [
    {
      key: 'basic',
      label: (
        <span>
          <InfoCircleOutlined />
          基本情報
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="テナント名">{tenant.name}</Descriptions.Item>
          <Descriptions.Item label="テナントID">{tenant.tenantId}</Descriptions.Item>
          <Descriptions.Item label="業種">{tenant.industry || '未設定'}</Descriptions.Item>
          <Descriptions.Item label="従業員数">{tenant.employeeCount || '未設定'}</Descriptions.Item>
          <Descriptions.Item label="Webサイト" span={2}>
            {tenant.website ? (
              <a href={tenant.website} target="_blank" rel="noopener noreferrer">
                <Space>
                  <GlobalOutlined />
                  {tenant.website}
                </Space>
              </a>
            ) : (
              '未設定'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="説明" span={2}>
            {tenant.description || '未設定'}
          </Descriptions.Item>
          <Descriptions.Item label="作成日">
            <Space>
              <CalendarOutlined />
              {formatDate(tenant.createdAt)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="最終更新日">
            <Space>
              <CalendarOutlined />
              {formatDate(tenant.updatedAt)}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'users',
      label: (
        <span>
          <TeamOutlined />
          ユーザー ({tenant.users?.length || 0})
        </span>
      ),
      children: (
        <>
          {tenant.users && tenant.users.length > 0 ? (
            <Table 
              dataSource={tenant.users} 
              columns={userColumns} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <TeamOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Paragraph>
                ユーザーが登録されていません。{' '}
                {tenant.users === undefined && (
                  <span style={{ color: 'orange' }}>
                    （ユーザー情報を取得できていない可能性があります）
                  </span>
                )}
              </Paragraph>
              <Button 
                type="primary" 
                icon={<UserOutlined />}
                style={{ marginTop: 16 }}
              >
                <Link href={`/admin/tenants/${tenant.id}/users/new`}>
                  ユーザーを追加
                </Link>
              </Button>
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      {/* ヘッダー部分 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Title level={2}>{tenant.name}</Title>
          <Paragraph type="secondary">
            テナントID: {tenant.tenantId}
          </Paragraph>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <Space>
            <Button type="primary" icon={<EditOutlined />}>
              <Link href={`/admin/tenants/${tenant.id}/edit`}>編集</Link>
            </Button>
            <Button>
              <Link href={`/admin/tenants/${tenant.id}/users`}>ユーザー管理</Link>
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 概要カード部分 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="ユーザー数" 
              value={tenant.users !== undefined ? tenant.users.length : '-'} 
              prefix={<TeamOutlined />} 
              valueStyle={tenant.users === undefined ? { color: '#faad14' } : undefined}
              suffix={tenant.users === undefined ? <span style={{ fontSize: '14px', color: '#faad14' }}>データ取得中...</span> : null}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="作成日" 
              value={new Date(tenant.createdAt).toLocaleDateString('ja-JP')}
              prefix={<CalendarOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      {/* タブコンテンツ */}
      <Tabs defaultActiveKey="basic" items={tabItems} />
    </div>
  );
} 