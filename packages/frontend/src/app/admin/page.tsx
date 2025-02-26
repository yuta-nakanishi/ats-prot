'use client';

import { Card, Row, Col, Statistic, Button, Typography, Space } from 'antd';
import { 
  TeamOutlined, 
  SettingOutlined, 
  BuildOutlined, 
  BarChartOutlined, 
  RightOutlined 
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function AdminDashboard() {
  // モックデータ
  const statistics = {
    tenants: 12,
    activeUsers: 87,
    newTenantsThisMonth: 3,
    activeTenantsPercent: 92
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography>
          <Title level={2}>プラットフォーム管理ダッシュボード</Title>
          <Paragraph>プラットフォーム全体の状況を管理・監視できます。</Paragraph>
        </Typography>

        {/* 統計情報カード */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="テナント数"
                value={statistics.tenants}
                prefix={<BuildOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="アクティブユーザー"
                value={statistics.activeUsers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#0050b3' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="今月の新規テナント"
                value={statistics.newTenantsThisMonth}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="アクティブテナント率"
                value={statistics.activeTenantsPercent}
                suffix="%"
                prefix={<SettingOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 機能カード */}
        <Title level={4}>主要機能</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card 
              title="テナント管理" 
              bordered={false} 
              extra={<Link href="/admin/tenants">詳細 <RightOutlined /></Link>}
              actions={[
                <Button type="primary" key="manage">
                  <Link href="/admin/tenants">管理する</Link>
                </Button>
              ]}
            >
              <Paragraph>
                企業アカウントの作成・管理を行います。テナントの追加、編集、詳細の確認などができます。
              </Paragraph>
              <Statistic 
                title="登録テナント" 
                value={statistics.tenants} 
                valueStyle={{ fontSize: '18px' }} 
              />
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card 
              title="ユーザー管理" 
              bordered={false} 
              extra={<Link href="/admin/users">詳細 <RightOutlined /></Link>}
              actions={[
                <Button type="primary" key="manage">
                  <Link href="/admin/users">管理する</Link>
                </Button>
              ]}
            >
              <Paragraph>
                プラットフォームユーザーの管理を行います。ユーザーの追加、編集、権限の設定などができます。
              </Paragraph>
              <Statistic 
                title="アクティブユーザー" 
                value={statistics.activeUsers} 
                valueStyle={{ fontSize: '18px' }} 
              />
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card 
              title="システム設定" 
              bordered={false} 
              extra={<Link href="/admin/settings">詳細 <RightOutlined /></Link>}
              actions={[
                <Button type="primary" key="manage">
                  <Link href="/admin/settings">設定する</Link>
                </Button>
              ]}
            >
              <Paragraph>
                プラットフォーム全体の設定を行います。システム設定、通知設定、APIキーの管理などができます。
              </Paragraph>
              <Statistic 
                title="システム稼働率" 
                value="99.8%" 
                valueStyle={{ fontSize: '18px' }} 
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
} 