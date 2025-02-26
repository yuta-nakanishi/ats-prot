import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ApiProvider } from '@/contexts/ApiContext';
import 'antd/dist/reset.css';

export const metadata = {
  title: '採用管理システム',
  description: '採用候補者や求人を管理するためのシステム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ApiProvider>
          <AuthProvider>{children}</AuthProvider>
        </ApiProvider>
      </body>
    </html>
  );
} 