'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Typography, 
  Layout, 
  Card, 
  Button, 
  Descriptions, 
  Tag, 
  Divider, 
  Space, 
  Spin, 
  Alert,
  Tabs,
  List,
  Avatar,
  Modal,
  Statistic,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;
const { confirm } = Modal;

// 雇用形態の表示名
const EMPLOYMENT_TYPE_LABELS = {
  full_time: '正社員',
  contract: '契約社員',
  part_time: 'パートタイム',
  temporary: '派遣社員',
  internship: 'インターン',
  other: 'その他'
};

// 経験レベルの表示名
const EXPERIENCE_LEVEL_LABELS = {
  entry: '未経験可',
  junior: '1〜3年',
  mid: '3〜5年',
  senior: '5年以上',
  expert: '10年以上'
};

// 部署の表示名
const DEPARTMENT_LABELS = {
  development: '開発部',
  design: 'デザイン部',
  sales: '営業部',
  marketing: 'マーケティング部',
  hr: '人事部',
  support: 'サポート部',
  other: 'その他'
};

// 勤務地の表示名
const LOCATION_LABELS = {
  tokyo: '東京',
  osaka: '大阪',
  nagoya: '名古屋',
  fukuoka: '福岡',
  sapporo: '札幌',
  remote: 'リモート',
  other: 'その他'
};

// ステータスの表示設定
const STATUS_CONFIG = {
  draft: { color: 'default', text: '下書き' },
  published: { color: 'success', text: '公開中' },
  closed: { color: 'warning', text: '募集終了' },
  archived: { color: 'error', text: 'アーカイブ' }
};

// 仮の求人詳細取得API
const getJobDetail = async (jobId: string) => {
  return new Promise<any>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        id: jobId,
        companyId: 'company-123',
        title: 'フロントエンドエンジニア',
        department: 'development',
        type: 'full_time',
        experienceLevel: 'mid',
        location: 'tokyo',
        isRemote: true,
        salaryRange: {
          min: 400,
          max: 700
        },
        description: `
# 職務内容
- モダンなフロントエンド技術を使用したWebアプリケーションの開発
- UIコンポーネントの設計と実装
- バックエンドAPIとの連携
- テストコードの作成とメンテナンス
- ドキュメンテーションの作成と更新

当社のプロダクトは多くのユーザーに使われる重要なサービスです。ユーザー体験を向上させるための取り組みに、ぜひご参加ください。
        `,
        requirements: `
## 必須スキル・経験
- React, Vue, Angularなどのモダンフレームワークの使用経験（3年以上）
- HTML, CSS, JavaScriptの深い理解
- REST APIを使用した開発経験
- GitHubを使った開発フロー経験

## 歓迎スキル・経験
- TypeScriptの使用経験
- テスト駆動開発の経験
- CI/CDパイプラインの構築経験
- デザインシステムの構築・運用経験
        `,
        benefits: `
- フレックスタイム制
- リモートワーク可能
- 書籍購入支援
- カンファレンス参加費用補助
- 社内勉強会あり
- 各種社会保険完備
        `,
        selectionProcess: `
1. 書類選考
2. コーディングテスト
3. 一次面接（技術面接）
4. 二次面接（カルチャーフィット）
5. 最終面接（役員面接）
        `,
        status: 'published',
        applicationDeadline: '2024-09-30T23:59:59Z',
        applicantsCount: 8,
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-03-20T14:30:00Z',
        // モック用の応募者データ
        applicants: [
          { id: '1', name: '山田太郎', avatar: null, appliedAt: '2024-03-20T13:00:00Z', status: 'reviewing' },
          { id: '2', name: '佐藤花子', avatar: null, appliedAt: '2024-03-19T10:15:00Z', status: 'interviewing' },
          { id: '3', name: '鈴木一郎', avatar: null, appliedAt: '2024-03-18T09:30:00Z', status: 'rejected' }
        ]
      });
    }, 1000);
  });
};

// 仮の求人削除API
const deleteJob = async (jobId: string) => {
  return new Promise<void>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

// 日付フォーマット関数
const formatDate = (dateString: string) => {
  if (!dateString) return 'なし';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// マークダウンっぽいテキストを簡易整形
const renderFormattedText = (text: string) => {
  if (!text) return null;
  
  // 改行で分割
  const lines = text.trim().split('\n');
  
  return (
    <div>
      {lines.map((line, index) => {
        // 見出し (# で始まる行)
        if (line.startsWith('# ')) {
          return <Title level={3} key={index}>{line.substring(2)}</Title>;
        }
        // サブ見出し (## で始まる行)
        else if (line.startsWith('## ')) {
          return <Title level={4} key={index}>{line.substring(3)}</Title>;
        }
        // リスト項目 (- で始まる行)
        else if (line.startsWith('- ')) {
          return (
            <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
              <div style={{ marginRight: '8px' }}>•</div>
              <div>{line.substring(2)}</div>
            </div>
          );
        }
        // 番号付きリスト項目 (数字. で始まる行)
        else if (/^\d+\.\s/.test(line)) {
          const number = line.match(/^\d+/)?.[0] || '';
          return (
            <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
              <div style={{ marginRight: '8px', minWidth: '20px' }}>{number}.</div>
              <div>{line.substring(number.length + 2)}</div>
            </div>
          );
        }
        // 空行
        else if (line.trim() === '') {
          return <div key={index} style={{ height: '12px' }} />;
        }
        // 通常のテキスト
        else {
          return <Paragraph key={index}>{line}</Paragraph>;
        }
      })}
    </div>
  );
};

// 応募者のステータス表示用
const applicantStatusConfig = {
  new: { color: 'blue', text: '新規' },
  reviewing: { color: 'gold', text: '書類選考中' },
  interviewing: { color: 'purple', text: '面接中' },
  offered: { color: 'success', text: '内定' },
  rejected: { color: 'error', text: '不採用' },
  withdrawn: { color: 'default', text: '辞退' }
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  const jobId = typeof params.jobId === 'string' ? params.jobId : '';
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [messageApi, contextHolder] = message.useMessage();
  
  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!jobId) return;
      
      setLoading(true);
      try {
        // APIを呼び出して求人詳細を取得
        const data = await getJobDetail(jobId);
        setJob(data);
      } catch (err) {
        console.error('求人詳細の取得に失敗しました', err);
        setError('求人情報の取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetail();
  }, [jobId]);
  
  const handleEditJob = () => {
    router.push(`/dashboard/company/${companyId}/jobs/${jobId}/edit`);
  };
  
  const handleDuplicateJob = () => {
    // 求人複製機能（実際の実装ではAPIを呼び出す）
    messageApi.info('求人の複製機能は開発中です');
  };
  
  const handleDeleteJob = () => {
    confirm({
      title: '求人を削除しますか？',
      icon: <ExclamationCircleOutlined />,
      content: '求人を削除すると、関連する応募データも削除されます。この操作は取り消せません。',
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk: async () => {
        try {
          // APIを呼び出して求人を削除
          await deleteJob(jobId);
          messageApi.success('求人を削除しました');
          
          // 求人一覧に戻る
          setTimeout(() => {
            router.push(`/dashboard/company/${companyId}/jobs`);
          }, 1500);
        } catch (err) {
          console.error('求人の削除に失敗しました', err);
          messageApi.error('求人の削除に失敗しました。再度お試しください。');
        }
      }
    });
  };
  
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  const handleViewApplicant = (applicantId: string) => {
    router.push(`/dashboard/company/${companyId}/candidates/${applicantId}`);
  };
  
  if (!companyId || !jobId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert type="error" message="求人情報の取得に必要なIDが見つかりません" />
      </Content>
    );
  }
  
  if (loading) {
    return (
      <Content style={{ padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>求人情報を読み込み中...</div>
        </div>
      </Content>
    );
  }
  
  if (error || !job) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert 
          type="error" 
          message="エラー" 
          description={error || '求人情報の取得に失敗しました。'}
        />
        <div style={{ marginTop: 16 }}>
          <Link href={`/dashboard/company/${companyId}/jobs`}>
            <Button>求人一覧に戻る</Button>
          </Link>
        </div>
      </Content>
    );
  }
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <Link href={`/dashboard/company/${companyId}/jobs`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              求人一覧に戻る
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>{job.title}</Title>
          <Tag color={STATUS_CONFIG[job.status]?.color || 'default'}>
            {STATUS_CONFIG[job.status]?.text || job.status}
          </Tag>
        </Space>
        
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEditJob}>
            編集
          </Button>
          <Button icon={<CopyOutlined />} onClick={handleDuplicateJob}>
            複製
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDeleteJob}>
            削除
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarStyle={{ marginBottom: '24px' }}
        >
          <TabPane tab="求人詳細" key="details" />
          <TabPane 
            tab={
              <span>
                応募者 <Tag>{job.applicantsCount || 0}</Tag>
              </span>
            } 
            key="applicants"
          />
        </Tabs>
        
        {activeTab === 'details' ? (
          <div>
            {/* 基本情報 */}
            <Descriptions
              title="基本情報"
              bordered
              column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="部署">{DEPARTMENT_LABELS[job.department] || job.department}</Descriptions.Item>
              <Descriptions.Item label="雇用形態">{EMPLOYMENT_TYPE_LABELS[job.type] || job.type}</Descriptions.Item>
              <Descriptions.Item label="必要経験">{EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}</Descriptions.Item>
              <Descriptions.Item label="勤務地">
                {LOCATION_LABELS[job.location] || job.location}
                {job.isRemote && <Tag color="blue" style={{ marginLeft: 8 }}>リモート可</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="給与範囲">
                {job.salaryRange ? `${job.salaryRange.min}～${job.salaryRange.max}万円/年` : '応相談'}
              </Descriptions.Item>
              <Descriptions.Item label="応募締切日">{formatDate(job.applicationDeadline)}</Descriptions.Item>
              <Descriptions.Item label="作成日">{formatDate(job.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="最終更新日">{formatDate(job.updatedAt)}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            {/* 統計情報 */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={4}>統計情報</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <Card style={{ width: '200px' }}>
                  <Statistic
                    title="応募者数"
                    value={job.applicantsCount || 0}
                    prefix={<TeamOutlined />}
                  />
                </Card>
                
                <Card style={{ width: '200px' }}>
                  <Statistic
                    title="公開日数"
                    value={job.status === 'published' ? 30 : 0} // 仮の値
                    suffix="日"
                    prefix={<CalendarOutlined />}
                  />
                </Card>
                
                <Card style={{ width: '200px' }}>
                  <Statistic
                    title="残り日数"
                    value={job.applicationDeadline ? 15 : 0} // 仮の値
                    suffix="日"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </div>
            </div>
            
            <Divider />
            
            {/* 職務内容 */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={4}>職務内容</Title>
              {renderFormattedText(job.description)}
            </div>
            
            <Divider />
            
            {/* 応募要件 */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={4}>応募要件</Title>
              {renderFormattedText(job.requirements)}
            </div>
            
            <Divider />
            
            {/* 福利厚生 */}
            {job.benefits && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>福利厚生・特典</Title>
                  {renderFormattedText(job.benefits)}
                </div>
                <Divider />
              </>
            )}
            
            {/* 選考プロセス */}
            {job.selectionProcess && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={4}>選考プロセス</Title>
                {renderFormattedText(job.selectionProcess)}
              </div>
            )}
          </div>
        ) : (
          <div>
            <Title level={4}>応募者一覧</Title>
            {job.applicants && job.applicants.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={job.applicants}
                renderItem={(applicant: any) => (
                  <List.Item
                    actions={[
                      <Button 
                        key="view" 
                        type="link" 
                        icon={<EyeOutlined />}
                        onClick={() => handleViewApplicant(applicant.id)}
                      >
                        詳細
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} src={applicant.avatar} />}
                      title={<a onClick={() => handleViewApplicant(applicant.id)}>{applicant.name}</a>}
                      description={
                        <Space>
                          <span>応募日: {formatDate(applicant.appliedAt)}</span>
                          <Tag color={applicantStatusConfig[applicant.status]?.color || 'default'}>
                            {applicantStatusConfig[applicant.status]?.text || applicant.status}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Alert message="まだ応募者がいません" type="info" />
            )}
          </div>
        )}
      </Card>
    </Content>
  );
} 