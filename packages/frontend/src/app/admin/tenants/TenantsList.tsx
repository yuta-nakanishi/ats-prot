'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Tag, Empty, message } from 'antd';
import { 
  EditOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import TenantForm from './TenantForm';
import { getAllTenants, updateTenant, getTenantUsers } from '@/lib/api/tenant';
import { Company } from '@/types';

interface TenantsListProps {
  searchQuery?: string;
}

// リストコンポーネントのrefを通して外部からアクセスできるメソッド
export interface TenantsListRef {
  refreshList: () => void;
}

const TenantsList = forwardRef<TenantsListRef, TenantsListProps>(({ searchQuery = '' }, ref) => {
  const [tenants, setTenants] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // APIからテナントデータを取得
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllTenants();
      
      // ユーザー情報が欠けているテナントについて、個別にユーザー情報を取得
      const tenantsWithUsers = await Promise.all(
        data.map(async (tenant) => {
          // すでにusers配列がある場合はそのまま使用
          if (tenant.users && tenant.users.length > 0) {
            return tenant;
          }
          
          try {
            // ユーザー情報を個別に取得
            const users = await getTenantUsers(tenant.id);
            return {
              ...tenant,
              users
            };
          } catch (error) {
            console.warn(`テナント「${tenant.name}」のユーザー情報取得に失敗:`, error);
            // エラーが発生してもテナント自体は表示するために元のテナントを返す
            return tenant;
          }
        })
      );
      
      // 検索クエリに基づいてフィルタリング
      const filteredTenants = searchQuery
        ? tenantsWithUsers.filter(tenant => 
            tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.industry?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : tenantsWithUsers;
      
      setTenants(filteredTenants);
    } catch (err) {
      console.error('テナント一覧の取得に失敗しました:', err);
      setError('テナント一覧の取得に失敗しました。再度お試しください。');
      message.error('テナント一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 初回レンダリング時と検索クエリが変更されたときにテナントデータを取得
  useEffect(() => {
    fetchTenants();
  }, [searchQuery]);
  
  // 外部からアクセスできるメソッドを公開
  useImperativeHandle(ref, () => ({
    refreshList: fetchTenants
  }));
  
  // テナント編集
  const handleEdit = (tenant: Company, e: React.MouseEvent) => {
    // クリックイベントの伝播を停止して、行クリックが発生しないようにする
    e.stopPropagation();
    setEditingTenant(tenant);
  };
  
  // テナント更新の保存
  const handleSaveTenant = async (updatedData: any) => {
    try {
      if (!editingTenant) return;
      
      setLoading(true);
      // APIを呼び出して更新
      await updateTenant(editingTenant.id, updatedData);
      
      message.success('テナント情報を更新しました');
      
      // 更新後のデータを再取得
      await fetchTenants();
      
      setEditingTenant(null);
    } catch (err) {
      console.error('テナント更新エラー:', err);
      message.error('テナント情報の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // ステータスに応じたタグの表示
  const renderStatusTag = (isActive: boolean) => {
    return isActive
      ? <Tag icon={<CheckCircleOutlined />} color="success">有効</Tag>
      : <Tag icon={<StopOutlined />} color="error">無効</Tag>;
  };

  // テナント行クリック時の処理
  const handleRowClick = (record: Company) => {
    router.push(`/admin/tenants/${record.id}`);
  };

  const columns = [
    {
      title: 'テナント名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Company) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.tenantId}.yourdomain.com
          </div>
        </div>
      ),
    },
    {
      title: '業種',
      dataIndex: 'industry',
      key: 'industry',
      render: (text: string) => text || '-',
    },
    {
      title: 'ステータス',
      dataIndex: 'isActive',
      key: 'isActive',
      render: renderStatusTag,
    },
    {
      title: 'ユーザー数',
      key: 'userCount',
      render: (_: any, record: Company) => {
        // users配列があればその長さを使用、なければ0を表示
        const count = record.users?.length || 0;
          
        // コンソールにデバッグログを出力（改善）
        if (process.env.NODE_ENV !== 'production') {
          console.log(`テナント「${record.name}」のユーザー情報:`, {
            id: record.id,
            users: record.users,
            usersCount: count
          });
        }
          
        return (
          <Tag icon={<UserOutlined />} color="processing">
            {count}
          </Tag>
        );
      },
    },
    {
      title: '作成日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ja-JP'),
    },
    {
      title: '',
      key: 'edit',
      width: 80,
      render: (_: any, record: Company) => (
        <Button 
          type="text" 
          icon={<EditOutlined />}
          onClick={(e) => handleEdit(record, e)}
          aria-label="テナントを編集"
        />
      ),
    },
  ];

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
      
      {!error && tenants.length > 0 ? (
        <Table 
          dataSource={tenants} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
        />
      ) : (
        <Empty 
          description={
            error 
              ? "データの取得に失敗しました" 
              : searchQuery 
                ? "検索条件に一致するテナントがありません" 
                : "テナントがまだ登録されていません"
          } 
        />
      )}
      
      {/* 編集モーダル */}
      {editingTenant && (
        <TenantForm
          onClose={() => setEditingTenant(null)}
          onSubmit={handleSaveTenant}
          initialData={{
            name: editingTenant.name,
            subdomain: editingTenant.tenantId,
            industry: editingTenant.industry,
            contactEmail: editingTenant.users?.[0]?.email || '',
            contactPerson: editingTenant.users?.[0]?.name || '',
          }}
          isEditing={true}
        />
      )}
    </div>
  );
});

// DisplayNameを設定
TenantsList.displayName = 'TenantsList';

export default TenantsList; 