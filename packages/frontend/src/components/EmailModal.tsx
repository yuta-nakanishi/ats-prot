import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Space, Button, List, Typography } from 'antd';
import { EmailTemplate, EmailMessage, initialEmailTemplates } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: Omit<EmailMessage, 'id' | 'sentDate'>) => void;
  recipientEmail: string;
  recipientName: string;
}

export const EmailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSend,
  recipientEmail,
  recipientName
}) => {
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setSelectedTemplate(null);
      setCustomVariables({});
    }
  }, [isOpen, form]);

  const handleTemplateSelect = (templateId: string) => {
    const template = initialEmailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      
      // Initialize variables with default values
      const initialVariables = {
        company: '株式会社サンプル',
        candidate_name: recipientName,
        sender_name: '採用担当',
        ...customVariables
      };
      setCustomVariables(initialVariables);

      // Update form with template content
      let subject = template.subject;
      let body = template.body;

      // Replace variables in subject and body
      Object.entries(initialVariables).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      form.setFieldsValue({
        subject,
        body
      });
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    const newVariables = { ...customVariables, [variable]: value };
    setCustomVariables(newVariables);

    if (selectedTemplate) {
      let subject = selectedTemplate.subject;
      let body = selectedTemplate.body;

      Object.entries(newVariables).forEach(([key, val]) => {
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), val);
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), val);
      });

      form.setFieldsValue({
        subject,
        body
      });
    }
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSend({
        subject: values.subject,
        body: values.body,
        sender: 'recruiter@company.com',
        recipient: recipientEmail,
        type: selectedTemplate?.type || 'general'
      });
      onClose();
    });
  };

  return (
    <Modal
      title="メール作成"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      width={800}
    >
      <Form 
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          subject: '',
          body: ''
        }}
      >
        <Form.Item label="テンプレート">
          <Select
            placeholder="テンプレートを選択"
            onChange={handleTemplateSelect}
            allowClear
          >
            {initialEmailTemplates.map(template => (
              <Select.Option key={template.id} value={template.id}>
                {template.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedTemplate && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Text strong>変数の設定</Text>
            <List
              size="small"
              dataSource={selectedTemplate.variables}
              renderItem={variable => (
                <List.Item>
                  <Input
                    addonBefore={variable}
                    value={customVariables[variable] || ''}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        <Form.Item
          name="subject"
          label="件名"
          rules={[{ required: true, message: '件名を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="body"
          label="本文"
          rules={[{ required: true, message: '本文を入力してください' }]}
        >
          <TextArea rows={10} />
        </Form.Item>
      </Form>
    </Modal>
  );
};