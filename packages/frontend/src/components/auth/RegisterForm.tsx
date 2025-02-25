import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import { authApi } from '../../lib/api';

interface Props {
  onSuccess: () => void;
}

export const RegisterForm: React.FC<Props> = ({ onSuccess }) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: { email: string; password: string; name: string }) => {
    try {
      setLoading(true);
      const { token } = await authApi.register(values);
      localStorage.setItem('token', token);
      message.success('登録が完了しました');
      onSuccess();
    } catch (error) {
      message.error('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="register"
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
        name="name"
        rules={[{ required: true, message: '名前を入力してください' }]}
      >
        <Input
          prefix={<IdcardOutlined />}
          placeholder="名前"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'パスワードを入力してください' },
          { min: 6, message: 'パスワードは6文字以上で入力してください' }
        ]}
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
          登録
        </Button>
      </Form.Item>
    </Form>
  );
};