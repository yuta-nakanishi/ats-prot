import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Space } from 'antd';
import { Candidate, JobPosting } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidate: Omit<Candidate, 'id'>) => void;
  jobPostings: JobPosting[];
}

export const AddCandidateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  jobPostings
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newCandidate: Omit<Candidate, 'id'> = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: 'new',
        experience: values.experience,
        skills: values.skills.split(',').map((s: string) => s.trim()),
        appliedDate: new Date().toISOString(),
        notes: values.notes || '',
        interviews: [],
        evaluations: [],
        source: values.source,
        location: values.location,
        expectedSalary: values.expectedSalary,
        currentSalary: values.currentSalary,
        documents: [],
        jobPostingId: values.jobPostingId,
        emailHistory: []
      };
      onSubmit(newCandidate);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title="新規候補者登録"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      width={800}
      destroyOnClose={false}
      forceRender
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="jobPostingId"
          label="応募求人"
          rules={[{ required: true, message: '応募求人を選択してください' }]}
        >
          <Select>
            {jobPostings.map(job => (
              <Select.Option key={job.id} value={job.id}>
                {job.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="氏名"
          rules={[{ required: true, message: '氏名を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="メールアドレス"
          rules={[
            { required: true, message: 'メールアドレスを入力してください' },
            { type: 'email', message: '有効なメールアドレスを入力してください' }
          ]}
        >
          <Input />
        </Form.Item>

        <Space className="w-full" size="large">
          <Form.Item
            name="role"
            label="役職"
            rules={[{ required: true, message: '役職を入力してください' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="experience"
            label="経験年数"
            rules={[{ required: true, message: '経験年数を入力してください' }]}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Space>

        <Form.Item
          name="skills"
          label="スキル（カンマ区切り）"
          rules={[{ required: true, message: 'スキルを入力してください' }]}
        >
          <Input placeholder="React, TypeScript, Node.js" />
        </Form.Item>

        <Space className="w-full" size="large">
          <Form.Item
            name="location"
            label="勤務地"
            rules={[{ required: true, message: '勤務地を入力してください' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="source"
            label="応募経路"
            rules={[{ required: true, message: '応募経路を入力してください' }]}
          >
            <Input />
          </Form.Item>
        </Space>

        <Space className="w-full" size="large">
          <Form.Item
            name="expectedSalary"
            label="希望年収"
          >
            <InputNumber
              min={0}
              step={1000000}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              placeholder="6000000"
            />
          </Form.Item>

          <Form.Item
            name="currentSalary"
            label="現在の年収"
          >
            <InputNumber
              min={0}
              step={1000000}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              placeholder="5000000"
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="notes"
          label="メモ"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};