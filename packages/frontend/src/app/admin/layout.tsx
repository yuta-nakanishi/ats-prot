'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space, theme } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  DashboardOutlined, 
  TeamOutlined, 
  SettingOutlined, 
  BuildOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  ProfileOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState('管理者');
  
  // テーマの設定
  const { token } = theme.useToken();
  
  // ユーザー情報の取得 (実際のアプリケーションではAPIからデータを取得)
  useEffect(() => {
    // モックデータ
    setUsername('プラットフォーム管理者');
  }, []);
  
  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // ユーザーメニューの項目
  const userMenuItems = [
    {
      key: 'profile',
      label: 'プロフィール',
      icon: <ProfileOutlined />,
      onClick: () => router.push('/admin/profile'),
    },
    {
      key: 'settings',
      label: '設定',
      icon: <SettingOutlined />,
      onClick: () => router.push('/admin/settings'),
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'ログアウト',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10,
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 16px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          transition: 'all 0.2s',
        }}>
          {collapsed ? (
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: token.colorPrimary }}>
              ATS
            </div>
          ) : (
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: token.colorPrimary }}>
              ATS管理パネル
            </div>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ borderRight: 0 }}
          items={[
            {
              key: '/admin',
              icon: <DashboardOutlined />,
              label: <Link href="/admin">ダッシュボード</Link>,
            },
            {
              key: '/admin/tenants',
              icon: <BuildOutlined />,
              label: <Link href="/admin/tenants">テナント管理</Link>,
            },
            {
              key: '/admin/users',
              icon: <TeamOutlined />,
              label: <Link href="/admin/users">ユーザー管理</Link>,
            },
            {
              key: '/admin/settings',
              icon: <SettingOutlined />,
              label: <Link href="/admin/settings">システム設定</Link>,
            },
          ]}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: token.colorBgContainer, 
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ marginLeft: 'auto' }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{username}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '24px', 
          padding: '24px', 
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          minHeight: 280,
          overflow: 'auto',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 