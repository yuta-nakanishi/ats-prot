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
import { getJobPostings, deleteJobPosting, duplicateJobPosting } from '@/lib/api/job-postings';
import { JobPosting } from '@/types';

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

// 求人のステータス
const JOB_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'open',
  CLOSED: 'closed',
  ARCHIVED: 'archived'
};

// 状態表示のための設定
const statusConfig: Record<string, { color: string; text: string }> = {
  [JOB_STATUS.DRAFT]: { color: 'default', text: '下書き' },
  [JOB_STATUS.PUBLISHED]: { color: 'success', text: '公開中' },
  [JOB_STATUS.CLOSED]: { color: 'warning', text: '募集終了' },
  [JOB_STATUS.ARCHIVED]: { color: 'error', text: 'アーカイブ' },
};

// 日付フォーマット関数
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return '日付なし';
  }
  
  try {
    const date = new Date(dateString);
    // 無効な日付かチェック
    if (isNaN(date.getTime())) {
      return '無効な日付';
    }
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (err) {
    console.error('日付のフォーマットに失敗しました', err);
    return '無効な日付';
  }
};

export default function JobsPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  useEffect(() => {
    // APIからデータを取得
    const fetchJobs = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const fetchedJobs = await getJobPostings(companyId);
        setJobs(fetchedJobs);
      } catch (err) {
        console.error('求人データの取得に失敗しました', err);
        setError('求人データの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [companyId]);
  
  // 求人項目の操作メニュー
  const getActionMenu = (record: JobPosting): MenuProps => ({
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
  const handleRowClick = (record: JobPosting) => {
    return {
      onClick: () => {
        handleViewJob(record);
      },
      style: { cursor: 'pointer' }
    };
  };
  
  // 求人操作関数
  const handleCreateJob = () => {
    router.push(`/dashboard/company/${companyId}/jobs/new`);
  };
  
  const handleEditJob = (job: JobPosting) => {
    router.push(`/dashboard/company/${companyId}/jobs/${job.id}/edit`);
  };
  
  const handleViewJob = (job: JobPosting) => {
    router.push(`/dashboard/company/${companyId}/jobs/${job.id}`);
  };
  
  const handleDuplicateJob = async (job: JobPosting) => {
    try {
      await duplicateJobPosting(job.id);
      messageApi.success(`「${job.title}」を複製しました`);
      
      // 求人リストを再取得
      const updatedJobs = await getJobPostings(companyId);
      setJobs(updatedJobs);
    } catch (err) {
      console.error('求人の複製に失敗しました', err);
      messageApi.error('求人の複製に失敗しました');
    }
  };
  
  const handleDeleteJob = (job: JobPosting) => {
    confirm({
      title: '求人を削除しますか？',
      icon: <ExclamationCircleOutlined />,
      content: '削除した求人は復元できません。この操作は取り消せません。',
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk: async () => {
        try {
          await deleteJobPosting(job.id);
          messageApi.success(`「${job.title}」を削除しました`);
          
          // 求人リストから削除した求人を除外
          setJobs(jobs.filter(item => item.id !== job.id));
        } catch (err) {
          console.error('求人の削除に失敗しました', err);
          messageApi.error('求人の削除に失敗しました');
        }
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
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          'full-time': '正社員',
          'part-time': 'パートタイム',
          'contract': '契約社員'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusConfig[status]?.color || 'default'}>
          {statusConfig[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '応募者数',
      key: 'applicantsCount',
      render: (_: unknown, record: JobPosting) => {
        // APIレスポンスにcandidatesプロパティがない場合は0を表示
        return 0; // バックエンドAPIから応募者数を取得するロジックを実装予定
      },
    },
    {
      title: '最終更新',
      key: 'updatedAt',
      render: (_: unknown, record: JobPosting) => {
        // JobPosting型にはupdatedAtがないため、postedDateを使用
        return formatDate(record.postedDate);
      },
    },
    {
      title: '',
      key: 'action',
      render: (_: unknown, record: JobPosting) => (
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