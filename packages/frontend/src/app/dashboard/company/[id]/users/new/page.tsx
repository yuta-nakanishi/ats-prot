'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Select, 
  Space, 
  message, 
  Layout, 
  Divider,
  Switch,
  Tooltip
} from 'antd';
import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { UserRole } from '../../../../../../types';
import { createCompanyUser } from '../../../../../../lib/api/users';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

// ユーザーロールの日本語表示名
const roleLabels: Record<UserRole, string> = {
  [UserRole.COMPANY_ADMIN]: '企業管理者',
  [UserRole.HIRING_MANAGER]: '採用担当責任者',
  [UserRole.RECRUITER]: '採用担当者',
  [UserRole.INTERVIEWER]: '面接官',
  [UserRole.READONLY]: '閲覧のみ',
};

// ユーザーロールの説明
const roleDescriptions: Record<UserRole, string> = {
  [UserRole.COMPANY_ADMIN]: '企業アカウントの管理者。すべての機能にアクセスできます。',
  [UserRole.HIRING_MANAGER]: '採用活動全体を管理する責任者。求人や採用プロセスを管理できます。',
  [UserRole.RECRUITER]: '日常的な採用業務を担当。候補者の管理や面接のスケジュール調整ができます。',
  [UserRole.INTERVIEWER]: '面接を実施し、評価を提供します。候補者情報の閲覧と評価のみが可能です。',
  [UserRole.READONLY]: '情報の閲覧のみ可能。データの追加や編集はできません。',
};

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  jobTitle?: string;
  departmentId?: string;
  phoneNumber?: string;
  isCompanyAdmin: boolean;
}

export default function NewUserPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  const [form] = Form.useForm<UserFormData>();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  if (!companyId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Card>
          <div>会社IDが見つかりません。ダッシュボードに戻ってください。</div>
          <Button type="primary" onClick={() => router.push('/dashboard')}>
            ダッシュボードへ
          </Button>
        </Card>
      </Content>
    );
  }
  
  const handleSubmit = async (values: UserFormData) => {
    setLoading(true);
    try {
      // APIを呼び出してユーザーを作成
      await createCompanyUser(companyId, {
        ...values,
        companyId
      });
      
      messageApi.success('ユーザーが正常に作成されました');
      
      // ユーザー一覧画面に戻る
      setTimeout(() => {
        router.push(`/dashboard/company/${companyId}/users`);
      }, 1500);
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      messageApi.error('ユーザーの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link href={`/dashboard/company/${companyId}/users`}>
          <Button icon={<ArrowLeftOutlined />} type="text">
            ユーザー一覧に戻る
          </Button>
        </Link>
        <Title level={2} style={{ margin: 0, marginLeft: '12px' }}>新規ユーザー作成</Title>
      </div>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role: UserRole.RECRUITER,
            isCompanyAdmin: false
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <Divider orientation="left">基本情報</Divider>
            
            <Form.Item
              name="name"
              label="氏名"
              rules={[{ required: true, message: '氏名を入力してください' }]}
            >
              <Input placeholder="例：山田 太郎" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="メールアドレス"
              rules={[
                { required: true, message: 'メールアドレスを入力してください' },
                { type: 'email', message: '有効なメールアドレスを入力してください' }
              ]}
            >
              <Input placeholder="例：yamada@example.com" />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="初期パスワード（省略可）"
              extra="空欄の場合は自動生成されます。ユーザーはログイン後に変更することができます。"
              rules={[
                { min: 8, message: 'パスワードは8文字以上である必要があります' }
              ]}
            >
              <Input.Password placeholder="パスワードを入力" />
            </Form.Item>
            
            <Divider orientation="left">役割と権限</Divider>
            
            <Form.Item
              name="role"
              label="ユーザー権限"
              rules={[{ required: true, message: '権限を選択してください' }]}
            >
              <Select 
                placeholder="権限を選択"
                optionLabelProp="label"
                listHeight={300}
              >
                {Object.entries(roleLabels).map(([role, label]) => (
                  <Option key={role} value={role} label={label}>
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', lineHeight: '1.4' }}>
                        {roleDescriptions[role as UserRole]}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="isCompanyAdmin"
              label={
                <span>
                  管理者権限
                  <Tooltip title="オンにすると、この企業アカウントの管理者としてユーザー管理や企業設定を変更できます。">
                    <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Divider orientation="left">追加情報（任意）</Divider>
            
            <Form.Item name="jobTitle" label="役職">
              <Input placeholder="例：人事部長" />
            </Form.Item>
            
            <Form.Item name="departmentId" label="所属部署">
              <Input placeholder="例：人事部" />
            </Form.Item>
            
            <Form.Item name="phoneNumber" label="電話番号">
              <Input placeholder="例：080-1234-5678" />
            </Form.Item>
            
            <Divider />
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  ユーザーを作成
                </Button>
                <Link href={`/dashboard/company/${companyId}/users`}>
                  <Button>キャンセル</Button>
                </Link>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </Content>
  );
} 