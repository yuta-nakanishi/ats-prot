'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Typography, 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  InputNumber,
  Switch,
  Divider,
  Space,
  message,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  FormOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 雇用形態の選択肢
const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: '正社員' },
  { value: 'contract', label: '契約社員' },
  { value: 'part_time', label: 'パートタイム' },
  { value: 'temporary', label: '派遣社員' },
  { value: 'internship', label: 'インターン' },
  { value: 'other', label: 'その他' }
];

// 経験レベルの選択肢
const EXPERIENCE_LEVELS = [
  { value: 'entry', label: '未経験可' },
  { value: 'junior', label: '1〜3年' },
  { value: 'mid', label: '3〜5年' },
  { value: 'senior', label: '5年以上' },
  { value: 'expert', label: '10年以上' }
];

// 求人ステータスの選択肢
const JOB_STATUSES = [
  { value: 'draft', label: '下書き' },
  { value: 'published', label: '公開中' }
];

// 部署の選択肢（実際の実装ではAPIから取得）
const DEPARTMENTS = [
  { value: 'development', label: '開発部' },
  { value: 'design', label: 'デザイン部' },
  { value: 'sales', label: '営業部' },
  { value: 'marketing', label: 'マーケティング部' },
  { value: 'hr', label: '人事部' },
  { value: 'support', label: 'サポート部' },
  { value: 'other', label: 'その他' }
];

// 勤務地の選択肢（実際の実装ではAPIから取得）
const LOCATIONS = [
  { value: 'tokyo', label: '東京' },
  { value: 'osaka', label: '大阪' },
  { value: 'nagoya', label: '名古屋' },
  { value: 'fukuoka', label: '福岡' },
  { value: 'sapporo', label: '札幌' },
  { value: 'remote', label: 'リモート' },
  { value: 'other', label: 'その他' }
];

// 仮の新規求人作成API
const createJob = async (companyId: string, jobData: any) => {
  return new Promise((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        id: 'new-job-' + Date.now(),
        ...jobData,
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 1000);
  });
};

export default function NewJobPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  
  if (!companyId) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert type="error" message="会社IDが見つかりません" />
      </Content>
    );
  }
  
  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      // APIを呼び出して求人を作成
      await createJob(companyId, values);
      
      messageApi.success('求人を作成しました');
      
      // 求人一覧画面に戻る（遅延を入れてメッセージを表示する時間を確保）
      setTimeout(() => {
        router.push(`/dashboard/company/${companyId}/jobs`);
      }, 1500);
    } catch (err) {
      console.error('求人作成に失敗しました', err);
      messageApi.error('求人の作成に失敗しました。再度お試しください。');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <Link href={`/dashboard/company/${companyId}/jobs`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              求人一覧に戻る
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>新規求人作成</Title>
        </Space>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            type: 'full_time',
            isRemote: false
          }}
        >
          <Divider orientation="left">基本情報</Divider>
          
          <Form.Item
            name="title"
            label="求人タイトル"
            rules={[{ required: true, message: '求人タイトルを入力してください' }]}
          >
            <Input placeholder="例: フロントエンドエンジニア" maxLength={100} />
          </Form.Item>
          
          <Form.Item
            name="department"
            label="部署"
            rules={[{ required: true, message: '部署を選択してください' }]}
          >
            <Select placeholder="部署を選択">
              {DEPARTMENTS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="type"
            label="雇用形態"
            rules={[{ required: true, message: '雇用形態を選択してください' }]}
          >
            <Select placeholder="雇用形態を選択">
              {EMPLOYMENT_TYPES.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="experienceLevel"
            label="必要経験"
            rules={[{ required: true, message: '必要経験を選択してください' }]}
          >
            <Select placeholder="必要経験を選択">
              {EXPERIENCE_LEVELS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Divider orientation="left">勤務条件</Divider>
          
          <Form.Item
            name="location"
            label="勤務地"
            rules={[{ required: true, message: '勤務地を選択してください' }]}
          >
            <Select placeholder="勤務地を選択">
              {LOCATIONS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isRemote"
            label="リモートワーク"
            valuePropName="checked"
          >
            <Switch checkedChildren="可" unCheckedChildren="不可" />
          </Form.Item>
          
          <Form.Item
            name="salaryRange"
            label="給与範囲（万円/年）"
          >
            <Space>
              <InputNumber
                min={0}
                max={10000}
                placeholder="最小"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
              <span>〜</span>
              <InputNumber
                min={0}
                max={10000}
                placeholder="最大"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Space>
          </Form.Item>
          
          <Divider orientation="left">募集詳細</Divider>
          
          <Form.Item
            name="description"
            label="職務内容"
            rules={[{ required: true, message: '職務内容を入力してください' }]}
          >
            <TextArea
              placeholder="担当する業務内容や役割について詳しく記入してください"
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={5000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="requirements"
            label="応募要件"
            rules={[{ required: true, message: '応募要件を入力してください' }]}
          >
            <TextArea
              placeholder="必須スキルや経験、資格などを箇条書きで記入してください"
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={3000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="benefits"
            label="福利厚生・特典"
          >
            <TextArea
              placeholder="給与以外の福利厚生や特典について記入してください"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={2000}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="selectionProcess"
            label="選考プロセス"
          >
            <TextArea
              placeholder="選考ステップや面接回数などを記入してください"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={1000}
              showCount
            />
          </Form.Item>
          
          <Divider orientation="left">公開設定</Divider>
          
          <Form.Item
            name="status"
            label="公開ステータス"
            rules={[{ required: true, message: '公開ステータスを選択してください' }]}
          >
            <Select placeholder="ステータスを選択">
              {JOB_STATUSES.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="applicationDeadline"
            label="応募締切日"
          >
            <DatePicker placeholder="締切日を選択" style={{ width: '100%' }} />
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                求人を作成
              </Button>
              
              <Link href={`/dashboard/company/${companyId}/jobs`}>
                <Button>キャンセル</Button>
              </Link>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Content>
  );
} 