import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Button, Spin } from 'antd';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

export const RegisterPage: React.FC = () => {
  useAuth();
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみマウントするためのフラグ
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSuccess = () => {
    // RegisterFormコンポーネントでの成功処理は完了しているため、追加の処理は不要
  };

  const goToLoginPage = () => {
    // 直接的なURLナビゲーションを使用
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
        
        <RegisterForm onSuccess={handleSuccess} />
        
        <Divider plain>または</Divider>
        
        <div style={{ textAlign: 'center' }}>
          <Text>すでにアカウントをお持ちの方は</Text>
          <br />
          <Button 
            type="link" 
            onClick={goToLoginPage} 
            style={{ marginTop: 8, display: 'inline-block' }}
          >
            ログイン
          </Button>
        </div>
      </Card>
    </div>
  );
}; 