import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, List, Typography } from 'antd';
import { EmailTemplate, EmailMessage } from '../lib/types';

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: { subject: string; body: string; type: EmailMessage['type'] }) => void;
  candidateName: string;
  templates: EmailTemplate[];
}

export const EmailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  templates
}) => {
  const [form] = Form.useForm();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [previewMode, setPreviewMode] = useState(false);

  // テンプレート変更時に件名と本文を更新する
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        let subject = template.subject;
        let body = template.body;

        // 変数置換
        subject = subject.replace(/{{candidate_name}}/g, candidateName);
        body = body.replace(/{{candidate_name}}/g, candidateName);

        form.setFieldsValue({
          subject,
          body
        });
      }
    }
  }, [selectedTemplateId, candidateName, form, templates]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        subject: values.subject,
        body: values.body,
        type: values.type || 'general'
      });
      form.resetFields();
      onClose();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="メール送信"
      open={isOpen}
      onCancel={handleCancel}
      onOk={handleSubmit}
      width={800}
      destroyOnClose={true}
      footer={[
        <button
          key="toggle-preview"
          onClick={() => setPreviewMode(!previewMode)}
          className="ant-btn"
        >
          {previewMode ? 'フォームに戻る' : 'プレビュー'}
        </button>,
        <button key="cancel" onClick={handleCancel} className="ant-btn">
          キャンセル
        </button>,
        <button
          key="submit"
          onClick={handleSubmit}
          className="ant-btn ant-btn-primary"
        >
          送信
        </button>
      ]}
    >
      {previewMode ? (
        <div className="email-preview">
          <h3>件名: {form.getFieldValue('subject')}</h3>
          <div
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: form.getFieldValue('body').replace(/\n/g, '<br>') }}
          />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          name="emailForm"
        >
          <Form.Item
            name="templateId"
            label="テンプレート"
          >
            <Select
              placeholder="テンプレートを選択"
              onChange={(value) => setSelectedTemplateId(value)}
              allowClear
            >
              {templates.map(template => (
                <Select.Option key={template.id} value={template.id}>
                  {template.name} ({template.type === 'interview_invitation' ? '面接案内' : 
                    template.type === 'offer' ? '内定通知' : 
                    template.type === 'rejection' ? '不採用通知' : 'その他'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="メール種類"
            initialValue="general"
            rules={[{ required: true, message: 'メール種類を選択してください' }]}
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
        </Form>
      )}
    </Modal>
  );
};