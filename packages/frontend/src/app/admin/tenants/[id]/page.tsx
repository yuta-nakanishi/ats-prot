'use client';

import Link from 'next/link';
import TenantDetail from '@/app/admin/tenants/[id]/TenantDetail';
import { notFound } from 'next/navigation';
import { Breadcrumb, Card, Space } from 'antd';
import { HomeOutlined, BuildOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';

export default function TenantDetailPage() {
  const params = useParams();
  // paramsがnullの場合はnotFound()を返す
  if (!params) {
    return notFound();
  }
  
  const id = params.id as string;
  
  if (!id) {
    return notFound();
  }
  
  return (
    <div>
      {/* パンくずリスト */}
      <Breadcrumb
        className="mb-4"
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
              <Link href="/admin/tenants">
                <Space>
                  <BuildOutlined />
                  <span>テナント一覧</span>
                </Space>
              </Link>
            )
          },
          { 
            title: 'テナント詳細'
          },
        ]}
      />
      
      <Card bordered={false}>
        <TenantDetail id={id} />
      </Card>
    </div>
  );
} 