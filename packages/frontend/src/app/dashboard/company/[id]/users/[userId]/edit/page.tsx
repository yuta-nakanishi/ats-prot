'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Select, 
  Space, 
  message, 
  Layout, 
  Divider,
  Switch,
  Tooltip,
  Spin,
  Alert,
  Popconfirm
} from 'antd';
import { ArrowLeftOutlined, QuestionCircleOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { User, UserRole } from '../../../../../../../types';
import { getUserById, updateUser, deactivateUser, activateUser } from '../../../../../../../lib/api/users';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

// ユーザーロールの日本語表示名
const roleLabels: Record<UserRole, string> = {
  [UserRole.COMPANY_ADMIN]: '企業管理者',
  [UserRole.HIRING_MANAGER]: '採用担当責任者',
  [UserRole.RECRUITER]: '採用担当者',
  [UserRole.INTERVIEWER]: '面接官',
  [UserRole.READONLY]: '閲覧のみ',
};

// ユーザーロールの説明
const roleDescriptions: Record<UserRole, string> = {
  [UserRole.COMPANY_ADMIN]: '企業アカウントの管理者。すべての機能にアクセスできます。',
  [UserRole.HIRING_MANAGER]: '採用活動全体を管理する責任者。求人や採用プロセスを管理できます。',
  [UserRole.RECRUITER]: '日常的な採用業務を担当。候補者の管理や面接のスケジュール調整ができます。',
  [UserRole.INTERVIEWER]: '面接を実施し、評価を提供します。候補者情報の閲覧と評価のみが可能です。',
  [UserRole.READONLY]: '情報の閲覧のみ可能。データの追加や編集はできません。',
};

interface UserFormData {
  name: string;
  role: UserRole;
  jobTitle?: string;
  departmentId?: string;
  phoneNumber?: string;
  isCompanyAdmin: boolean;
  isActive: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  const userId = typeof params.userId === 'string' ? params.userId : '';
  
  const [form] = Form.useForm<UserFormData>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        
        // フォームに初期値をセット
        form.setFieldsValue({
          name: userData.name,
          role: userData.role,
          jobTitle: userData.jobTitle,
          departmentId: userData.departmentId,
          phoneNumber: userData.phoneNumber,
          isCompanyAdmin: userData.isCompanyAdmin,
          isActive: userData.isActive
        });
      } catch (err) {
        console.error('ユーザー情報の取得に失敗しました', err);
        setError('ユーザー情報の取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, form]);

  if (!companyId || !userId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert
          message="エラー"
          description="会社IDまたはユーザーIDが見つかりません"
          type="error"
          showIcon
        />
      </Content>
    );
  }
  
  const handleSubmit = async (values: UserFormData) => {
    setSaving(true);
    try {
      // APIを呼び出してユーザーを更新
      await updateUser(userId, values);
      
      messageApi.success('ユーザー情報が正常に更新されました');
      
      // データを再取得
      const updatedUser = await getUserById(userId);
      setUser(updatedUser);
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      messageApi.error('ユーザー情報の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleStatus = async () => {
    try {
      if (user?.isActive) {
        // ユーザーを無効化
        await deactivateUser(userId);
        messageApi.success('ユーザーを無効化しました');
      } else {
        // ユーザーを有効化
        await activateUser(userId);
        messageApi.success('ユーザーを有効化しました');
      }
      
      // データを再取得
      const updatedUser = await getUserById(userId);
      setUser(updatedUser);
      
      // フォームの値を更新
      form.setFieldValue('isActive', updatedUser.isActive);
    } catch (error) {
      console.error('ステータス変更エラー:', error);
      messageApi.error('ユーザーのステータス変更に失敗しました');
    }
  };
  
  const renderForm = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>ユーザー情報を読み込み中...</div>
        </div>
      );
    }
    
    if (error || !user) {
      return <Alert type="error" message={error || 'ユーザー情報の取得に失敗しました'} />;
    }
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div style={{ maxWidth: '800px' }}>
          <Divider orientation="left">基本情報</Divider>
          
          <Form.Item
            name="name"
            label="氏名"
            rules={[{ required: true, message: '氏名を入力してください' }]}
          >
            <Input placeholder="例：山田 太郎" />
          </Form.Item>
          
          <Form.Item label="メールアドレス">
            <Input value={user.email} disabled />
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#999' }}>
              メールアドレスは変更できません
            </div>
          </Form.Item>
          
          <Divider orientation="left">役割と権限</Divider>
          
          <Form.Item
            name="role"
            label="ユーザー権限"
            rules={[{ required: true, message: '権限を選択してください' }]}
          >
            <Select 
              placeholder="権限を選択"
              optionLabelProp="label"
              listHeight={300}
            >
              {Object.entries(roleLabels).map(([role, label]) => (
                <Option key={role} value={role} label={label}>
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', lineHeight: '1.4' }}>
                      {roleDescriptions[role as UserRole]}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isCompanyAdmin"
            label={
              <span>
                管理者権限
                <Tooltip title="オンにすると、この企業アカウントの管理者としてユーザー管理や企業設定を変更できます。">
                  <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="アカウント状態"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="有効" 
              unCheckedChildren="無効"
              disabled
            />
          </Form.Item>
          
          <Divider orientation="left">追加情報</Divider>
          
          <Form.Item name="jobTitle" label="役職">
            <Input placeholder="例：人事部長" />
          </Form.Item>
          
          <Form.Item name="departmentId" label="所属部署">
            <Input placeholder="例：人事部" />
          </Form.Item>
          
          <Form.Item name="phoneNumber" label="電話番号">
            <Input placeholder="例：080-1234-5678" />
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit" 
                  loading={saving}
                >
                  保存
                </Button>
                
                <Link href={`/dashboard/company/${companyId}/users`}>
                  <Button>キャンセル</Button>
                </Link>
              </Space>
              
              <Divider />
              
              <div>
                <Popconfirm
                  title={user.isActive ? "ユーザーを無効化しますか？" : "ユーザーを有効化しますか？"}
                  description={
                    user.isActive 
                      ? "無効化されたユーザーはログインできなくなります。この操作は元に戻せます。"
                      : "有効化するとユーザーは再びログインできるようになります。"
                  }
                  onConfirm={handleToggleStatus}
                  okText="はい"
                  cancelText="いいえ"
                >
                  <Button 
                    danger={user.isActive} 
                    type={user.isActive ? "primary" : "default"}
                    icon={<DeleteOutlined />}
                  >
                    {user.isActive ? "ユーザーを無効化" : "ユーザーを有効化"}
                  </Button>
                </Popconfirm>
              </div>
            </Space>
          </Form.Item>
        </div>
      </Form>
    );
  };
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link href={`/dashboard/company/${companyId}/users`}>
          <Button icon={<ArrowLeftOutlined />} type="text">
            ユーザー一覧に戻る
          </Button>
        </Link>
        <Title level={2} style={{ margin: 0, marginLeft: '12px' }}>
          {user ? `${user.name}を編集` : 'ユーザー編集'}
        </Title>
      </div>
      
      <Card>
        {renderForm()}
      </Card>
    </Content>
  );
} 