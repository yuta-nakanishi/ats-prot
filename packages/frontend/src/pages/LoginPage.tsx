import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Divider, Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const [form] = Form.useForm();

  // クライアントサイドでのみマウントするためのフラグ
  useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch (error) {
      console.error('Login failed:', error);
      message.error('ログインに失敗しました。ユーザー名とパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const goToRegisterPage = () => {
    // 直接的なURLナビゲーションを使用
    window.location.href = '/register';
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
        </div>
        <Form form={form} name="login" onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="ユーザー名" rules={[{ required: true, message: 'ユーザー名を入力してください' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="password" label="パスワード" rules={[{ required: true, message: 'パスワードを入力してください' }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              ログイン
            </Button>
          </Form.Item>
        </Form>
        
        <Divider plain>または</Divider>
        
        <div style={{ textAlign: 'center' }}>
          <Text>アカウントをお持ちでない方は</Text>
          <br />
          <Button 
            type="link" 
            onClick={goToRegisterPage} 
            style={{ marginTop: 8, display: 'inline-block' }}
          >
            新規登録
          </Button>
        </div>
      </Card>
    </div>
  );
};