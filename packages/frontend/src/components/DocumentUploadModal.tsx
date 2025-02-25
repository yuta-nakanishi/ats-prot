import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { Document } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (document: Omit<Document, 'id' | 'uploadDate'>) => void;
}

export const DocumentUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title="書類の追加"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'resume'
        }}
      >
        <Form.Item
          name="type"
          label="書類の種類"
          rules={[{ required: true, message: '書類の種類を選択してください' }]}
        >
          <Select>
            <Select.Option value="resume">履歴書</Select.Option>
            <Select.Option value="cover_letter">職務経歴書</Select.Option>
            <Select.Option value="portfolio">ポートフォリオ</Select.Option>
            <Select.Option value="certification">資格証明書</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="書類名"
          rules={[{ required: true, message: '書類名を入力してください' }]}
        >
          <Input placeholder="履歴書.pdf" />
        </Form.Item>

        <Form.Item
          name="url"
          label="URL"
          rules={[
            { required: true, message: 'URLを入力してください' },
            { type: 'url', message: '有効なURLを入力してください' }
          ]}
        >
          <Input placeholder="https://example.com/document.pdf" />
        </Form.Item>
      </Form>
    </Modal>
  );
};