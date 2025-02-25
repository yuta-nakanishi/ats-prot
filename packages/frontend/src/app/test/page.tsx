'use client';

import { useState, useEffect } from 'react';
import { Button } from 'antd';

export default function TestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigateToRegister = () => {
    window.location.href = '/register';
  };

  const handleNavigateDirectly = () => {
    window.location.href = '/register';
  };

  if (!mounted) {
    return <div style={{ padding: '2rem' }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1>テストページ</h1>
      <Button onClick={handleNavigateToRegister}>
        router.pushで登録ページへ移動
      </Button>
      <Button onClick={handleNavigateDirectly}>
        window.location.hrefで登録ページへ移動
      </Button>
      <a href="/register" style={{ margin: '1rem 0' }}>
        通常のリンクで登録ページへ移動
      </a>
    </div>
  );
} 