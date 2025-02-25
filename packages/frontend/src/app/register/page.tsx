'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Button, Form, Input, message, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

export default function Register() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (values: { email: string; password: string; name: string }) => {
    try {
      setLoading(true);
      setRegisterError(null); // エラーをリセット
      await register(values.email, values.password, values.name);
      message.success('登録が完了しました');
      // 成功時にはAuthContextがダッシュボードにリダイレクトします
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || '登録に失敗しました。再度お試しください。';
      message.error(errorMessage);
      setRegisterError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  // クライアントサイドでのみレンダリング
  if (!mounted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>採用管理システム</Title>
            <Spin size="large" style={{ marginTop: 20 }} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>採用管理システム</Title>
          <Title level={4} style={{ fontWeight: 'normal', margin: 0 }}>新規アカウント登録</Title>
        </div>
        
        {registerError && (
          <Alert
            message="登録エラー"
            description={registerError}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setRegisterError(null)}
          />
        )}
        
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          className="max-w-sm mx-auto"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'メールアドレスを入力してください' },
              { type: 'email', message: '有効なメールアドレスを入力してください' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="メールアドレス"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="name"
            rules={[{ required: true, message: '名前を入力してください' }]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder="名前"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'パスワードを入力してください' },
              { min: 6, message: 'パスワードは6文字以上で入力してください' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="パスワード"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              登録
            </Button>
          </Form.Item>
        </Form>
        
        <Divider plain>または</Divider>
        
        <div style={{ textAlign: 'center' }}>
          <Text>すでにアカウントをお持ちの方は</Text>
          <br />
          <Button 
            type="link" 
            onClick={goToLogin} 
            style={{ marginTop: 8, display: 'inline-block' }}
          >
            ログイン
          </Button>
        </div>
      </Card>
    </div>
  );
} 