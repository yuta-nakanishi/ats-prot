import React from 'react';
import { Card, Tabs, Typography } from 'antd';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('login');

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <Title level={3} className="text-center mb-8">採用管理システム</Title>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'login',
              label: 'ログイン',
              children: <LoginForm onSuccess={handleAuthSuccess} />
            },
            {
              key: 'register',
              label: '新規登録',
              children: <RegisterForm onSuccess={handleAuthSuccess} />
            }
          ]}
        />
      </Card>
    </div>
  );
};