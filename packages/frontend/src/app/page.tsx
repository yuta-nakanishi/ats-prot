'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isClient, isAuthenticated, loading, router]);

  // ローディング中またはサーバーサイドレンダリング中は何も表示しない
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p>読み込み中...</p>
      </div>
    </div>
  );
}