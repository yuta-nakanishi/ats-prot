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
  Upload,
  Rate,
  Divider,
  Space,
  message,
  Alert,
  Radio
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  GithubOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Group: RadioGroup } = Radio;

// 仮の求人データ取得API
const getJobPostings = async (companyId: string) => {
  return new Promise<any[]>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve([
        { id: '1', title: 'フロントエンドエンジニア', department: '開発部', status: 'published' },
        { id: '2', title: 'バックエンドエンジニア', department: '開発部', status: 'published' },
        { id: '3', title: 'UIデザイナー', department: 'デザイン部', status: 'published' },
        { id: '4', title: 'プロジェクトマネージャー', department: '事業部', status: 'published' },
        { id: '5', title: 'カスタマーサポート', department: 'サポート部', status: 'published' }
      ]);
    }, 500);
  });
};

// 仮の応募者作成API
const createCandidate = async (companyId: string, candidateData: any) => {
  return new Promise((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        id: 'new-candidate-' + Date.now(),
        ...candidateData,
        companyId,
        status: 'new',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 1000);
  });
};

// 応募者の状態
const CANDIDATE_STATUS = [
  { value: 'new', label: '新規' },
  { value: 'screening', label: '書類選考中' },
  { value: 'interview', label: '面接中' },
  { value: 'technical', label: '技術評価中' },
  { value: 'offer', label: 'オファー中' },
  { value: 'hired', label: '採用決定' },
  { value: 'rejected', label: '不採用' },
  { value: 'withdrawn', label: '辞退' }
];

// 応募ソース
const APPLICATION_SOURCES = [
  { value: 'company_website', label: '自社サイト' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: '紹介' },
  { value: 'agency', label: '人材紹介会社' },
  { value: 'job_fair', label: '就職フェア' },
  { value: 'other', label: 'その他' }
];

export default function NewCandidatePage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  
  useEffect(() => {
    const fetchJobs = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        // APIを呼び出して公開中の求人を取得
        const jobsData = await getJobPostings(companyId);
        setJobs(jobsData);
      } catch (err) {
        console.error('求人データの取得に失敗しました', err);
        messageApi.error('求人情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [companyId, messageApi]);
  
  if (!companyId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert type="error" message="会社IDが見つかりません" />
      </Content>
    );
  }
  
  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      // 日付データの処理
      const formattedValues = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : undefined,
        resumeFile: values.resumeFile ? values.resumeFile.fileList[0].originFileObj : null,
        // APIに送る際は、ファイルオブジェクトはアップロード処理が必要
      };
      
      // APIを呼び出して応募者を登録
      await createCandidate(companyId, formattedValues);
      
      messageApi.success('応募者を登録しました');
      
      // 応募者一覧画面に戻る（遅延を入れてメッセージを表示する時間を確保）
      setTimeout(() => {
        router.push(`/dashboard/company/${companyId}/candidates`);
      }, 1500);
    } catch (err) {
      console.error('応募者の登録に失敗しました', err);
      messageApi.error('応募者の登録に失敗しました。再度お試しください。');
    } finally {
      setSaving(false);
    }
  };
  
  // アップロード前のファイルチェック
  const beforeUpload = (file: File) => {
    const isPDF = file.type === 'application/pdf';
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isDoc = file.type === 'application/msword';
    
    if (!isPDF && !isDocx && !isDoc) {
      messageApi.error('PDFまたはWord文書のみアップロード可能です');
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      messageApi.error('ファイルサイズは10MB以下にしてください');
    }
    
    return (isPDF || isDocx || isDoc) && isLt10M;
  };
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <Link href={`/dashboard/company/${companyId}/candidates`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              応募者一覧に戻る
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>新規応募者登録</Title>
        </Space>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'new',
            source: 'company_website',
            rating: 0
          }}
        >
          <Divider orientation="left">基本情報</Divider>
          
          <Form.Item
            name="name"
            label="氏名"
            rules={[{ required: true, message: '氏名を入力してください' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="例：山田 太郎" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="メールアドレス"
            rules={[
              { required: true, message: 'メールアドレスを入力してください' },
              { type: 'email', message: '有効なメールアドレスを入力してください' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="例：taro.yamada@example.com" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="電話番号"
          >
            <Input prefix={<PhoneOutlined />} placeholder="例：090-1234-5678" />
          </Form.Item>
          
          <Form.Item
            name="birthDate"
            label="生年月日"
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY年MM月DD日"
              placeholder="生年月日を選択"
            />
          </Form.Item>
          
          <Divider orientation="left">応募情報</Divider>
          
          <Form.Item
            name="jobId"
            label="応募職種"
            rules={[{ required: true, message: '応募職種を選択してください' }]}
          >
            <Select placeholder="応募職種を選択">
              {jobs.map(job => (
                <Option key={job.id} value={job.id}>{job.title} - {job.department}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="現在のステータス"
            rules={[{ required: true, message: 'ステータスを選択してください' }]}
          >
            <Select placeholder="ステータスを選択">
              {CANDIDATE_STATUS.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="source"
            label="応募経路"
            rules={[{ required: true, message: '応募経路を選択してください' }]}
          >
            <Select placeholder="応募経路を選択">
              {APPLICATION_SOURCES.map(source => (
                <Option key={source.value} value={source.value}>{source.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="rating"
            label="初期評価"
          >
            <Rate allowHalf />
          </Form.Item>
          
          <Divider orientation="left">履歴書・職務経歴書</Divider>
          
          <Form.Item
            name="resumeFile"
            label="履歴書・職務経歴書"
            valuePropName="file"
            getValueFromEvent={e => e}
          >
            <Upload
              name="resumeFile"
              listType="text"
              beforeUpload={beforeUpload}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>ファイルを選択</Button>
              <Text type="secondary" style={{ marginLeft: 8 }}>PDF, Wordファイル (10MB以下)</Text>
            </Upload>
          </Form.Item>
          
          <Divider orientation="left">追加情報</Divider>
          
          <Form.Item
            name="skills"
            label="スキル・経験"
          >
            <TextArea
              placeholder="スキル、技術、資格などを記入してください"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={2000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="education"
            label="学歴"
          >
            <TextArea
              placeholder="最終学歴、専攻などを記入してください"
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={1000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="currentCompany"
            label="現在の勤務先"
          >
            <Input placeholder="例：株式会社○○" />
          </Form.Item>
          
          <Form.Item
            name="expectedSalary"
            label="希望年収（万円）"
          >
            <Input placeholder="例：500" />
          </Form.Item>
          
          <Form.Item
            name="availableFrom"
            label="入社可能時期"
          >
            <Input placeholder="例：即日、1ヶ月後、2024年4月" />
          </Form.Item>
          
          <Form.Item
            name="urls"
            label="ポートフォリオ・SNSリンク"
          >
            <Input.Group>
              <Form.Item
                name={['urls', 'website']}
                noStyle
              >
                <Input 
                  addonBefore={<GlobalOutlined />}
                  placeholder="Webサイト URL" 
                  style={{ marginBottom: 8 }}
                />
              </Form.Item>
              <br />
              <Form.Item
                name={['urls', 'linkedin']}
                noStyle
              >
                <Input 
                  addonBefore={<LinkedinOutlined />}
                  placeholder="LinkedIn URL" 
                  style={{ marginBottom: 8 }}
                />
              </Form.Item>
              <br />
              <Form.Item
                name={['urls', 'github']}
                noStyle
              >
                <Input 
                  addonBefore={<GithubOutlined />}
                  placeholder="GitHub URL" 
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="備考"
          >
            <TextArea
              placeholder="面接への期待、特記事項など"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={2000}
              showCount
            />
          </Form.Item>
          
          <Divider />
          
          <Form.Item
            name="notifyCandidate"
            label="応募受付メールを送信"
            initialValue={false}
          >
            <RadioGroup>
              <Radio value={true}>はい</Radio>
              <Radio value={false}>いいえ</Radio>
            </RadioGroup>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                応募者を登録
              </Button>
              
              <Link href={`/dashboard/company/${companyId}/candidates`}>
                <Button>キャンセル</Button>
              </Link>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Content>
  );
} 