'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Typography, 
  Layout, 
  Card, 
  Descriptions, 
  Button, 
  Tag, 
  Divider, 
  Space, 
  Spin, 
  Alert,
  Tabs,
  Timeline,
  Rate,
  Avatar,
  List,
  Table,
  Tooltip,
  Modal,
  message,
  Select,
  Form,
  Input
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  CalendarOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

// 応募者の状態表示用設定
const STATUS_CONFIG = {
  'new': { color: 'blue', text: '新規' },
  'screening': { color: 'cyan', text: '書類選考中' },
  'interview': { color: 'geekblue', text: '面接中' },
  'technical': { color: 'purple', text: '技術評価中' },
  'offer': { color: 'orange', text: 'オファー中' },
  'hired': { color: 'success', text: '採用決定' },
  'rejected': { color: 'error', text: '不採用' },
  'withdrawn': { color: 'default', text: '辞退' }
};

// 応募ソースの表示名
const SOURCE_LABELS = {
  'company_website': '自社サイト',
  'indeed': 'Indeed',
  'linkedin': 'LinkedIn',
  'referral': '紹介',
  'agency': '人材紹介会社',
  'job_fair': '就職フェア',
  'other': 'その他'
};

// 型定義を追加します
type CandidateSourceKey = keyof typeof SOURCE_LABELS;
type InterviewTypeKey = keyof typeof INTERVIEW_TYPE_LABELS;
type InterviewStatusKey = keyof typeof INTERVIEW_STATUS_CONFIG;
type CandidateStatusKey = keyof typeof STATUS_CONFIG;
type RecommendationKey = keyof typeof RECOMMENDATION_CONFIG;

// 仮の候補者データ取得API
const getCandidateDetail = async (candidateId: string) => {
  return new Promise<any>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        id: candidateId,
        name: '山田 太郎',
        email: 'yamada.taro@example.com',
        phone: '090-1234-5678',
        position: 'フロントエンドエンジニア',
        status: 'interview',
        source: 'linkedin',
        jobId: '1',
        jobTitle: 'フロントエンドエンジニア',
        rating: 4,
        appliedAt: '2024-03-15T09:30:00Z',
        updatedAt: '2024-03-20T14:20:00Z',
        birthDate: '1990-05-15',
        currentCompany: '株式会社テックスタート',
        expectedSalary: '600万円',
        availableFrom: '1ヶ月後',
        skills: `
- JavaScript/TypeScript: 5年
- React: 3年
- Vue.js: 2年
- HTML/CSS: 5年
- Node.js: 2年
- GraphQL: 1年
        `,
        education: `
- 東京大学 工学部 情報工学科 卒業 (2014年)
- プログラミングスクールA 受講 (2016年)
        `,
        notes: '前職ではECサイトのフロントエンド開発を担当。チームリーダーとしての経験もあり。',
        urls: {
          website: 'https://yamada-portfolio.example.com',
          linkedin: 'https://linkedin.com/in/taro-yamada',
          github: 'https://github.com/taroymd'
        },
        resumeFile: {
          name: '山田太郎_履歴書.pdf',
          url: '#'
        },
        timeline: [
          { id: '1', date: '2024-03-15T09:30:00Z', type: 'applied', title: '応募', description: 'オンラインフォームから応募' },
          { id: '2', date: '2024-03-16T10:00:00Z', type: 'status_change', title: 'ステータス変更', description: '書類選考中に変更' },
          { id: '3', date: '2024-03-18T15:30:00Z', type: 'note', title: 'メモ追加', description: '履歴書を確認、経験十分あり' },
          { id: '4', date: '2024-03-19T11:00:00Z', type: 'status_change', title: 'ステータス変更', description: '面接中に変更' },
          { id: '5', date: '2024-03-20T13:00:00Z', type: 'interview', title: '面接予定', description: '一次面接（佐々木、中村）' }
        ],
        interviews: [
          { 
            id: '1', 
            type: 'initial', 
            status: 'scheduled', 
            startTime: '2024-03-22T13:00:00Z', 
            endTime: '2024-03-22T14:00:00Z',
            location: 'オンライン (Zoom)',
            interviewers: [
              { id: '101', name: '佐々木 健太' },
              { id: '102', name: '中村 美香' }
            ]
          },
          { 
            id: '2', 
            type: 'technical', 
            status: 'pending', 
            startTime: null, 
            endTime: null,
            location: null,
            interviewers: []
          }
        ],
        evaluations: [
          {
            id: '1',
            interviewer: { id: '101', name: '佐々木 健太' },
            date: '2024-03-18T16:30:00Z',
            rating: 4,
            strengths: '技術力が高く、コミュニケーション能力も良好',
            weaknesses: '大規模プロジェクトの経験がやや不足',
            recommendation: 'positive'
          }
        ]
      });
    }, 1000);
  });
};

// 日付フォーマット関数
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// 面接種類の表示名
const INTERVIEW_TYPE_LABELS = {
  'initial': '一次面接',
  'technical': '技術面接',
  'team': 'チーム面接',
  'final': '最終面接',
  'other': 'その他'
};

// 面接ステータスの表示設定
const INTERVIEW_STATUS_CONFIG = {
  'scheduled': { color: 'processing', text: '予定あり' },
  'completed': { color: 'success', text: '完了' },
  'cancelled': { color: 'error', text: 'キャンセル' },
  'pending': { color: 'default', text: '未定' },
  'no_show': { color: 'warning', text: '欠席' }
};

// 評価の推薦設定
const RECOMMENDATION_CONFIG = {
  'positive': { color: 'success', text: '採用推薦', icon: <CheckCircleOutlined /> },
  'negative': { color: 'error', text: '不採用推薦', icon: <CloseCircleOutlined /> },
  'neutral': { color: 'warning', text: '判断保留', icon: <ExclamationCircleOutlined /> }
};

// 候補者のステータスを更新するAPI
const updateCandidateStatus = async (candidateId: string, status: string): Promise<any> => {
  return new Promise<any>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        success: true,
        message: 'ステータスが更新されました',
        newStatus: status
      });
    }, 1000);
  });
};

// 候補者にメールを送信するAPI
const sendEmailToCandidate = async (candidateId: string, emailData: { subject: string; body: string }): Promise<any> => {
  return new Promise<any>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        success: true,
        message: 'メールが送信されました'
      });
    }, 1000);
  });
};

// 評価追加API関数を追加
// 候補者の評価を追加するAPI
const addCandidateEvaluation = async (candidateId: string, evaluationData: any): Promise<any> => {
  return new Promise<any>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        success: true,
        message: '評価が追加されました',
        evaluation: {
          id: `eval-${Date.now()}`,
          interviewer: { 
            id: 'current-user-id', 
            name: '現在のユーザー' 
          },
          date: new Date().toISOString(),
          ...evaluationData
        }
      });
    }, 1000);
  });
};

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  const candidateId = typeof params.candidateId === 'string' ? params.candidateId : '';
  
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [messageApi, contextHolder] = message.useMessage();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusForm] = Form.useForm();
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailForm] = Form.useForm();
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [addingEvaluation, setAddingEvaluation] = useState(false);
  const [evaluationForm] = Form.useForm();
  
  useEffect(() => {
    const fetchCandidateDetail = async () => {
      if (!candidateId) return;
      
      setLoading(true);
      try {
        // APIを呼び出して応募者詳細を取得
        const data = await getCandidateDetail(candidateId);
        setCandidate(data);
      } catch (err) {
        console.error('応募者詳細の取得に失敗しました', err);
        setError('応募者情報の取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidateDetail();
  }, [candidateId]);
  
  const handleEditCandidate = () => {
    router.push(`/dashboard/company/${companyId}/candidates/${candidateId}/edit`);
  };
  
  const handleChangeStatus = () => {
    statusForm.setFieldsValue({
      status: candidate.status
    });
    setStatusModalVisible(true);
  };
  
  const handleSendEmail = () => {
    // メールのテンプレートを設定
    emailForm.setFieldsValue({
      to: candidate.email,
      subject: `【採用情報】${candidate.name}様へのご連絡`,
      body: `${candidate.name}様

お世話になっております。
株式会社○○採用担当でございます。

`
    });
    setEmailModalVisible(true);
  };
  
  const handleScheduleInterview = () => {
    // 面接予定登録画面に遷移
    router.push(`/dashboard/company/${companyId}/interviews/new?candidateId=${candidateId}`);
  };
  
  const handleAddEvaluation = () => {
    // 評価フォームの初期値をセット
    evaluationForm.setFieldsValue({
      rating: 3,
      recommendation: 'neutral',
      strengths: '',
      weaknesses: ''
    });
    setEvaluationModalVisible(true);
  };
  
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  const handleViewInterview = (interviewId: string) => {
    router.push(`/dashboard/company/${companyId}/interviews/${interviewId}`);
  };
  
  // ステータス変更を実行する関数を追加
  const handleStatusSubmit = async () => {
    try {
      const values = await statusForm.validateFields();
      setUpdatingStatus(true);
      
      // APIを呼び出してステータスを更新
      const result = await updateCandidateStatus(candidateId, values.status);
      
      if (result.success) {
        messageApi.success('ステータスを更新しました');
        
        // ローカルの候補者データを更新
        setCandidate((prev: any) => ({
          ...prev,
          status: values.status
        }));
        
        // タイムラインに項目を追加
        const newTimelineItem = {
          id: `timeline-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'status_change',
          title: 'ステータス変更',
          description: `${STATUS_CONFIG[candidate.status as CandidateStatusKey]?.text || candidate.status}から${STATUS_CONFIG[values.status as CandidateStatusKey]?.text || values.status}に変更されました`
        };
        
        setCandidate((prev: any) => ({
          ...prev,
          timeline: [newTimelineItem, ...prev.timeline]
        }));
        
        setStatusModalVisible(false);
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      messageApi.error('ステータスの更新に失敗しました');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // メール送信を実行する関数を追加（handleStatusSubmitの下に追加）
  const handleEmailSubmit = async () => {
    try {
      const values = await emailForm.validateFields();
      setSendingEmail(true);
      
      // APIを呼び出してメールを送信
      const result = await sendEmailToCandidate(candidateId, {
        subject: values.subject,
        body: values.body
      });
      
      if (result.success) {
        messageApi.success('メールを送信しました');
        
        // タイムラインに項目を追加
        const newTimelineItem = {
          id: `timeline-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'email',
          title: 'メール送信',
          description: `件名: ${values.subject}`
        };
        
        setCandidate((prev: any) => ({
          ...prev,
          timeline: [newTimelineItem, ...prev.timeline]
        }));
        
        setEmailModalVisible(false);
      }
    } catch (error) {
      console.error('メール送信エラー:', error);
      messageApi.error('メールの送信に失敗しました');
    } finally {
      setSendingEmail(false);
    }
  };
  
  // 評価追加を実行する関数を追加
  const handleEvaluationSubmit = async () => {
    try {
      const values = await evaluationForm.validateFields();
      setAddingEvaluation(true);
      
      // APIを呼び出して評価を追加
      const result = await addCandidateEvaluation(candidateId, values);
      
      if (result.success) {
        messageApi.success('評価を追加しました');
        
        // ローカルの候補者データを更新
        setCandidate((prev: any) => ({
          ...prev,
          evaluations: [result.evaluation, ...prev.evaluations]
        }));
        
        // タイムラインに項目を追加
        const newTimelineItem = {
          id: `timeline-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'note',
          title: '評価が追加されました',
          description: `${result.evaluation.interviewer.name}による評価`
        };
        
        setCandidate((prev: any) => ({
          ...prev,
          timeline: [newTimelineItem, ...prev.timeline]
        }));
        
        setEvaluationModalVisible(false);
      }
    } catch (error) {
      console.error('評価追加エラー:', error);
      messageApi.error('評価の追加に失敗しました');
    } finally {
      setAddingEvaluation(false);
    }
  };
  
  if (!companyId || !candidateId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert type="error" message="応募者情報の取得に必要なIDが見つかりません" />
      </Content>
    );
  }
  
  if (loading) {
    return (
      <Content style={{ padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>応募者情報を読み込み中...</div>
        </div>
      </Content>
    );
  }
  
  if (error || !candidate) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert 
          type="error" 
          message="エラー" 
          description={error || '応募者情報の取得に失敗しました。'}
        />
        <div style={{ marginTop: 16 }}>
          <Link href={`/dashboard/company/${companyId}/candidates`}>
            <Button>応募者一覧に戻る</Button>
          </Link>
        </div>
      </Content>
    );
  }
  
  // タイムラインの整形（日付でソート）
  const sortedTimeline = [...candidate.timeline].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // 面接一覧の整形（日付でソート）
  const sortedInterviews = [...candidate.interviews].sort((a, b) => {
    // nullの場合は後ろに配置
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
  const TimelineItem = ({ item }: { item: any }) => {
    let color = 'blue';
    let icon = null;
    
    switch (item.type) {
      case 'applied':
        color = 'green';
        icon = <UserOutlined />;
        break;
      case 'status_change':
        color = 'orange';
        icon = <ExclamationCircleOutlined />;
        break;
      case 'note':
        color = 'gray';
        icon = <FileOutlined />;
        break;
      case 'interview':
        color = 'blue';
        icon = <CalendarOutlined />;
        break;
      default:
        color = 'blue';
    }
    
    return (
      <Timeline.Item color={color} dot={icon && icon}>
        <div>
          <Text strong>{item.title}</Text>
          <div>{item.description}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{formatDate(item.date)}</div>
        </div>
      </Timeline.Item>
    );
  };
  
  // スキルと教育背景の整形（改行を保持）
  const formatTextWithLineBreaks = (text: string) => {
    if (!text) return null;
    
    return text.trim().split('\n').map((line, index) => {
      if (line.startsWith('- ')) {
        return (
          <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
            <div style={{ marginRight: '8px' }}>•</div>
            <div>{line.substring(2)}</div>
          </div>
        );
      }
      return <div key={index}>{line}</div>;
    });
  };

  // タブのアイテムを定義
  const tabItems = [
    {
      key: 'profile',
      label: 'プロフィール',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 2, marginRight: 24 }}>
              <Descriptions
                title="基本情報"
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="メールアドレス">{candidate.email}</Descriptions.Item>
                <Descriptions.Item label="電話番号">{candidate.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="応募職種">{candidate.jobTitle}</Descriptions.Item>
                <Descriptions.Item label="応募経路">{SOURCE_LABELS[candidate.source as CandidateSourceKey] || candidate.source}</Descriptions.Item>
                <Descriptions.Item label="応募日">{formatDate(candidate.appliedAt)}</Descriptions.Item>
                <Descriptions.Item label="生年月日">{candidate.birthDate || '-'}</Descriptions.Item>
                <Descriptions.Item label="現在の勤務先">{candidate.currentCompany || '-'}</Descriptions.Item>
                <Descriptions.Item label="希望年収">{candidate.expectedSalary || '-'}</Descriptions.Item>
                <Descriptions.Item label="入社可能時期">{candidate.availableFrom || '-'}</Descriptions.Item>
                <Descriptions.Item label="評価">
                  <Rate disabled defaultValue={candidate.rating} />
                </Descriptions.Item>
              </Descriptions>
              
              <Divider />
              
              {/* 履歴書・職務経歴書 */}
              {candidate.resumeFile && (
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>履歴書・職務経歴書</Title>
                  <Card 
                    size="small" 
                    style={{ width: '100%', marginBottom: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Space>
                        <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                        <div>
                          <div>{candidate.resumeFile.name}</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            アップロード日: {formatDate(candidate.appliedAt)}
                          </Text>
                        </div>
                      </Space>
                      <Button 
                        type="primary" 
                        shape="round" 
                        icon={<DownloadOutlined />}
                        size="small"
                      >
                        ダウンロード
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
              
              {/* スキル・経験 */}
              {candidate.skills && (
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>スキル・経験</Title>
                  <div>{formatTextWithLineBreaks(candidate.skills)}</div>
                </div>
              )}
              
              {/* 学歴 */}
              {candidate.education && (
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>学歴</Title>
                  <div>{formatTextWithLineBreaks(candidate.education)}</div>
                </div>
              )}
              
              {/* 備考 */}
              {candidate.notes && (
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>備考</Title>
                  <Paragraph>{candidate.notes}</Paragraph>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              {/* SNSリンク */}
              {candidate.urls && Object.keys(candidate.urls).some(key => candidate.urls[key]) && (
                <Card title="ウェブサイト・SNS" style={{ marginBottom: '24px' }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={Object.entries(candidate.urls).filter(([_, url]) => url)}
                    renderItem={([key, url]: [string, any]) => {
                      let icon;
                      let label;
                      
                      switch (key) {
                        case 'website':
                          icon = <GlobalOutlined />;
                          label = 'ウェブサイト';
                          break;
                        case 'linkedin':
                          icon = <LinkOutlined />;
                          label = 'LinkedIn';
                          break;
                        case 'github':
                          icon = <LinkOutlined />;
                          label = 'GitHub';
                          break;
                        default:
                          icon = <LinkOutlined />;
                          label = key;
                      }
                      
                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={icon}
                            title={<a href={url} target="_blank" rel="noopener noreferrer">{label}</a>}
                            description={url}
                          />
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              )}
              
              {/* アクションボタン */}
              <Card title="アクション" style={{ marginBottom: '24px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<CalendarOutlined />} 
                    block
                    onClick={handleScheduleInterview}
                  >
                    面接を設定
                  </Button>
                  <Button 
                    icon={<FileOutlined />} 
                    block
                    onClick={handleAddEvaluation}
                  >
                    評価を追加
                  </Button>
                </Space>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'timeline',
      label: 'タイムライン',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>応募者の履歴</Title>
          </div>
          
          <Timeline>
            {sortedTimeline.length > 0 ? (
              sortedTimeline.map(item => (
                <TimelineItem key={item.id} item={item} />
              ))
            ) : (
              <Timeline.Item color="gray">履歴がありません</Timeline.Item>
            )}
          </Timeline>
        </div>
      )
    },
    {
      key: 'interviews',
      label: '面接',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>面接予定</Title>
            <Button 
              type="primary" 
              icon={<CalendarOutlined />}
              onClick={handleScheduleInterview}
            >
              面接を設定
            </Button>
          </div>
          
          {sortedInterviews.length > 0 ? (
            <Table
              dataSource={sortedInterviews}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '日時',
                  dataIndex: 'startTime',
                  key: 'startTime',
                  render: (startTime, record) => {
                    if (!startTime) return <Tag color="default">未設定</Tag>;
                    return (
                      <div>
                        <div>{formatDate(startTime)}</div>
                        {record.endTime && (
                          <div style={{ color: '#888' }}>
                            〜 {new Date(record.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    );
                  }
                },
                {
                  title: '種類',
                  dataIndex: 'type',
                  key: 'type',
                  render: type => INTERVIEW_TYPE_LABELS[type as InterviewTypeKey] || type
                },
                {
                  title: '場所',
                  dataIndex: 'location',
                  key: 'location',
                  render: location => location || '-'
                },
                {
                  title: '面接官',
                  dataIndex: 'interviewers',
                  key: 'interviewers',
                  render: interviewers => {
                    if (!interviewers || interviewers.length === 0) return '-';
                    return interviewers.map((i: any) => i.name).join(', ');
                  }
                },
                {
                  title: 'ステータス',
                  dataIndex: 'status',
                  key: 'status',
                  render: status => (
                    <Tag color={INTERVIEW_STATUS_CONFIG[status as InterviewStatusKey]?.color || 'default'}>
                      {INTERVIEW_STATUS_CONFIG[status as InterviewStatusKey]?.text || status}
                    </Tag>
                  )
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Button 
                      type="link" 
                      onClick={() => handleViewInterview(record.id)}
                    >
                      詳細
                    </Button>
                  )
                }
              ]}
            />
          ) : (
            <Alert message="面接予定はありません" type="info" />
          )}
        </div>
      )
    },
    {
      key: 'evaluations',
      label: '評価',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>評価</Title>
            <Button 
              type="primary" 
              icon={<FileOutlined />}
              onClick={handleAddEvaluation}
            >
              評価を追加
            </Button>
          </div>
          
          {candidate.evaluations.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={candidate.evaluations}
              renderItem={(evaluation: any) => (
                <Card key={evaluation.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <Space>
                      <Avatar icon={<UserOutlined />} />
                      <div>
                        <div><strong>{evaluation.interviewer.name}</strong></div>
                        <Text type="secondary">{formatDate(evaluation.date)}</Text>
                      </div>
                    </Space>
                    <div>
                      <Rate disabled defaultValue={evaluation.rating} />
                      {evaluation.recommendation && (
                        <Tag 
                          color={RECOMMENDATION_CONFIG[evaluation.recommendation as RecommendationKey]?.color} 
                          icon={RECOMMENDATION_CONFIG[evaluation.recommendation as RecommendationKey]?.icon}
                          style={{ marginLeft: 8 }}
                        >
                          {RECOMMENDATION_CONFIG[evaluation.recommendation as RecommendationKey]?.text}
                        </Tag>
                      )}
                    </div>
                  </div>
                  
                  {evaluation.strengths && (
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>長所</Text>
                      <Paragraph>{evaluation.strengths}</Paragraph>
                    </div>
                  )}
                  
                  {evaluation.weaknesses && (
                    <div>
                      <Text strong>改善点</Text>
                      <Paragraph>{evaluation.weaknesses}</Paragraph>
                    </div>
                  )}
                </Card>
              )}
            />
          ) : (
            <Alert message="評価はまだありません" type="info" />
          )}
        </div>
      )
    }
  ];
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space align="center">
          <Link href={`/dashboard/company/${companyId}/candidates`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              応募者一覧に戻る
            </Button>
          </Link>
          <Avatar 
            size={48} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff', marginRight: 16 }}
          />
          <div>
            <Title level={2} style={{ margin: 0 }}>{candidate.name}</Title>
            <div>
              <Tag color={STATUS_CONFIG[candidate.status as CandidateStatusKey]?.color || 'default'}>
                {STATUS_CONFIG[candidate.status as CandidateStatusKey]?.text || candidate.status}
              </Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>{candidate.position}</Text>
            </div>
          </div>
        </Space>
        
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEditCandidate}>
            編集
          </Button>
          <Button icon={<ExclamationCircleOutlined />} onClick={handleChangeStatus}>
            ステータス変更
          </Button>
          <Button icon={<MailOutlined />} onClick={handleSendEmail}>
            メール送信
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarStyle={{ marginBottom: '24px' }}
          items={tabItems}
        />
      </Card>

      {/* ステータス変更モーダル */}
      <Modal
        title="ステータス変更"
        open={statusModalVisible}
        onOk={handleStatusSubmit}
        onCancel={() => setStatusModalVisible(false)}
        confirmLoading={updatingStatus}
        okText="更新"
        cancelText="キャンセル"
      >
        <Form
          form={statusForm}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="新しいステータス"
            rules={[{ required: true, message: 'ステータスを選択してください' }]}
          >
            <Select>
              {Object.entries(STATUS_CONFIG).map(([key, { text }]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={STATUS_CONFIG[key as CandidateStatusKey].color}>
                    {text}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* メール送信モーダル */}
      <Modal
        title="メール送信"
        open={emailModalVisible}
        onOk={handleEmailSubmit}
        onCancel={() => setEmailModalVisible(false)}
        confirmLoading={sendingEmail}
        okText="送信"
        cancelText="キャンセル"
        width={700}
      >
        <Form
          form={emailForm}
          layout="vertical"
        >
          <Form.Item
            name="to"
            label="宛先"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="subject"
            label="件名"
            rules={[{ required: true, message: '件名を入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="body"
            label="本文"
            rules={[{ required: true, message: '本文を入力してください' }]}
          >
            <Input.TextArea rows={10} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 評価追加モーダル */}
      <Modal
        title="評価を追加"
        open={evaluationModalVisible}
        onOk={handleEvaluationSubmit}
        onCancel={() => setEvaluationModalVisible(false)}
        confirmLoading={addingEvaluation}
        okText="追加"
        cancelText="キャンセル"
        width={700}
      >
        <Form
          form={evaluationForm}
          layout="vertical"
        >
          <Form.Item
            name="rating"
            label="総合評価"
            rules={[{ required: true, message: '評価を選択してください' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="recommendation"
            label="推薦"
            rules={[{ required: true, message: '推薦を選択してください' }]}
          >
            <Select>
              <Select.Option value="positive">
                <Tag color="success" icon={<CheckCircleOutlined />}>採用推薦</Tag>
              </Select.Option>
              <Select.Option value="neutral">
                <Tag color="warning" icon={<ExclamationCircleOutlined />}>判断保留</Tag>
              </Select.Option>
              <Select.Option value="negative">
                <Tag color="error" icon={<CloseCircleOutlined />}>不採用推薦</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="strengths"
            label="長所"
            rules={[{ required: true, message: '長所を入力してください' }]}
          >
            <Input.TextArea rows={4} placeholder="候補者の長所、高く評価できる点を記入してください" />
          </Form.Item>
          <Form.Item
            name="weaknesses"
            label="改善点"
            rules={[{ required: true, message: '改善点を入力してください' }]}
          >
            <Input.TextArea rows={4} placeholder="候補者の改善点、課題などを記入してください" />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
} 