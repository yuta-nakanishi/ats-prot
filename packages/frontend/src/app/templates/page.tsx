'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import App from '@/App';
import { Spin } from 'antd';

export default function TemplatesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="読み込み中..." spinning={true}>
          <div style={{ height: '200px', width: '100%' }} />
        </Spin>
      </div>
    );
  }

  return <App initialTab="templates" />;
} 