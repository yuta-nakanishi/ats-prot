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
  Avatar,
  Tooltip,
  Input,
  Select,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  SearchOutlined,
  EllipsisOutlined, 
  UserOutlined,
  EyeOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

// 応募者のステータス
const CANDIDATE_STATUS = {
  NEW: 'new',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  TECHNICAL: 'technical',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

// 仮のデータ（実際の実装ではAPIから取得する）
const mockCandidates = [
  {
    id: '1',
    name: '山田 太郎',
    email: 'yamada.taro@example.com',
    phone: '090-1234-5678',
    position: 'フロントエンドエンジニア',
    status: CANDIDATE_STATUS.SCREENING,
    appliedAt: '2024-03-15T09:30:00Z',
    updatedAt: '2024-03-17T14:20:00Z',
    source: 'Indeed',
    interviewCount: 0,
    avatar: null,
    rating: 4,
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato.hanako@example.com',
    phone: '080-9876-5432',
    position: 'バックエンドエンジニア',
    status: CANDIDATE_STATUS.INTERVIEW,
    appliedAt: '2024-03-10T11:15:00Z',
    updatedAt: '2024-03-16T13:45:00Z',
    source: '自社サイト',
    interviewCount: 1,
    avatar: null,
    rating: 3,
  },
  {
    id: '3',
    name: '鈴木 一郎',
    email: 'suzuki.ichiro@example.com',
    phone: '070-1111-2222',
    position: 'UIデザイナー',
    status: CANDIDATE_STATUS.TECHNICAL,
    appliedAt: '2024-03-05T08:45:00Z',
    updatedAt: '2024-03-18T16:30:00Z',
    source: 'リファラル',
    interviewCount: 2,
    avatar: null,
    rating: 5,
  },
  {
    id: '4',
    name: '田中 直樹',
    email: 'tanaka.naoki@example.com',
    phone: '090-3333-4444',
    position: 'プロジェクトマネージャー',
    status: CANDIDATE_STATUS.OFFER,
    appliedAt: '2024-02-28T10:00:00Z',
    updatedAt: '2024-03-20T09:15:00Z',
    source: 'LinkedIn',
    interviewCount: 3,
    avatar: null,
    rating: 4,
  },
  {
    id: '5',
    name: '伊藤 美咲',
    email: 'ito.misaki@example.com',
    phone: '080-5555-6666',
    position: 'カスタマーサポート',
    status: CANDIDATE_STATUS.REJECTED,
    appliedAt: '2024-03-12T14:30:00Z',
    updatedAt: '2024-03-15T11:10:00Z',
    source: 'Indeed',
    interviewCount: 1,
    avatar: null,
    rating: 2,
  }
];

// 状態表示のための設定
const statusConfig: Record<string, { color: string; text: string }> = {
  [CANDIDATE_STATUS.NEW]: { color: 'blue', text: '新規' },
  [CANDIDATE_STATUS.SCREENING]: { color: 'cyan', text: '書類選考中' },
  [CANDIDATE_STATUS.INTERVIEW]: { color: 'geekblue', text: '面接中' },
  [CANDIDATE_STATUS.TECHNICAL]: { color: 'purple', text: '技術評価中' },
  [CANDIDATE_STATUS.OFFER]: { color: 'orange', text: 'オファー中' },
  [CANDIDATE_STATUS.HIRED]: { color: 'success', text: '採用決定' },
  [CANDIDATE_STATUS.REJECTED]: { color: 'error', text: '不採用' },
  [CANDIDATE_STATUS.WITHDRAWN]: { color: 'default', text: '辞退' },
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

// 星評価の表示
const renderRating = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        style={{ 
          color: i <= rating ? '#fadb14' : '#d9d9d9',
          marginRight: '2px'
        }}
      >
        ★
      </span>
    );
  }
  return <div>{stars}</div>;
};

export default function CandidatesPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  useEffect(() => {
    // APIからデータを取得する代わりにモックデータを使用
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        // TODO: 実際のAPIリクエストに置き換える
        // 仮のデータ取得処理
        setTimeout(() => {
          setCandidates(mockCandidates);
          setFilteredCandidates(mockCandidates);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('応募者データの取得に失敗しました', err);
        setError('応募者データの取得に失敗しました。再度お試しください。');
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [companyId]);
  
  // 検索とフィルタリング
  useEffect(() => {
    let result = [...candidates];
    
    // テキスト検索
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      result = result.filter(
        candidate => 
          candidate.name.toLowerCase().includes(lowerCaseSearch) ||
          candidate.email.toLowerCase().includes(lowerCaseSearch) ||
          candidate.position.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // ステータスフィルター
    if (statusFilter) {
      result = result.filter(candidate => candidate.status === statusFilter);
    }
    
    setFilteredCandidates(result);
  }, [candidates, searchText, statusFilter]);
  
  // 応募者項目の操作メニュー
  const getActionMenu = (record: any): MenuProps => ({
    items: [
      {
        key: 'view',
        label: '詳細を見る',
        icon: <EyeOutlined />,
        onClick: () => handleViewCandidate(record),
      },
      {
        key: 'email',
        label: 'メールを送信',
        icon: <MailOutlined />,
        onClick: () => handleSendEmail(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'reject',
        label: '不採用にする',
        icon: <CloseCircleOutlined />,
        danger: true,
        onClick: () => handleRejectCandidate(record),
        disabled: record.status === CANDIDATE_STATUS.REJECTED,
      },
    ],
  });
  
  // 行クリック時のハンドラー
  const handleRowClick = (record: any) => {
    return {
      onClick: () => {
        handleViewCandidate(record);
      },
      style: { cursor: 'pointer' }
    };
  };
  
  // 応募者操作関数（実際の実装ではAPIを呼び出す）
  const handleViewCandidate = (candidate: any) => {
    router.push(`/dashboard/company/${companyId}/candidates/${candidate.id}`);
  };
  
  const handleSendEmail = (candidate: any) => {
    // TODO: メール送信モーダルを表示する
    messageApi.info(`${candidate.name}にメールを送信します`);
  };
  
  const handleRejectCandidate = (candidate: any) => {
    confirm({
      title: '応募者を不採用にしますか？',
      icon: <ExclamationCircleOutlined />,
      content: '応募者のステータスが「不採用」に変更され、候補者に通知が送信されます。',
      okText: '不採用にする',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk() {
        // TODO: APIを呼び出して応募者のステータスを変更する
        const updatedCandidates = candidates.map(item => {
          if (item.id === candidate.id) {
            return { ...item, status: CANDIDATE_STATUS.REJECTED };
          }
          return item;
        });
        setCandidates(updatedCandidates);
        messageApi.success(`${candidate.name}を不採用にしました`);
      },
    });
  };
  
  const handleAddCandidate = () => {
    router.push(`/dashboard/company/${companyId}/candidates/new`);
  };
  
  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  
  const handleStatusChange = (value: string) => {
    setStatusFilter(value || null);
  };
  
  const columns = [
    {
      title: '応募者',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            src={record.avatar}
            style={{ backgroundColor: !record.avatar ? '#1890ff' : undefined }}
          />
          <div>
            <Text strong>{text}</Text>
            <div>
              <Text type="secondary">{record.email}</Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '応募職種',
      dataIndex: 'position',
      key: 'position',
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
      title: '評価',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => renderRating(rating),
    },
    {
      title: '面接数',
      dataIndex: 'interviewCount',
      key: 'interviewCount',
      render: (count: number) => (
        <Tooltip title={`${count}回の面接が完了`}>
          <span>{count}</span>
        </Tooltip>
      ),
    },
    {
      title: '応募日',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '更新日',
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
          <div style={{ marginTop: 16 }}>応募者情報を読み込み中...</div>
        </div>
      );
    }

    if (filteredCandidates.length === 0) {
      if (candidates.length === 0) {
        return (
          <Empty
            description="登録されている応募者はありません"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCandidate}>
              応募者を登録
            </Button>
          </Empty>
        );
      } else {
        return (
          <Empty
            description="検索条件に一致する応募者はいません"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        );
      }
    }

    return (
      <Table
        columns={columns}
        dataSource={filteredCandidates}
        rowKey="id"
        onRow={handleRowClick}
        rowClassName={() => 'candidate-row-hoverable'}
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
          <Title level={2} style={{ margin: 0 }}>応募者管理</Title>
        </Space>
        
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCandidate}>
          応募者を登録
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <Search
            placeholder="応募者を検索..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="ステータスでフィルター"
            style={{ width: 200 }}
            allowClear
            onChange={handleStatusChange}
          >
            {Object.entries(statusConfig).map(([key, { text }]) => (
              <Option key={key} value={key}>{text}</Option>
            ))}
          </Select>
        </div>
        {renderContent()}
      </Card>
      
      <style jsx global>{`
        .candidate-row-hoverable:hover {
          background-color: #f5f5f5;
          transition: background-color 0.3s;
        }
      `}</style>
    </Content>
  );
} 