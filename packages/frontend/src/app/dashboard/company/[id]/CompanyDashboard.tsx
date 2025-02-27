'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTenantById } from '../../../../lib/api/tenant';
import { getCurrentUser } from '../../../../lib/api/auth';
import { getJobPostings } from '../../../../lib/api/job-postings';
import { getCandidates } from '../../../../lib/api/candidates';
import { formatDate } from '../../../../lib/utils/format';
import { Company, User, JobPosting, Candidate } from '../../../../types';
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
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviewsThisWeek, setInterviewsThisWeek] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companyData, userData, jobsData, candidatesData] = await Promise.all([
          getTenantById(companyId),
          getCurrentUser(),
          getJobPostings(companyId),
          getCandidates(companyId)
        ]);
        setCompany(companyData);
        setCurrentUser(userData);
        setJobPostings(jobsData);
        setCandidates(candidatesData);
        
        // 今週の面接数をカウント（仮実装：実際にはAPIから取得するか、候補者データから計算）
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        const today = new Date();
        
        // 候補者データから面接データを抽出して数をカウント（実際のデータ構造に合わせて調整が必要）
        let interviewCount = 0;
        candidatesData.forEach(candidate => {
          if (candidate.interviews) {
            candidate.interviews.forEach(interview => {
              const interviewDate = new Date(interview.date);
              if (
                interviewDate >= today && 
                interviewDate <= oneWeekFromNow && 
                interview.status === 'scheduled'
              ) {
                interviewCount++;
              }
            });
          }
        });
        
        setInterviewsThisWeek(interviewCount);
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
  
  // 実際のデータから統計情報を計算
  const stats = {
    activeRecruitments: jobPostings.filter(job => job.status === 'open').length,
    totalCandidates: candidates.length,
    interviewsThisWeek: interviewsThisWeek,
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
      render: (_: string, record: Candidate) => {
        const jobTitle = record.jobPosting?.title || record.position || '未指定';
        return jobTitle;
      }
    },
    {
      title: '応募日',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
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
      render: (_: any, record: Candidate) => (
        <Link href={`/dashboard/company/${companyId}/candidates/${record.id}`}>
          <Button type="link" size="small">詳細</Button>
        </Link>
      ),
    },
  ];

  // 最近の応募者データ（最新の3件を表示）
  const recentCandidates = candidates
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 3);

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
            <Button type="link">すべて表示</Button>
          </Link>
        }
      >
        {recentCandidates.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={recentCandidates} 
            rowKey="id" 
            pagination={false}
          />
        ) : (
          <div className="text-center py-4">
            <Text type="secondary">応募者がいません</Text>
            <div className="mt-2">
              <Link href={`/dashboard/company/${companyId}/candidates/new`}>
                <Button type="primary">候補者を追加</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* 会社情報 */}
      <Card title="会社情報">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} layout="vertical">
          <Descriptions.Item label="会社名">{company.name}</Descriptions.Item>
          <Descriptions.Item label="業種">{company.industry || '-'}</Descriptions.Item>
          <Descriptions.Item label="従業員数">{company.employeeCount ? `${company.employeeCount}名` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Webサイト">
            {company.website ? (
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                {company.website}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="説明">{company.description || '-'}</Descriptions.Item>
        </Descriptions>
        
        {isCompanyAdmin && (
          <div className="mt-4 text-right">
            <Link href={`/dashboard/company/${companyId}/settings`}>
              <Button>編集</Button>
            </Link>
          </div>
        )}
      </Card>
    </Content>
  );
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    new: '新規',
    screening: '書類選考中',
    interview: '面接中',
    technical: '技術評価中',
    offer: '内定',
    hired: '採用',
    rejected: '不採用',
    withdrawn: '辞退'
  };
  
  return statusMap[status] || status;
}

function getStatusTagColor(status: string): string {
  const colorMap: Record<string, string> = {
    new: 'blue',
    screening: 'cyan',
    interview: 'processing',
    technical: 'purple',
    offer: 'orange',
    hired: 'success',
    rejected: 'error',
    withdrawn: 'default'
  };
  
  return colorMap[status] || 'default';
} 