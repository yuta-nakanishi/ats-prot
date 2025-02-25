import React from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Input } from 'antd';
import { Interview } from '../types';
import dayjs from 'dayjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (interview: Omit<Interview, 'id' | 'status' | 'feedback'>) => void;
  candidateName: string;
}

export const AddInterviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit({
        type: values.type,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        interviewer: values.interviewer,
        location: values.location
      });
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title="面接スケジュール登録"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
    >
      <p className="mb-4">候補者: {candidateName}</p>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(),
          time: dayjs(),
          type: 'initial',
          location: 'online'
        }}
      >
        <Form.Item
          name="type"
          label="面接種別"
          rules={[{ required: true, message: '面接種別を選択してください' }]}
        >
          <Select>
            <Select.Option value="initial">一次面接</Select.Option>
            <Select.Option value="technical">技術面接</Select.Option>
            <Select.Option value="cultural">カルチャー面接</Select.Option>
            <Select.Option value="final">最終面接</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="日付"
          rules={[{ required: true, message: '日付を選択してください' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="time"
          label="時間"
          rules={[{ required: true, message: '時間を選択してください' }]}
        >
          <TimePicker className="w-full" format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="interviewer"
          label="面接官"
          rules={[{ required: true, message: '面接官を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="location"
          label="面接形式"
          rules={[{ required: true, message: '面接形式を選択してください' }]}
        >
          <Select>
            <Select.Option value="online">オンライン</Select.Option>
            <Select.Option value="office">オフィス</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};