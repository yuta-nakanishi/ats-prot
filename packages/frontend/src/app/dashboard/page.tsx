'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User, UserRole } from '../../types';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserAndRedirect() {
      try {
        // ローカルストレージのトークンを確認
        const token = localStorage.getItem('token');
        setDebugInfo(`トークン存在: ${!!token}`);
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        try {
          // ログインユーザー情報の取得を試みる
          // API呼び出しのデバッグ情報を残す
          setDebugInfo(prev => `${prev}\n/auth/meを呼び出し中...`);
          
          // クラスバックAPIを直接使用
          const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          });
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
            headers,
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`APIエラー: ${response.status} ${errorText}`);
          }
          
          const user = await response.json();
          setDebugInfo(prev => `${prev}\nユーザー取得成功: ${JSON.stringify(user)}`);
          
          // ユーザーの種類に応じたリダイレクト処理
          if (user.isSuperAdmin) {
            // プラットフォーム管理者は管理画面へ
            router.push('/admin');
          } else if (user.isCompanyAdmin) {
            // テナント管理者はテナント管理ダッシュボードへ
            router.push(`/dashboard/company/${user.companyId}`);
          } else if (user.companyId) {
            // 一般ユーザーは会社のダッシュボードへ
            router.push(`/dashboard/company/${user.companyId}`);
          } else {
            // それ以外はエラー
            setError('アクセス権限がありません');
            setLoading(false);
          }
        } catch (err: any) {
          console.error('認証エラー:', err);
          setError(`ユーザー情報の取得に失敗しました: ${err.message}`);
          setDebugInfo(prev => `${prev}\nエラー詳細: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('認証処理中のエラー:', err);
        setError(`認証処理中にエラーが発生しました: ${err.message}`);
        setDebugInfo(prev => `${prev}\n認証プロセスエラー: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
        setLoading(false);
      }
    }

    checkUserAndRedirect();
  }, [router]);

  // ログアウト機能
  const handleLogout = () => {
    localStorage.removeItem('token');
    // クッキーも削除する処理があればここに追加
    document.cookie = 'token=; Max-Age=-99999999;';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          {error}
        </div>
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-md text-gray-800 mb-4 whitespace-pre-wrap">
            <h3 className="font-bold mb-2">デバッグ情報:</h3>
            {debugInfo}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          ログアウトして再ログイン
        </button>
      </div>
    );
  }

  return null; // リダイレクト中は何も表示しない
} 