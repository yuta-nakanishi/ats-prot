import React from 'react';
import { Modal, Form, Input, Rate } from 'antd';
import { Evaluation } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evaluation: Omit<Evaluation, 'id'>) => void;
  interviewId: string;
  interviewer: string;
}

export const EvaluationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  interviewId,
  interviewer
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        evaluator: interviewer,
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, interviewer, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const evaluation: Omit<Evaluation, 'id'> = {
        evaluator: values.evaluator,
        date: values.date,
        criteria: {
          technicalSkills: values.technicalSkills,
          communication: values.communication,
          problemSolving: values.problemSolving,
          teamwork: values.teamwork,
          culture: values.culture,
        },
        comments: values.comments
      };
      onSubmit(evaluation);
      onClose();
    });
  };

  return (
    <Modal
      title="面接評価"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          technicalSkills: 3,
          communication: 3,
          problemSolving: 3,
          teamwork: 3,
          culture: 3
        }}
      >
        <Form.Item
          name="evaluator"
          label="評価者"
          rules={[{ required: true, message: '評価者を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="technicalSkills"
          label="技術力"
          rules={[{ required: true, message: '技術力を評価してください' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="communication"
          label="コミュニケーション"
          rules={[{ required: true, message: 'コミュニケーション力を評価してください' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="problemSolving"
          label="問題解決力"
          rules={[{ required: true, message: '問題解決力を評価してください' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="teamwork"
          label="チームワーク"
          rules={[{ required: true, message: 'チームワークを評価してください' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="culture"
          label="文化適合性"
          rules={[{ required: true, message: '文化適合性を評価してください' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="comments"
          label="コメント"
          rules={[{ required: true, message: 'コメントを入力してください' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};