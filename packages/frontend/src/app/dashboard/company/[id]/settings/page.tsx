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
  Spin, 
  Alert,
  Space,
  Select,
  InputNumber,
  Divider,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  BuildOutlined,
  TeamOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

// 業種選択肢
const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'テクノロジー・IT' },
  { value: 'finance', label: '金融・保険' },
  { value: 'healthcare', label: '医療・ヘルスケア' },
  { value: 'education', label: '教育' },
  { value: 'manufacturing', label: '製造業' },
  { value: 'retail', label: '小売・流通' },
  { value: 'construction', label: '建設・不動産' },
  { value: 'food', label: '飲食・フード' },
  { value: 'media', label: 'メディア・エンターテイメント' },
  { value: 'consulting', label: 'コンサルティング' },
  { value: 'transportation', label: '運輸・物流' },
  { value: 'energy', label: 'エネルギー・公共事業' },
  { value: 'agriculture', label: '農業・林業・水産業' },
  { value: 'government', label: '政府・公共機関' },
  { value: 'nonprofit', label: '非営利団体' },
  { value: 'other', label: 'その他' }
];

// 仮の会社データ取得API（実際はバックエンドAPIを使用）
const fetchCompanyData = async (companyId: string) => {
  // 実際のAPIコールをシミュレート
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: companyId,
        name: '株式会社サンプル',
        description: 'サンプル企業の詳細な説明文です。ここに会社の詳細な説明が入ります。',
        industry: 'technology',
        employeeCount: 120,
        website: 'https://example.com',
        email: 'contact@example.com',
        phone: '03-1234-5678',
        address: '東京都渋谷区渋谷1-1-1',
        logo: null,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2024-03-20T14:30:00Z',
      });
    }, 800);
  });
};

// 仮の会社データ更新API（実際はバックエンドAPIを使用）
const updateCompanyData = async (companyId: string, data: any) => {
  // 実際のAPIコールをシミュレート
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '会社情報が更新されました',
        data: { ...data, id: companyId, updatedAt: new Date().toISOString() }
      });
    }, 1000);
  });
};

// 従業員数のフォーマッターとパーサー
const employeeCountFormatter = (value: number | undefined) => {
  if (value === undefined) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const employeeCountParser = (value: string | undefined) => {
  if (value === undefined) return 0;
  return parseInt(value.replace(/\$\s?|(,*)/g, ''), 10);
};

export default function CompanySettingsPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [form] = Form.useForm();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const data = await fetchCompanyData(companyId);
        setCompany(data);
        form.setFieldsValue(data);
      } catch (err) {
        console.error('会社データの取得に失敗しました', err);
        setError('会社情報の取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanyData();
  }, [companyId, form]);
  
  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await updateCompanyData(companyId, values);
      messageApi.success('会社情報を更新しました');
      setCompany({ ...company, ...values });
    } catch (err) {
      console.error('会社情報の更新に失敗しました', err);
      messageApi.error('会社情報の更新に失敗しました。再度お試しください。');
    } finally {
      setSaving(false);
    }
  };
  
  if (!companyId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert type="error" message="会社IDが見つかりません" />
      </Content>
    );
  }
  
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
          <Title level={2} style={{ margin: 0 }}>会社設定</Title>
        </Space>
      </div>

      <Card loading={loading}>
        {error ? (
          <Alert type="error" message={error} />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={company}
          >
            <Title level={4}>基本情報</Title>
            <Paragraph type="secondary">
              会社の基本情報を設定します。この情報は求人ページなどで表示されます。
            </Paragraph>
            
            <Form.Item
              name="name"
              label="会社名"
              rules={[{ required: true, message: '会社名を入力してください' }]}
            >
              <Input placeholder="例: 株式会社サンプル" maxLength={100} />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="会社概要"
              rules={[{ required: true, message: '会社概要を入力してください' }]}
            >
              <TextArea
                placeholder="会社の概要や特徴、ビジョンなどを記入してください"
                autoSize={{ minRows: 4, maxRows: 8 }}
                maxLength={2000}
                showCount
              />
            </Form.Item>
            
            <Form.Item
              name="industry"
              label="業種"
              rules={[{ required: true, message: '業種を選択してください' }]}
            >
              <Select placeholder="業種を選択">
                {INDUSTRY_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="employeeCount"
              label="従業員数"
              rules={[{ required: true, message: '従業員数を入力してください' }]}
            >
              <InputNumber
                min={1}
                max={1000000}
                formatter={employeeCountFormatter}
                parser={employeeCountParser}
                style={{ width: '100%' }}
                placeholder="例: 100"
              />
            </Form.Item>
            
            <Divider />
            
            <Title level={4}>連絡先情報</Title>
            <Paragraph type="secondary">
              応募者が問い合わせる際に使用される連絡先情報です。
            </Paragraph>
            
            <Form.Item
              name="website"
              label="ウェブサイト"
              rules={[
                { required: true, message: 'ウェブサイトURLを入力してください' },
                { type: 'url', message: '有効なURLを入力してください' }
              ]}
            >
              <Input 
                prefix={<GlobalOutlined />} 
                placeholder="例: https://example.com" 
              />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="メールアドレス"
              rules={[
                { required: true, message: 'メールアドレスを入力してください' },
                { type: 'email', message: '有効なメールアドレスを入力してください' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="例: contact@example.com" 
              />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="電話番号"
              rules={[
                { required: true, message: '電話番号を入力してください' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="例: 03-1234-5678" 
              />
            </Form.Item>
            
            <Form.Item
              name="address"
              label="住所"
              rules={[
                { required: true, message: '住所を入力してください' }
              ]}
            >
              <Input 
                placeholder="例: 東京都渋谷区渋谷1-1-1" 
              />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                style={{ marginRight: 16 }}
              >
                保存する
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </Content>
  );
} 