'use client';

import { useState, useRef } from 'react';
import { Typography, Button, Space, Input, Breadcrumb, Card, message, Modal } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  HomeOutlined, 
  BuildOutlined,
  UserOutlined,
  KeyOutlined,
  CopyOutlined 
} from '@ant-design/icons';
import Link from 'next/link';
import TenantsList from './TenantsList';
import TenantForm from './TenantForm';
import { createTenant } from '@/lib/api/tenant';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

interface TenantCreationResult {
  company: {
    id: string;
    name: string;
    tenantId: string;
  };
  adminUser?: {
    id: string;
    email: string;
    name: string;
  };
  temporaryPassword?: string;
  adminCreated?: boolean;
}

export default function TenantsPage() {
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationResult, setCreationResult] = useState<TenantCreationResult | null>(null);
  // フォーム入力値を一時的に保存するための状態
  const [lastFormData, setLastFormData] = useState<any>(null);
  const router = useRouter();
  const tenantsListRef = useRef<{ refreshList: () => void } | null>(null);

  // テナント作成処理
  const handleCreateTenant = async (formData: any) => {
    try {
      // フォームデータを保存
      setLastFormData(formData);
      setIsSubmitting(true);
      // APIを呼び出してテナントを作成
      const result = await createTenant({
        name: formData.name,
        tenantId: formData.subdomain,
        industry: formData.industry,
        adminEmail: formData.contactEmail,
      });
      
      console.log('テナント作成結果:', result); // レスポンスをデバッグ
      
      // 成功メッセージ
      message.success(`テナント「${result.company.name}」を作成しました`);
      
      // テナントフォームを閉じる
      setShowTenantForm(false);
      
      // 作成結果を保存して結果モーダルを表示
      setCreationResult(result);
      
      // テナント一覧を更新
      if (tenantsListRef.current) {
        setTimeout(() => {
          tenantsListRef.current?.refreshList();
        }, 500);
      }
    } catch (error) {
      console.error('テナント作成エラー:', error);
      
      // エラーオブジェクトからメッセージを抽出
      let errorMessage = 'テナント作成に失敗しました。再度お試しください。';
      if (error instanceof Error) {
        errorMessage = `テナント作成に失敗しました: ${error.message}`;
      }
      
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // パスワードをクリップボードにコピー
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success('パスワードをクリップボードにコピーしました');
      })
      .catch(() => {
        message.error('コピーに失敗しました');
      });
  };

  // 結果モーダルを閉じる
  const closeResultModal = () => {
    setCreationResult(null);
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* パンくずリスト */}
        <Breadcrumb
          items={[
            { 
              title: (
                <Link href="/admin">
                  <Space>
                    <HomeOutlined />
                    <span>ダッシュボード</span>
                  </Space>
                </Link>
              ) 
            },
            { 
              title: (
                <Space>
                  <BuildOutlined />
                  <span>テナント管理</span>
                </Space>
              ) 
            },
          ]}
        />
        
        <div>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Typography>
              <Title level={2}>テナント管理</Title>
              <Paragraph>プラットフォーム上のテナント（企業アカウント）を管理します。</Paragraph>
            </Typography>
            
            <Card>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <Space>
                  <Input 
                    placeholder="テナント名で検索" 
                    prefix={<SearchOutlined />} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: 250 }}
                  />
                </Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setShowTenantForm(true)}
                >
                  新規テナント作成
                </Button>
              </div>
              
              {/* テナント一覧 */}
              <TenantsList 
                searchQuery={searchQuery} 
                ref={tenantsListRef}
              />
            </Card>
            
            {/* テナント作成フォーム */}
            {showTenantForm && (
              <TenantForm
                onClose={() => setShowTenantForm(false)}
                onSubmit={handleCreateTenant}
                isLoading={isSubmitting}
              />
            )}
            
            {/* テナント作成結果モーダル */}
            <Modal
              title={
                <Space>
                  <BuildOutlined />
                  <span>テナント作成完了</span>
                </Space>
              }
              open={!!creationResult}
              onCancel={closeResultModal}
              footer={[
                <Button key="ok" type="primary" onClick={closeResultModal}>
                  閉じる
                </Button>
              ]}
              width={600}
            >
              {creationResult && (
                <div>
                  <Typography>
                    <Title level={4}>テナント情報</Title>
                    <Paragraph>
                      <Space direction="vertical">
                        <Text strong>テナント名:</Text>
                        <Text>{creationResult.company.name}</Text>
                        
                        <Text strong>テナントID:</Text>
                        <Text>{creationResult.company.tenantId}</Text>
                      </Space>
                    </Paragraph>
                    
                    {(creationResult.adminCreated || creationResult.adminUser) && (
                      <>
                        <Title level={4} style={{ marginTop: 24 }}>
                          <Space>
                            <UserOutlined />
                            <span>管理者ユーザー</span>
                          </Space>
                        </Title>
                        <Paragraph>
                          <Space direction="vertical">
                            <Text strong>メールアドレス:</Text>
                            <Text>
                              {creationResult.adminUser?.email || 
                               lastFormData?.contactEmail || 
                               '管理者メールアドレス'}
                            </Text>
                            
                            {creationResult.temporaryPassword && (
                              <>
                                <Text strong>
                                  <Space>
                                    <KeyOutlined />
                                    <span>初期パスワード（メモしてください）:</span>
                                  </Space>
                                </Text>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  background: '#f5f5f5', 
                                  padding: '8px 16px', 
                                  borderRadius: '4px', 
                                  fontFamily: 'monospace',
                                  marginTop: '8px'
                                }}>
                                  <Text code style={{ fontSize: '16px', marginRight: '16px' }}>
                                    {creationResult.temporaryPassword}
                                  </Text>
                                  <Button 
                                    icon={<CopyOutlined />} 
                                    type="text"
                                    onClick={() => copyToClipboard(creationResult.temporaryPassword || '')}
                                    title="クリップボードにコピー"
                                  />
                                </div>
                                <Text type="warning" style={{ marginTop: '8px' }}>
                                  ※このパスワードは一度しか表示されません。必ずメモしてください。
                                </Text>
                              </>
                            )}
                          </Space>
                        </Paragraph>
                        
                        <Paragraph style={{ marginTop: 16 }}>
                          <Text type="secondary">
                            管理者ユーザーは上記メールアドレスとパスワードでログインできます。
                            初回ログイン後、パスワードの変更を推奨します。
                          </Text>
                        </Paragraph>
                      </>
                    )}
                  </Typography>
                </div>
              )}
            </Modal>
          </Space>
        </div>
      </Space>
    </div>
  );
} 