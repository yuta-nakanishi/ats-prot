import React from 'react';
import { Modal, Form, Input, InputNumber, Space, Select } from 'antd';
import { Candidate, JobPosting } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateId: string, updates: Partial<Candidate>) => void;
  candidate: Candidate;
  jobPostings: JobPosting[];
}

export const EditCandidateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  candidate,
  jobPostings
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (isOpen) {
      console.log(candidate)
      form.setFieldsValue({
        jobPostingId: candidate.jobPosting?.id,
        ...candidate,
        skills: candidate.skills.join(', ')
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, candidate, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const updates: Partial<Candidate> = {
        name: values.name,
        email: values.email,
        role: values.role,
        experience: values.experience,
        skills: values.skills.split(',').map(s => s.trim()),
        location: values.location,
        source: values.source,
        expectedSalary: values.expectedSalary,
        currentSalary: values.currentSalary,
        notes: values.notes,
        jobPostingId: values.jobPostingId
      };
      onSubmit(candidate.id, updates);
      onClose();
    });
  };

  return (
    <Modal
      title="候補者情報の編集"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: '',
          email: '',
          role: '',
          experience: 0,
          skills: '',
          location: '',
          source: '',
          expectedSalary: undefined,
          currentSalary: undefined,
          notes: '',
          jobPostingId: candidate.jobPosting?.id
        }}
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

        <Space className="w-full" size="large">
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
        </Space>

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
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
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
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
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