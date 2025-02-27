'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Typography, 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  InputNumber,
  Switch,
  Divider,
  Space,
  message,
  Alert,
  Spin
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  FormOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

// 雇用形態の選択肢
const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: '正社員' },
  { value: 'contract', label: '契約社員' },
  { value: 'part_time', label: 'パートタイム' },
  { value: 'temporary', label: '派遣社員' },
  { value: 'internship', label: 'インターン' },
  { value: 'other', label: 'その他' }
];

// 経験レベルの選択肢
const EXPERIENCE_LEVELS = [
  { value: 'entry', label: '未経験可' },
  { value: 'junior', label: '1〜3年' },
  { value: 'mid', label: '3〜5年' },
  { value: 'senior', label: '5年以上' },
  { value: 'expert', label: '10年以上' }
];

// 求人ステータスの選択肢
const JOB_STATUSES = [
  { value: 'draft', label: '下書き' },
  { value: 'published', label: '公開中' },
  { value: 'closed', label: '募集終了' },
  { value: 'archived', label: 'アーカイブ' }
];

// 部署の選択肢（実際の実装ではAPIから取得）
const DEPARTMENTS = [
  { value: 'development', label: '開発部' },
  { value: 'design', label: 'デザイン部' },
  { value: 'sales', label: '営業部' },
  { value: 'marketing', label: 'マーケティング部' },
  { value: 'hr', label: '人事部' },
  { value: 'support', label: 'サポート部' },
  { value: 'other', label: 'その他' }
];

// 勤務地の選択肢（実際の実装ではAPIから取得）
const LOCATIONS = [
  { value: 'tokyo', label: '東京' },
  { value: 'osaka', label: '大阪' },
  { value: 'nagoya', label: '名古屋' },
  { value: 'fukuoka', label: '福岡' },
  { value: 'sapporo', label: '札幌' },
  { value: 'remote', label: 'リモート' },
  { value: 'other', label: 'その他' }
];

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
        updatedAt: '2024-03-20T14:30:00Z'
      });
    }, 1000);
  });
};

// 仮の求人更新API
const updateJob = async (jobId: string, jobData: any) => {
  return new Promise((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        id: jobId,
        ...jobData,
        updatedAt: new Date().toISOString()
      });
    }, 1000);
  });
};

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  const jobId = typeof params.jobId === 'string' ? params.jobId : '';
  
  const [form] = Form.useForm();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!jobId) return;
      
      setLoading(true);
      try {
        // APIを呼び出して求人詳細を取得
        const data = await getJobDetail(jobId);
        setJob(data);
        
        // フォームに初期値をセット
        form.setFieldsValue({
          ...data,
          applicationDeadline: data.applicationDeadline ? dayjs(data.applicationDeadline) : undefined,
          salaryRangeMin: data.salaryRange?.min,
          salaryRangeMax: data.salaryRange?.max
        });
      } catch (err) {
        console.error('求人詳細の取得に失敗しました', err);
        setError('求人情報の取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetail();
  }, [jobId, form]);
  
  if (!companyId || !jobId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert type="error" message="求人情報の取得に必要なIDが見つかりません" />
      </Content>
    );
  }
  
  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      // 給与範囲の処理
      const formattedValues = {
        ...values,
        salaryRange: {
          min: values.salaryRangeMin,
          max: values.salaryRangeMax
        },
        // APIに送る際は、salaryRangeMinとsalaryRangeMaxは不要
        salaryRangeMin: undefined,
        salaryRangeMax: undefined,
        // 日付の処理
        applicationDeadline: values.applicationDeadline ? values.applicationDeadline.toISOString() : null
      };
      
      // APIを呼び出して求人を更新
      await updateJob(jobId, formattedValues);
      
      messageApi.success('求人を更新しました');
      
      // 更新されたデータを取得
      const updatedJob = await getJobDetail(jobId);
      setJob(updatedJob);
      
      // 詳細ページに戻る（遅延を入れてメッセージを表示する時間を確保）
      setTimeout(() => {
        router.push(`/dashboard/company/${companyId}/jobs/${jobId}`);
      }, 1500);
    } catch (err) {
      console.error('求人更新に失敗しました', err);
      messageApi.error('求人の更新に失敗しました。再度お試しください。');
    } finally {
      setSaving(false);
    }
  };
  
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
          <Link href={`/dashboard/company/${companyId}/jobs/${jobId}`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              求人詳細に戻る
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>求人を編集: {job.title}</Title>
        </Space>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Divider orientation="left">基本情報</Divider>
          
          <Form.Item
            name="title"
            label="求人タイトル"
            rules={[{ required: true, message: '求人タイトルを入力してください' }]}
          >
            <Input placeholder="例: フロントエンドエンジニア" maxLength={100} />
          </Form.Item>
          
          <Form.Item
            name="department"
            label="部署"
            rules={[{ required: true, message: '部署を選択してください' }]}
          >
            <Select placeholder="部署を選択">
              {DEPARTMENTS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="type"
            label="雇用形態"
            rules={[{ required: true, message: '雇用形態を選択してください' }]}
          >
            <Select placeholder="雇用形態を選択">
              {EMPLOYMENT_TYPES.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="experienceLevel"
            label="必要経験"
            rules={[{ required: true, message: '必要経験を選択してください' }]}
          >
            <Select placeholder="必要経験を選択">
              {EXPERIENCE_LEVELS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Divider orientation="left">勤務条件</Divider>
          
          <Form.Item
            name="location"
            label="勤務地"
            rules={[{ required: true, message: '勤務地を選択してください' }]}
          >
            <Select placeholder="勤務地を選択">
              {LOCATIONS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isRemote"
            label="リモートワーク"
            valuePropName="checked"
          >
            <Switch checkedChildren="可" unCheckedChildren="不可" />
          </Form.Item>
          
          <Form.Item label="給与範囲（万円/年）">
            <Space>
              <Form.Item
                name="salaryRangeMin"
                noStyle
              >
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder="最小"
                  style={{ width: 120 }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <span>〜</span>
              <Form.Item
                name="salaryRangeMax"
                noStyle
              >
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder="最大"
                  style={{ width: 120 }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Space>
          </Form.Item>
          
          <Divider orientation="left">募集詳細</Divider>
          
          <Form.Item
            name="description"
            label="職務内容"
            rules={[{ required: true, message: '職務内容を入力してください' }]}
          >
            <TextArea
              placeholder="担当する業務内容や役割について詳しく記入してください"
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={5000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="requirements"
            label="応募要件"
            rules={[{ required: true, message: '応募要件を入力してください' }]}
          >
            <TextArea
              placeholder="必須スキルや経験、資格などを箇条書きで記入してください"
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={3000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="benefits"
            label="福利厚生・特典"
          >
            <TextArea
              placeholder="給与以外の福利厚生や特典について記入してください"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={2000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="selectionProcess"
            label="選考プロセス"
          >
            <TextArea
              placeholder="選考ステップや面接回数などを記入してください"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={1000}
              showCount
            />
          </Form.Item>
          
          <Divider orientation="left">公開設定</Divider>
          
          <Form.Item
            name="status"
            label="公開ステータス"
            rules={[{ required: true, message: '公開ステータスを選択してください' }]}
          >
            <Select placeholder="ステータスを選択">
              {JOB_STATUSES.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="applicationDeadline"
            label="応募締切日"
          >
            <DatePicker placeholder="締切日を選択" style={{ width: '100%' }} />
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                保存
              </Button>
              
              <Link href={`/dashboard/company/${companyId}/jobs/${jobId}`}>
                <Button>キャンセル</Button>
              </Link>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Content>
  );
} 