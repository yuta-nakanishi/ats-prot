import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Space, Typography } from 'antd';
import { EmailTemplate } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: Omit<EmailTemplate, 'id'>) => void;
  initialValues?: EmailTemplate;
}

export const EmailTemplateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    } else if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        variables: initialValues.variables.join('\n')
      });
    }
  }, [isOpen, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const template: Omit<EmailTemplate, 'id'> = {
        name: values.name,
        subject: values.subject,
        body: values.body,
        type: values.type,
        variables: values.variables.split('\n').filter(Boolean).map(v => v.trim())
      };
      onSubmit(template);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title={initialValues ? "テンプレートの編集" : "新規テンプレート作成"}
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      width={800}
    >
      <Form 
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          name: '',
          type: 'general',
          subject: '',
          body: '',
          variables: ''
        }}
      >
        <Form.Item
          name="name"
          label="テンプレート名"
          rules={[{ required: true, message: 'テンプレート名を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="type"
          label="種類"
          rules={[{ required: true, message: '種類を選択してください' }]}
        >
          <Select>
            <Select.Option value="interview_invitation">面接案内</Select.Option>
            <Select.Option value="offer">内定通知</Select.Option>
            <Select.Option value="rejection">不採用通知</Select.Option>
            <Select.Option value="general">その他</Select.Option>
          </Select>
        </Form.Item>

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

        <Form.Item
          name="variables"
          label={
            <Space direction="vertical">
              <Text>変数（1行に1つ）</Text>
              <Text type="secondary">例: company, candidate_name, interview_date</Text>
            </Space>
          }
          rules={[{ required: true, message: '少なくとも1つの変数を入力してください' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};