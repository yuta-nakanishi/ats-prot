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
  Calendar,
  Badge,
  Tabs,
  Avatar,
  Tooltip,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  EllipsisOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  VideoCameraOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

dayjs.locale('ja');

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;
const { TabPane } = Tabs;

// 面接のステータス
const INTERVIEW_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// 仮のデータ（実際の実装ではAPIから取得する）
const mockInterviews = [
  {
    id: '1',
    candidateName: '山田 太郎',
    candidateId: '1',
    position: 'フロントエンドエンジニア',
    interviewers: [
      { id: '101', name: '佐々木 健太', avatar: null },
      { id: '102', name: '中村 美香', avatar: null }
    ],
    status: INTERVIEW_STATUS.SCHEDULED,
    startTime: '2024-06-10T10:00:00Z',
    endTime: '2024-06-10T11:00:00Z',
    type: '一次面接',
    location: 'オンライン (Zoom)',
    notes: '経験やスキルについて詳しく聞く',
  },
  {
    id: '2',
    candidateName: '佐藤 花子',
    candidateId: '2',
    position: 'バックエンドエンジニア',
    interviewers: [
      { id: '102', name: '中村 美香', avatar: null },
      { id: '103', name: '田中 直人', avatar: null }
    ],
    status: INTERVIEW_STATUS.COMPLETED,
    startTime: '2024-06-05T14:00:00Z',
    endTime: '2024-06-05T15:30:00Z',
    type: '二次面接',
    location: '本社 会議室A',
    notes: '技術的な質問を中心に行う',
  },
  {
    id: '3',
    candidateName: '鈴木 一郎',
    candidateId: '3',
    position: 'UIデザイナー',
    interviewers: [
      { id: '104', name: '山本 真理', avatar: null }
    ],
    status: INTERVIEW_STATUS.SCHEDULED,
    startTime: '2024-06-12T13:00:00Z',
    endTime: '2024-06-12T14:00:00Z',
    type: '一次面接',
    location: 'オンライン (Google Meet)',
    notes: 'ポートフォリオについて詳しく聞く',
  },
  {
    id: '4',
    candidateName: '田中 直樹',
    candidateId: '4',
    position: 'プロジェクトマネージャー',
    interviewers: [
      { id: '105', name: '伊藤 浩二', avatar: null },
      { id: '106', name: '小林 敏子', avatar: null }
    ],
    status: INTERVIEW_STATUS.CANCELLED,
    startTime: '2024-06-07T11:00:00Z',
    endTime: '2024-06-07T12:00:00Z',
    type: '最終面接',
    location: '本社 会議室B',
    notes: 'マネジメント経験について詳しく聞く',
  },
  {
    id: '5',
    candidateName: '伊藤 美咲',
    candidateId: '5',
    position: 'カスタマーサポート',
    interviewers: [
      { id: '107', name: '佐藤 雄太', avatar: null }
    ],
    status: INTERVIEW_STATUS.NO_SHOW,
    startTime: '2024-06-06T15:00:00Z',
    endTime: '2024-06-06T16:00:00Z',
    type: '一次面接',
    location: 'オンライン (Zoom)',
    notes: 'カスタマーサポートの経験について詳しく聞く',
  },
  {
    id: '6',
    candidateName: '鈴木 一郎',
    candidateId: '3',
    position: 'UIデザイナー',
    interviewers: [
      { id: '104', name: '山本 真理', avatar: null },
      { id: '106', name: '小林 敏子', avatar: null }
    ],
    status: INTERVIEW_STATUS.SCHEDULED,
    startTime: '2024-06-20T15:00:00Z',
    endTime: '2024-06-20T16:30:00Z',
    type: '二次面接',
    location: '本社 会議室A',
    notes: '実務スキルとチームワークについて確認',
  },
];

// 状態表示のための設定
const statusConfig: Record<string, { color: string; text: string }> = {
  [INTERVIEW_STATUS.SCHEDULED]: { color: 'blue', text: '予定あり' },
  [INTERVIEW_STATUS.COMPLETED]: { color: 'success', text: '完了' },
  [INTERVIEW_STATUS.CANCELLED]: { color: 'error', text: 'キャンセル' },
  [INTERVIEW_STATUS.NO_SHOW]: { color: 'warning', text: '欠席' },
};

// 日付フォーマット関数
const formatDate = (dateString: string) => {
  const date = dayjs(dateString);
  return date.format('YYYY年MM月DD日 HH:mm');
};

// 時間フォーマット関数
const formatTime = (dateString: string) => {
  const date = dayjs(dateString);
  return date.format('HH:mm');
};

export default function InterviewsPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState('calendar');
  
  useEffect(() => {
    // APIからデータを取得する代わりにモックデータを使用
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        // TODO: 実際のAPIリクエストに置き換える
        // 仮のデータ取得処理
        setTimeout(() => {
          setInterviews(mockInterviews);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('面接データの取得に失敗しました', err);
        setError('面接データの取得に失敗しました。再度お試しください。');
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, [companyId]);
  
  // 面接項目の操作メニュー
  const getActionMenu = (record: any): MenuProps => ({
    items: [
      {
        key: 'view',
        label: '詳細を見る',
        icon: <EyeOutlined />,
        onClick: () => handleViewInterview(record),
      },
      {
        key: 'edit',
        label: '編集',
        icon: <EditOutlined />,
        onClick: () => handleEditInterview(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'cancel',
        label: 'キャンセル',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleCancelInterview(record),
        disabled: record.status !== INTERVIEW_STATUS.SCHEDULED,
      },
    ],
  });
  
  // 行クリック時のハンドラー
  const handleRowClick = (record: any) => {
    return {
      onClick: () => {
        handleViewInterview(record);
      },
      style: { cursor: 'pointer' }
    };
  };
  
  // 面接操作関数（実際の実装ではAPIを呼び出す）
  const handleViewInterview = (interview: any) => {
    router.push(`/dashboard/company/${companyId}/interviews/${interview.id}`);
  };
  
  const handleEditInterview = (interview: any) => {
    router.push(`/dashboard/company/${companyId}/interviews/${interview.id}/edit`);
  };
  
  const handleCancelInterview = (interview: any) => {
    confirm({
      title: '面接をキャンセルしますか？',
      icon: <ExclamationCircleOutlined />,
      content: 'キャンセルすると応募者と面接官に通知が送信されます。',
      okText: 'キャンセル',
      okType: 'danger',
      cancelText: '戻る',
      onOk() {
        // TODO: APIを呼び出して面接をキャンセルする
        const updatedInterviews = interviews.map(item => {
          if (item.id === interview.id) {
            return { ...item, status: INTERVIEW_STATUS.CANCELLED };
          }
          return item;
        });
        setInterviews(updatedInterviews);
        messageApi.success(`${interview.candidateName}との面接をキャンセルしました`);
      },
    });
  };
  
  const handleAddInterview = () => {
    router.push(`/dashboard/company/${companyId}/interviews/new`);
  };
  
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  // カレンダーでの日付セル内のコンテンツレンダリング
  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayInterviews = interviews.filter(interview => {
      const interviewDate = dayjs(interview.startTime).format('YYYY-MM-DD');
      return interviewDate === dateStr;
    });
    
    if (dayInterviews.length === 0) {
      return null;
    }
    
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {dayInterviews.map(interview => (
          <li key={interview.id} style={{ margin: '3px 0' }}>
            <Badge
              status={
                interview.status === INTERVIEW_STATUS.CANCELLED ? 'error' :
                interview.status === INTERVIEW_STATUS.COMPLETED ? 'success' :
                interview.status === INTERVIEW_STATUS.NO_SHOW ? 'warning' :
                'processing'
              }
              text={
                <Tooltip title={`${interview.candidateName} - ${interview.position}`}>
                  <span style={{ fontSize: '12px' }}>
                    {`${formatTime(interview.startTime)} ${interview.candidateName.split(' ')[0]}`}
                  </span>
                </Tooltip>
              }
            />
          </li>
        ))}
      </ul>
    );
  };
  
  const columns = [
    {
      title: '日時',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (startTime: string, record: any) => (
        <div>
          <div>{formatDate(startTime)}</div>
          <div style={{ color: '#8c8c8c' }}>
            〜 {formatTime(record.endTime)}
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => {
        const dateA = new Date(a.startTime).getTime();
        const dateB = new Date(b.startTime).getTime();
        return dateA - dateB;
      },
      defaultSortOrder: 'ascend' as 'ascend',
    },
    {
      title: '応募者',
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <Text strong>{text}</Text>
            <div>
              <Text type="secondary">{record.position}</Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '面接官',
      dataIndex: 'interviewers',
      key: 'interviewers',
      render: (interviewers: any[]) => (
        <Avatar.Group maxCount={3}>
          {interviewers.map(interviewer => (
            <Tooltip key={interviewer.id} title={interviewer.name}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: '種類',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '場所',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => {
        const isOnline = text.toLowerCase().includes('オンライン');
        return (
          <Space>
            {isOnline && <VideoCameraOutlined style={{ color: '#1890ff' }} />}
            <span>{text}</span>
          </Space>
        );
      },
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
      filters: Object.entries(statusConfig).map(([key, { text }]) => ({
        text,
        value: key,
      })),
      onFilter: (value: any, record: any) => record.status === value,
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
          <div style={{ marginTop: 16 }}>面接情報を読み込み中...</div>
        </div>
      );
    }

    if (interviews.length === 0) {
      return (
        <Empty
          description="登録されている面接はありません"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddInterview}>
            面接を登録
          </Button>
        </Empty>
      );
    }

    if (activeTab === 'calendar') {
      return (
        <Calendar
          dateCellRender={dateCellRender}
          style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}
        />
      );
    } else {
      return (
        <Table
          columns={columns}
          dataSource={interviews}
          rowKey="id"
          onRow={handleRowClick}
          rowClassName={() => 'interview-row-hoverable'}
          pagination={{ pageSize: 10 }}
        />
      );
    }
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
          <Title level={2} style={{ margin: 0 }}>面接管理</Title>
        </Space>
        
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddInterview}>
          面接を登録
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          tabBarStyle={{ marginBottom: '16px' }}
        >
          <TabPane 
            tab={
              <span>
                <CalendarOutlined />
                カレンダー表示
              </span>
            } 
            key="calendar" 
          />
          <TabPane 
            tab={
              <span>
                <UnorderedListOutlined />
                リスト表示
              </span>
            } 
            key="list" 
          />
        </Tabs>
        {renderContent()}
      </Card>
      
      <style jsx global>{`
        .interview-row-hoverable:hover {
          background-color: #f5f5f5;
          transition: background-color 0.3s;
        }
      `}</style>
    </Content>
  );
} 