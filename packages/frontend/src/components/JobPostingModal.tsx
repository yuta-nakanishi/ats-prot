import React from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Space } from 'antd';
import { JobPosting } from '../types';
import dayjs from 'dayjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobPosting: Omit<JobPosting, 'id'> | JobPosting) => void;
  initialValues?: JobPosting;
}

export const JobPostingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    } else if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        requirements: initialValues.requirements.join('\n'),
        preferredSkills: initialValues.preferredSkills.join('\n'),
        closingDate: initialValues.closingDate ? dayjs(initialValues.closingDate) : undefined,
        salaryMin: initialValues.salaryRange?.min || 0,
        salaryMax: initialValues.salaryRange?.max || 0
      });
    }
  }, [isOpen, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const jobPosting = {
        ...(initialValues && { id: initialValues.id }),
        title: values.title,
        department: values.department,
        location: values.location,
        employmentType: values.employmentType,
        status: values.status,
        description: values.description,
        requirements: values.requirements.split('\n').filter(Boolean),
        preferredSkills: values.preferredSkills.split('\n').filter(Boolean),
        salaryRange: {
          min: values.salaryMin || 0,
          max: values.salaryMax || 0
        },
        postedDate: initialValues?.postedDate || new Date().toISOString(),
        closingDate: values.closingDate?.toISOString()
      };
      onSubmit(jobPosting);
      onClose();
    });
  };

  return (
    <Modal
      title={initialValues ? "求人情報の編集" : "新規求人登録"}
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
        initialValues={{
          title: '',
          department: '',
          location: '',
          employmentType: 'full-time',
          status: 'draft',
          description: '',
          requirements: '',
          preferredSkills: '',
          salaryMin: 0,
          salaryMax: 0
        }}
      >
        <Form.Item
          name="title"
          label="求人タイトル"
          rules={[{ required: true, message: '求人タイトルを入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="department"
          label="部署"
          rules={[{ required: true, message: '部署を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="location"
          label="勤務地"
          rules={[{ required: true, message: '勤務地を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="employmentType"
          label="雇用形態"
          rules={[{ required: true, message: '雇用形態を選択してください' }]}
        >
          <Select>
            <Select.Option value="full-time">正社員</Select.Option>
            <Select.Option value="part-time">パートタイム</Select.Option>
            <Select.Option value="contract">契約社員</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="ステータス"
          rules={[{ required: true, message: 'ステータスを選択してください' }]}
        >
          <Select>
            <Select.Option value="open">公開</Select.Option>
            <Select.Option value="closed">終了</Select.Option>
            <Select.Option value="draft">下書き</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="職務内容"
          rules={[{ required: true, message: '職務内容を入力してください' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="requirements"
          label="必須要件（1行に1つ）"
          rules={[{ required: true, message: '必須要件を入力してください' }]}
        >
          <Input.TextArea rows={4} placeholder="5年以上のフロントエンド開発経験&#13;&#10;React/TypeScriptでの開発経験" />
        </Form.Item>

        <Form.Item
          name="preferredSkills"
          label="歓迎スキル（1行に1つ）"
          rules={[{ required: true, message: '歓迎スキルを入力してください' }]}
        >
          <Input.TextArea rows={4} placeholder="Next.js&#13;&#10;GraphQL" />
        </Form.Item>

        <Form.Item label="給与範囲">
          <Space.Compact block>
            <Form.Item
              name="salaryMin"
              rules={[{ required: true, message: '最低給与を入力してください' }]}
              noStyle
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={1000000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                placeholder="最低給与"
              />
            </Form.Item>
            <Form.Item
              name="salaryMax"
              rules={[{ required: true, message: '最高給与を入力してください' }]}
              noStyle
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={1000000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                placeholder="最高給与"
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="closingDate"
          label="募集終了日"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};