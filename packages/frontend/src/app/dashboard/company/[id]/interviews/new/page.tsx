'use client';

import { useState, useEffect } from 'react';
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
  TimePicker,
  Switch,
  Divider,
  Space,
  message,
  Alert,
  Avatar,
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  UserOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

// 面接タイプの選択肢
const INTERVIEW_TYPES = [
  { value: 'initial', label: '一次面接' },
  { value: 'technical', label: '技術面接' },
  { value: 'team', label: 'チーム面接' },
  { value: 'final', label: '最終面接' },
  { value: 'other', label: 'その他' }
];

// 面接場所の選択肢
const INTERVIEW_LOCATIONS = [
  { value: 'office_tokyo', label: '本社（東京）' },
  { value: 'office_osaka', label: '支社（大阪）' },
  { value: 'meeting_room_a', label: '会議室A' },
  { value: 'meeting_room_b', label: '会議室B' },
  { value: 'zoom', label: 'オンライン（Zoom）' },
  { value: 'google_meet', label: 'オンライン（Google Meet）' },
  { value: 'microsoft_teams', label: 'オンライン（Microsoft Teams）' },
  { value: 'other', label: 'その他' }
];

// 仮の候補者データ取得API
const getCandidates = async (companyId: string) => {
  return new Promise<any[]>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve([
        { id: '1', name: '山田 太郎', email: 'yamada.taro@example.com', position: 'フロントエンドエンジニア', status: 'screening' },
        { id: '2', name: '佐藤 花子', email: 'sato.hanako@example.com', position: 'バックエンドエンジニア', status: 'interview' },
        { id: '3', name: '鈴木 一郎', email: 'suzuki.ichiro@example.com', position: 'UIデザイナー', status: 'technical' },
        { id: '4', name: '田中 直樹', email: 'tanaka.naoki@example.com', position: 'プロジェクトマネージャー', status: 'offer' },
        { id: '5', name: '伊藤 美咲', email: 'ito.misaki@example.com', position: 'カスタマーサポート', status: 'rejected' }
      ]);
    }, 800);
  });
};

// 仮の面接官データ取得API
const getInterviewers = async (companyId: string) => {
  return new Promise<any[]>((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve([
        { id: '101', name: '佐々木 健太', email: 'sasaki@example.com', role: 'HIRING_MANAGER', department: '人事部' },
        { id: '102', name: '中村 美香', email: 'nakamura@example.com', role: 'INTERVIEWER', department: '開発部' },
        { id: '103', name: '田中 直人', email: 'tanaka@example.com', role: 'INTERVIEWER', department: '開発部' },
        { id: '104', name: '山本 真理', email: 'yamamoto@example.com', role: 'INTERVIEWER', department: 'デザイン部' },
        { id: '105', name: '伊藤 浩二', email: 'ito@example.com', role: 'INTERVIEWER', department: '事業部' },
        { id: '106', name: '小林 敏子', email: 'kobayashi@example.com', role: 'INTERVIEWER', department: '人事部' }
      ]);
    }, 800);
  });
};

// 仮の新規面接登録API
const createInterview = async (companyId: string, interviewData: any) => {
  return new Promise((resolve) => {
    // 実際のAPIコールをシミュレート
    setTimeout(() => {
      resolve({
        id: 'new-interview-' + Date.now(),
        ...interviewData,
        companyId,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 1000);
  });
};

// 配列表示用の状態を取得
const CANDIDATE_STATUS_CONFIG: Record<string, { color: string, text: string }> = {
  'new': { color: 'blue', text: '新規' },
  'screening': { color: 'cyan', text: '書類選考中' },
  'interview': { color: 'geekblue', text: '面接中' },
  'technical': { color: 'purple', text: '技術評価中' },
  'offer': { color: 'orange', text: 'オファー中' },
  'hired': { color: 'success', text: '採用決定' },
  'rejected': { color: 'error', text: '不採用' },
  'withdrawn': { color: 'default', text: '辞退' }
};

export default function NewInterviewPage() {
  const router = useRouter();
  const params = useParams() || {};
  const companyId = typeof params.id === 'string' ? params.id : '';
  
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        // APIを呼び出して候補者と面接官を取得
        const [candidatesData, interviewersData] = await Promise.all([
          getCandidates(companyId),
          getInterviewers(companyId)
        ]);
        
        setCandidates(candidatesData);
        setInterviewers(interviewersData);
      } catch (err) {
        console.error('データの取得に失敗しました', err);
        messageApi.error('候補者または面接官の情報取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId, messageApi]);
  
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
      // 日時の処理
      const combinedStartTime = values.date.clone().hour(values.timeRange[0].hour()).minute(values.timeRange[0].minute());
      const combinedEndTime = values.date.clone().hour(values.timeRange[1].hour()).minute(values.timeRange[1].minute());
      
      // APIに送信するデータを整形
      const interviewData = {
        ...values,
        startTime: combinedStartTime.toISOString(),
        endTime: combinedEndTime.toISOString(),
        // date と timeRange は不要なので削除
        date: undefined,
        timeRange: undefined
      };
      
      // APIを呼び出して面接を作成
      await createInterview(companyId, interviewData);
      
      messageApi.success('面接予定を登録しました');
      
      // 面接一覧画面に戻る（遅延を入れてメッセージを表示する時間を確保）
      setTimeout(() => {
        router.push(`/dashboard/company/${companyId}/interviews`);
      }, 1500);
    } catch (err) {
      console.error('面接予定の登録に失敗しました', err);
      messageApi.error('面接予定の登録に失敗しました。再度お試しください。');
    } finally {
      setSaving(false);
    }
  };
  
  const disabledDate = (current: Dayjs) => {
    // 過去の日付を選択できないようにする
    return current && current < dayjs().startOf('day');
  };
  
  // 候補者のオプションをレンダリング
  const renderCandidateOptions = () => {
    return candidates.map(candidate => (
      <Option key={candidate.id} value={candidate.id}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
          <div>
            <div>{candidate.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {candidate.position}
              {candidate.status && (
                <Tag 
                  color={CANDIDATE_STATUS_CONFIG[candidate.status]?.color} 
                  style={{ marginLeft: 8 }}
                >
                  {CANDIDATE_STATUS_CONFIG[candidate.status]?.text || candidate.status}
                </Tag>
              )}
            </div>
          </div>
        </div>
      </Option>
    ));
  };
  
  // 面接官のオプションをレンダリング
  const renderInterviewerOptions = () => {
    return interviewers.map(interviewer => (
      <Option key={interviewer.id} value={interviewer.id}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
          <div>
            <div>{interviewer.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {interviewer.department}
            </div>
          </div>
        </div>
      </Option>
    ));
  };
  
  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Space>
          <Link href={`/dashboard/company/${companyId}/interviews`}>
            <Button icon={<ArrowLeftOutlined />} type="text">
              面接一覧に戻る
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>新規面接登録</Title>
        </Space>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isOnline: true,
            type: 'initial',
            notifyInterviewers: true,
            notifyCandidate: true,
            date: dayjs().add(1, 'day'),
            timeRange: [dayjs().hour(10).minute(0), dayjs().hour(11).minute(0)]
          }}
        >
          <Divider orientation="left">基本情報</Divider>
          
          <Form.Item
            name="candidateId"
            label="応募者"
            rules={[{ required: true, message: '応募者を選択してください' }]}
          >
            <Select
              placeholder="応募者を選択"
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              loading={loading}
              disabled={loading}
            >
              {renderCandidateOptions()}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="type"
            label="面接種類"
            rules={[{ required: true, message: '面接種類を選択してください' }]}
          >
            <Select placeholder="面接種類を選択">
              {INTERVIEW_TYPES.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="interviewerIds"
            label="面接官"
            rules={[{ required: true, message: '少なくとも1名の面接官を選択してください' }]}
          >
            <Select
              mode="multiple"
              placeholder="面接官を選択（複数選択可）"
              style={{ width: '100%' }}
              loading={loading}
              disabled={loading}
            >
              {renderInterviewerOptions()}
            </Select>
          </Form.Item>
          
          <Divider orientation="left">日時と場所</Divider>
          
          <Form.Item
            name="date"
            label="面接日"
            rules={[{ required: true, message: '面接日を選択してください' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY年MM月DD日"
              disabledDate={disabledDate}
              placeholder="面接日を選択"
            />
          </Form.Item>
          
          <Form.Item
            name="timeRange"
            label="面接時間"
            rules={[{ required: true, message: '面接時間を選択してください' }]}
          >
            <TimePicker.RangePicker 
              style={{ width: '100%' }}
              format="HH:mm"
              minuteStep={15}
              placeholder={['開始時間', '終了時間']}
            />
          </Form.Item>
          
          <Form.Item
            name="isOnline"
            label="オンライン面接"
            valuePropName="checked"
          >
            <Switch checkedChildren="はい" unCheckedChildren="いいえ" />
          </Form.Item>
          
          <Form.Item
            shouldUpdate={(prevValues, currentValues) => prevValues.isOnline !== currentValues.isOnline}
            noStyle
          >
            {({ getFieldValue }) => {
              const isOnline = getFieldValue('isOnline');
              
              return isOnline ? (
                <Form.Item
                  name="onlineLocation"
                  label="オンラインツール"
                  rules={[{ required: true, message: 'オンラインツールを選択してください' }]}
                >
                  <Select placeholder="使用するツールを選択">
                    <Option value="zoom">Zoom</Option>
                    <Option value="google_meet">Google Meet</Option>
                    <Option value="microsoft_teams">Microsoft Teams</Option>
                    <Option value="other">その他</Option>
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  name="location"
                  label="面接場所"
                  rules={[{ required: true, message: '面接場所を選択してください' }]}
                >
                  <Select placeholder="面接場所を選択">
                    {INTERVIEW_LOCATIONS.filter(loc => !loc.value.includes('online')).map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>
          
          <Form.Item
            name="locationDetails"
            label="場所の詳細情報（任意）"
          >
            <Input placeholder="会議室番号、URL、アクセス方法など" />
          </Form.Item>
          
          <Divider orientation="left">通知と備考</Divider>
          
          <Form.Item
            name="notifyInterviewers"
            label="面接官に通知"
            valuePropName="checked"
          >
            <Switch checkedChildren="はい" unCheckedChildren="いいえ" defaultChecked />
          </Form.Item>
          
          <Form.Item
            name="notifyCandidate"
            label="応募者に通知"
            valuePropName="checked"
          >
            <Switch checkedChildren="はい" unCheckedChildren="いいえ" defaultChecked />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="備考"
          >
            <TextArea
              placeholder="面接の目的、事前準備事項、質問事項など"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={1000}
              showCount
            />
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
                面接を登録
              </Button>
              
              <Link href={`/dashboard/company/${companyId}/interviews`}>
                <Button>キャンセル</Button>
              </Link>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Content>
  );
} 