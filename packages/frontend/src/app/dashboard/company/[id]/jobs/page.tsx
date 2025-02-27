'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Typography, 
  Layout, 
  Card, 
  Table, 
  Tag, 
  Button, 
  Spin, 
  Alert,
  Space,
  Dropdown,
  MenuProps,
  Modal,
  message,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  EllipsisOutlined, 
  EditOutlined,
  CopyOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

// 求人のステータス
const JOB_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  ARCHIVED: 'archived'
};

// 仮のデータ（実際の実装ではAPIから取得する）
const mockJobs = [
  {
    id: '1',
    title: 'フロントエンドエンジニア',
    department: '開発部',
    location: '東京',
    type: '正社員',
    status: JOB_STATUS.PUBLISHED,
    applicantsCount: 12,
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },
  {
    id: '2',
    title: 'バックエンドエンジニア',
    department: '開発部',
    location: '東京',
    type: '正社員',
    status: JOB_STATUS.PUBLISHED,
    applicantsCount: 8,
    createdAt: '2024-03-12T10:15:00Z',
    updatedAt: '2024-03-14T11:45:00Z',
  },
  {
    id: '3',
    title: 'UIデザイナー',
    department: 'デザイン部',
    location: '大阪',
    type: '正社員',
    status: JOB_STATUS.DRAFT,
    applicantsCount: 0,
    createdAt: '2024-03-18T08:30:00Z',
    updatedAt: '2024-03-18T08:30:00Z',
  },
  {
    id: '4',
    title: 'プロジェクトマネージャー',
    department: '事業部',
    location: '東京',
    type: '正社員',
    status: JOB_STATUS.CLOSED,
    applicantsCount: 15,
    createdAt: '2024-02-20T14:00:00Z',
    updatedAt: '2024-03-20T15:10:00Z',
  },
  {
    id: '5',
    title: 'カスタマーサポート',
    department: 'サポート部',
    location: 'リモート',
    type: 'パートタイム',
    status: JOB_STATUS.PUBLISHED,
    applicantsCount: 4,
    createdAt: '2024-03-15T09:45:00Z',
    updatedAt: '2024-03-17T16:20:00Z',
  }
];

// 状態表示のための設定
const statusConfig: Record<string, { color: string; text: string }> = {
  [JOB_STATUS.DRAFT]: { color: 'default', text: '下書き' },
  [JOB_STATUS.PUBLISHED]: { color: 'success', text: '公開中' },
  [JOB_STATUS.CLOSED]: { color: 'warning', text: '募集終了' },
  [JOB_STATUS.ARCHIVED]: { color: 'error', text: 'アーカイブ' },
};

// 日付フォーマット関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function JobsPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  useEffect(() => {
    // APIからデータを取得する代わりにモックデータを使用
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // TODO: 実際のAPIリクエストに置き換える
        // 仮のデータ取得処理
        setTimeout(() => {
          setJobs(mockJobs);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('求人データの取得に失敗しました', err);
        setError('求人データの取得に失敗しました。再度お試しください。');
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [companyId]);
  
  // 求人項目の操作メニュー
  const getActionMenu = (record: any): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: '編集',
        icon: <EditOutlined />,
        onClick: () => handleEditJob(record),
      },
      {
        key: 'view',
        label: '詳細を見る',
        icon: <EyeOutlined />,
        onClick: () => handleViewJob(record),
      },
      {
        key: 'duplicate',
        label: '複製する',
        icon: <CopyOutlined />,
        onClick: () => handleDuplicateJob(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: '削除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteJob(record),
      },
    ],
  });
  
  // 行クリック時のハンドラー
  const handleRowClick = (record: any) => {
    return {
      onClick: () => {
        handleViewJob(record);
      },
      style: { cursor: 'pointer' }
    };
  };
  
  // 求人操作関数（実際の実装ではAPIを呼び出す）
  const handleCreateJob = () => {
    router.push(`/dashboard/company/${companyId}/jobs/new`);
  };
  
  const handleEditJob = (job: any) => {
    router.push(`/dashboard/company/${companyId}/jobs/${job.id}/edit`);
  };
  
  const handleViewJob = (job: any) => {
    router.push(`/dashboard/company/${companyId}/jobs/${job.id}`);
  };
  
  const handleDuplicateJob = (job: any) => {
    // TODO: APIを呼び出して求人を複製する
    messageApi.info(`「${job.title}」を複製しました`);
  };
  
  const handleDeleteJob = (job: any) => {
    confirm({
      title: '求人を削除しますか？',
      icon: <ExclamationCircleOutlined />,
      content: '削除した求人は復元できません。この操作は取り消せません。',
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk() {
        // TODO: APIを呼び出して求人を削除する
        messageApi.success(`「${job.title}」を削除しました`);
        // 一時的な処理として、UIから削除
        setJobs(jobs.filter(item => item.id !== job.id));
      },
    });
  };
  
  const columns = [
    {
      title: '求人タイトル',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '部署',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '勤務地',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '雇用形態',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].text}
        </Tag>
      ),
    },
    {
      title: '応募者数',
      dataIndex: 'applicantsCount',
      key: 'applicantsCount',
    },
    {
      title: '最終更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: any) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button
            type="text"
            icon={<EllipsisOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];
  
  if (!companyId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert type="error" message="会社IDが見つかりません" />
      </Content>
    );
  }
  
  const renderContent = () => {
    if (error) {
      return <Alert type="error" message={error} />;
    }

    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>求人情報を読み込み中...</div>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <Empty
          description="登録されている求人はありません"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateJob}>
            新規求人を作成
          </Button>
        </Empty>
      );
    }

    return (
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="id"
        onRow={handleRowClick}
        rowClassName={() => 'job-row-hoverable'}
      />
    );
  };
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <Link href={`/dashboard/company/${companyId}`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              ダッシュボードに戻る
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>求人管理</Title>
        </Space>
        
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateJob}>
          新規求人を作成
        </Button>
      </div>

      <Card>
        {renderContent()}
      </Card>
      
      <style jsx global>{`
        .job-row-hoverable:hover {
          background-color: #f5f5f5;
          transition: background-color 0.3s;
        }
      `}</style>
    </Content>
  );
} 