'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Button, Form, Input, message, Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      console.error('Login failed:', error);
      message.error('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
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
          <Form.Item name="email" label="メールアドレス" rules={[
            { required: true, message: 'メールアドレスを入力してください' },
            { type: 'email', message: '有効なメールアドレスを入力してください' }
          ]}>
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
            onClick={goToRegister} 
            style={{ marginTop: 8, display: 'inline-block' }}
          >
            新規登録
          </Button>
        </div>
      </Card>
    </div>
  );
} 