'use client';

import { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Divider, 
  message 
} from 'antd';
import { BuildOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';

interface TenantFormProps {
  onClose: () => void;
  onSubmit: (tenantData: TenantFormData) => void;
  initialData?: TenantFormData;
  isEditing?: boolean;
  isLoading?: boolean;
}

interface TenantFormData {
  name: string;
  subdomain: string;
  industry?: string;
  contactEmail: string;
  contactPerson?: string;
}

export default function TenantForm({ 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing = false, 
  isLoading = false 
}: TenantFormProps) {
  const [form] = Form.useForm<TenantFormData>();
  const [loading, setLoading] = useState(false);

  // フォームの初期値を設定
  const initialValues = initialData || {
    name: '',
    subdomain: '',
    industry: '',
    contactEmail: '',
    contactPerson: '',
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // フォームのバリデーション
      const values = await form.validateFields();
      
      // 送信処理
      onSubmit(values);
    } catch (error) {
      // バリデーションエラーやその他のエラー処理
      console.error('Form submission error:', error);
      
      // Form.validateFieldsのエラーとその他のエラーを区別
      if (error && typeof error === 'object' && 'errorFields' in error) {
        // バリデーションエラーの場合は何もしない（フォーム自体がエラーを表示する）
      } else if (error instanceof Error) {
        message.error(`送信エラー: ${error.message}`);
      } else {
        message.error('エラーが発生しました。入力内容を確認してください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BuildOutlined />
          <span>{isEditing ? 'テナント編集' : 'テナント作成'}</span>
        </Space>
      }
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
      maskClosable={!loading && !isLoading}
      closable={!loading && !isLoading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        disabled={loading || isLoading}
      >
        <Divider orientation="left">基本情報</Divider>
        
        <Form.Item
          name="name"
          label="テナント名"
          rules={[{ required: true, message: 'テナント名を入力してください' }]}
        >
          <Input 
            placeholder="例：株式会社サンプル" 
            prefix={<BuildOutlined />} 
          />
        </Form.Item>
        
        <Form.Item
          name="subdomain"
          label="サブドメイン"
          rules={[
            { required: true, message: 'サブドメインを入力してください' },
            { pattern: /^[a-z0-9-]+$/, message: '小文字のアルファベット、数字、ハイフンのみ使用できます' }
          ]}
          tooltip="テナントのURLに使用されます（例：[subdomain].yourdomain.com）"
        >
          <Input 
            placeholder="例：sample-company" 
            addonAfter=".yourdomain.com"
          />
        </Form.Item>
        
        <Form.Item
          name="industry"
          label="業種"
        >
          <Input placeholder="例：IT、製造業、人材" />
        </Form.Item>
        
        <Divider orientation="left">連絡先情報</Divider>
        
        <Form.Item
          name="contactEmail"
          label="連絡先メールアドレス"
          rules={[
            { required: true, message: '連絡先メールアドレスを入力してください' },
            { type: 'email', message: '有効なメールアドレスを入力してください' }
          ]}
          tooltip="このメールアドレスがテナント管理者のアカウントになります"
        >
          <Input 
            placeholder="例：contact@example.com" 
            prefix={<MailOutlined />} 
          />
        </Form.Item>
        
        <Form.Item
          name="contactPerson"
          label="担当者名"
        >
          <Input 
            placeholder="例：山田 太郎" 
            prefix={<UserOutlined />} 
          />
        </Form.Item>
        
        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose} disabled={loading || isLoading}>
              キャンセル
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading || isLoading}
              disabled={loading || isLoading}
            >
              {isEditing ? '更新' : '作成'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
} 