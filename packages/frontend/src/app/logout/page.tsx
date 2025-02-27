'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Typography, Card } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { clearAuthState } from '@/lib/utils/auth';

const { Title, Text } = Typography;

/**
 * 強制ログアウトページ
 * このページは認証状態に関わらずアクセスでき、すべての認証情報を削除します
 */
export default function ForceLogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>('ログアウト処理中...');

  useEffect(() => {
    const performLogout = async () => {
      try {
        // ユーティリティ関数を使用して認証情報をクリア
        clearAuthState();
        
        // サーバーAPIへのログアウトリクエスト（エラーは無視）
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
          console.log('サーバーログアウト結果:', response.ok);
        } catch (error) {
          console.log('サーバーログアウトに失敗しましたが処理を続行します');
        }

        setMessage('ログアウトが完了しました。ログイン画面に移動します...');

        // ログイン画面へリダイレクト（少し遅延させる）
        setTimeout(() => {
          // クエリパラメータにforce=trueを追加して、ミドルウェアに強制ログアウトを通知
          router.push('/login?force=true');
        }, 1500);
      } catch (error) {
        console.error('ログアウト中にエラーが発生しました:', error);
        setMessage('ログアウト処理中にエラーが発生しましたが、ログイン画面に移動します...');
        
        // エラー時も最終的にはログイン画面へ
        setTimeout(() => {
          router.push('/login?force=true&error=true');
        }, 1500);
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex h-screen justify-center items-center bg-gray-50">
      <Card className="w-96 shadow-md text-center p-8">
        <LogoutOutlined className="text-5xl text-blue-500 mb-4" />
        <Title level={3}>セッションをリセット中</Title>
        <div className="my-8">
          <Spin size="large" />
          <Text className="block mt-4">{message}</Text>
        </div>
        <Text type="secondary" className="mt-4 block">
          問題が解決しない場合は、ブラウザのキャッシュとCookieを削除してからやり直してください。
        </Text>
      </Card>
    </div>
  );
} 