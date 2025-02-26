import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from '../contexts/AuthContext';
import { ApiProvider } from '../contexts/ApiContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ATS - 採用管理システム',
  description: '効率的な採用管理のためのオールインワンシステム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AntdRegistry>
          <ApiProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ApiProvider>
        </AntdRegistry>
      </body>
    </html>
  );
} 