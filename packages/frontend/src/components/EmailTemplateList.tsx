import React, { useState } from 'react';
import { Card, Button, Space, Typography, List, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { EmailTemplate } from '../lib/types';
import { EmailTemplateModal } from './EmailTemplateModal';

const { Text, Title } = Typography;

interface Props {
  templates: EmailTemplate[];
  onAdd: (template: Omit<EmailTemplate, 'id'>) => void;
  onEdit: (templateId: string, template: Omit<EmailTemplate, 'id'>) => void;
  onDelete: (templateId: string) => void;
}

export const EmailTemplateList: React.FC<Props> = ({
  templates,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>();

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleSubmit = (template: Omit<EmailTemplate, 'id'>) => {
    if (selectedTemplate) {
      onEdit(selectedTemplate.id, template);
    } else {
      onAdd(template);
    }
    setShowModal(false);
  };

  const typeLabels = {
    interview_invitation: '面接案内',
    offer: '内定通知',
    rejection: '不採用通知',
    general: 'その他'
  };

  return (
    <Card
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>メールテンプレート</Title>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedTemplate(undefined);
            setShowModal(true);
          }}
        >
          テンプレート追加
        </Button>
      }
    >
      <List
        dataSource={templates}
        renderItem={(template) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEdit(template)}
              />,
              <Popconfirm
                key="delete"
                title="このテンプレートを削除しますか？"
                onConfirm={() => onDelete(template.id)}
                okText="削除"
                cancelText="キャンセル"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{template.name}</Text>
                  <Text type="secondary">({typeLabels[template.type]})</Text>
                </Space>
              }
              description={
                <Space direction="vertical">
                  <Text>件名: {template.subject}</Text>
                  <Text type="secondary">
                    変数: {template.variables.join(', ')}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <EmailTemplateModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTemplate(undefined);
        }}
        onSubmit={handleSubmit}
        initialValues={selectedTemplate}
      />
    </Card>
  );
};