import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';

interface Props {
  onSuccess: () => void;
}

export const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const { token } = await authApi.login(values);
      localStorage.setItem('token', token);
      message.success('ログインしました');
      onSuccess();
    } catch (error) {
      message.error('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="login"
      onFinish={handleSubmit}
      layout="vertical"
      className="max-w-sm mx-auto"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'メールアドレスを入力してください' },
          { type: 'email', message: '有効なメールアドレスを入力してください' }
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="メールアドレス"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'パスワードを入力してください' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="パスワード"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading}
        >
          ログイン
        </Button>
      </Form.Item>
    </Form>
  );
};