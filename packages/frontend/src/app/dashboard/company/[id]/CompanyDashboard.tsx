'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTenantById } from '../../../../lib/api/tenant';
import { getCurrentUser } from '../../../../lib/api/auth';
import { formatDate } from '../../../../lib/utils/format';
import { Company, User } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Typography, 
  Layout, 
  Menu, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Descriptions, 
  Space, 
  Spin, 
  Alert,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  BranchesOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  SettingOutlined,
  FileTextOutlined,
  RightOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;

interface CompanyDashboardProps {
  companyId: string;
}

export default function CompanyDashboard({ companyId }: CompanyDashboardProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companyData, userData] = await Promise.all([
          getTenantById(companyId),
          getCurrentUser()
        ]);
        setCompany(companyData);
        setCurrentUser(userData);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの読み込みに失敗しました。ログインしているか確認してください。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId]);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="読み込み中...">
          <div className="p-12" />
        </Spin>
      </div>
    );
  }
  
  // エラー表示
  if (error || !company || !currentUser) {
    return (
      <Alert
        message="エラー"
        description={error || 'データの読み込みに失敗しました。'}
        type="error"
        showIcon
      />
    );
  }
  
  const isCompanyAdmin = currentUser.isCompanyAdmin;
  
  // 統計データ（実際はAPIから取得）
  const stats = {
    activeRecruitments: 5,
    totalCandidates: 38,
    interviewsThisWeek: 12,
  };

  // テーブルの列定義
  const columns = [
    {
      title: '名前',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '応募職種',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '応募日',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusTagColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: any) => (
        <Link href={`/dashboard/company/${companyId}/candidates/${record.id}`}>
          <Button type="link" size="small">詳細</Button>
        </Link>
      ),
    },
  ];

  // サンプルデータ
  const candidatesData = [
    { id: '1', name: '山田太郎', position: 'フロントエンドエンジニア', date: '2024-03-15', status: 'reviewing' },
    { id: '2', name: '佐藤花子', position: 'UIデザイナー', date: '2024-03-14', status: 'interviewed' },
    { id: '3', name: '鈴木一郎', position: 'バックエンドエンジニア', date: '2024-03-13', status: 'new' }
  ];

  // ログアウト処理
  const handleLogout = async () => {
    try {
      console.log('[Dashboard] ログアウト処理開始');
      // AuthContext経由でログアウト処理を実行
      await logout();
      // AuthContextのlogout関数内でリダイレクトするため、ここではリダイレクト不要
    } catch (error) {
      console.error('[Dashboard] ログアウトエラー:', error);
      setError('ログアウトに失敗しました。');
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>{company.name} ダッシュボード</Title>
        
        <Space>
          {isCompanyAdmin && (
            <>
              <Link href={`/dashboard/company/${companyId}/settings`}>
                <Button icon={<SettingOutlined />}>会社設定</Button>
              </Link>
              <Link href={`/dashboard/company/${companyId}/users`}>
                <Button type="primary" icon={<UserOutlined />}>ユーザー管理</Button>
              </Link>
            </>
          )}
          <Button 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            danger
          >
            ログアウト
          </Button>
        </Space>
      </div>

      {/* 統計カード */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" hoverable>
            <Statistic
              title="公開中の求人"
              value={stats.activeRecruitments}
              prefix={<FileTextOutlined />}
            />
            <div style={{ marginTop: '16px' }}>
              <Link href={`/dashboard/company/${companyId}/jobs`}>
                <Button type="link" style={{ padding: 0 }}>
                  求人を管理する <RightOutlined />
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card variant="borderless" hoverable>
            <Statistic
              title="候補者"
              value={stats.totalCandidates}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: '16px' }}>
              <Link href={`/dashboard/company/${companyId}/candidates`}>
                <Button type="link" style={{ padding: 0 }}>
                  候補者を確認する <RightOutlined />
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card variant="borderless" hoverable>
            <Statistic
              title="今週の面接"
              value={stats.interviewsThisWeek}
              prefix={<CalendarOutlined />}
            />
            <div style={{ marginTop: '16px' }}>
              <Link href={`/dashboard/company/${companyId}/interviews`}>
                <Button type="link" style={{ padding: 0 }}>
                  面接予定を確認する <RightOutlined />
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近の応募者 */}
      <Card
        title="最近の応募者"
        style={{ marginBottom: '24px' }}
        extra={
          <Link href={`/dashboard/company/${companyId}/candidates`}>
            <Button type="link">
              全ての応募者を見る <RightOutlined />
            </Button>
          </Link>
        }
      >
        <Table
          columns={columns}
          dataSource={candidatesData}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* 企業情報 */}
      <Card
        title="企業情報"
        extra={
          isCompanyAdmin && (
            <Link href={`/dashboard/company/${companyId}/settings`}>
              <Button type="link">
                企業情報を編集する <RightOutlined />
              </Button>
            </Link>
          )
        }
      >
        <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="会社名">{company.name}</Descriptions.Item>
          <Descriptions.Item label="業種">{company.industry || '未設定'}</Descriptions.Item>
          <Descriptions.Item label="Webサイト">
            {company.website ? (
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                {company.website}
              </a>
            ) : (
              '未設定'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="従業員数">{company.employeeCount || '未設定'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Content>
  );
}

// ステータスに応じたラベルを返す
function getStatusLabel(status: string): string {
  switch (status) {
    case 'new': return '新規';
    case 'reviewing': return '書類選考中';
    case 'interviewed': return '面接済み';
    case 'offered': return '内定';
    case 'rejected': return '不採用';
    default: return status;
  }
}

// ステータスに応じたタグの色を返す
function getStatusTagColor(status: string): string {
  switch (status) {
    case 'new': return 'blue';
    case 'reviewing': return 'gold';
    case 'interviewed': return 'purple';
    case 'offered': return 'green';
    case 'rejected': return 'red';
    default: return 'default';
  }
} 