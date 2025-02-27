'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Button, Form, Input, message, Spin, Alert } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { clearAuthState } from '@/lib/utils/auth';

const { Title, Text } = Typography;

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { login, isAuthenticated } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromLogout = searchParams?.get('logout') === 'true';
  const fromForceLogout = searchParams?.get('force') === 'true';
  const hasError = searchParams?.get('error') === 'true';

  useEffect(() => {
    setMounted(true);
    
    console.log('[Login] ページマウント, fromLogout:', fromLogout, 'fromForceLogout:', fromForceLogout);
    
    // ログアウトまたは強制ログアウトパラメータがある場合、クリーンアップを実行
    if (fromLogout || fromForceLogout) {
      // ユーティリティ関数を使用して認証情報をクリア
      clearAuthState();
      
      // メッセージを表示
      if (!hasError) {
        if (fromForceLogout) {
          message.success('セッションがリセットされました。再度ログインしてください。');
        } else {
          message.success('ログアウトしました。再度ログインしてください。');
        }
      } else {
        message.warning('ログアウト中にエラーが発生しましたが、セッションはリセットされています。');
      }
      
      // パラメータのないURLに置き換え（履歴に残さない）
      window.history.replaceState({}, '', '/login');
    }
  }, [fromLogout, fromForceLogout, hasError]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setLoginError(null); // エラーをリセット
    try {
      console.log('[Login] ログイン開始:', values.email);
      await login(values.email, values.password);
      console.log('[Login] ログイン成功');
    } catch (error: any) {
      console.error('[Login] ログイン失敗:', error);
      const errorMessage = error.message || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。';
      // message.errorとともに状態変数にもセット
      message.error(errorMessage);
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('/register');
  };

  // 強制ログアウトリンク
  const goToForceLogout = () => {
    router.push('/logout');
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
        
        {loginError && (
          <Alert
            message="ログインエラー"
            description={loginError}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setLoginError(null)}
          />
        )}
        
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
          
          <Divider plain style={{ margin: '12px 0' }}></Divider>
          
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ログインに問題がある場合は
          </Text>
          <br />
          <Button 
            type="link" 
            onClick={goToForceLogout} 
            style={{ marginTop: 4, display: 'inline-block', fontSize: '12px' }}
          >
            セッションをリセット
          </Button>
        </div>
      </Card>
    </div>
  );
} 