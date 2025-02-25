import React from 'react';
import { List, Card, Tag, Space, Typography, Button } from 'antd';
import { EnvironmentOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { JobPosting } from '../types';

const { Text, Title } = Typography;

interface Props {
  jobPostings: JobPosting[];
  onEdit: (jobPosting: JobPosting) => void;
  onDelete: (jobPostingId: string) => void;
}

const statusColors = {
  open: 'green',
  closed: 'red',
  draft: 'gold'
};

const statusLabels = {
  open: '公開中',
  closed: '終了',
  draft: '下書き'
};

const employmentTypeLabels = {
  'full-time': '正社員',
  'part-time': 'パートタイム',
  'contract': '契約社員'
};

export const JobPostingList: React.FC<Props> = ({ jobPostings, onEdit, onDelete }) => {
  const formatSalary = (amount: number) => {
    return `${(amount / 10000).toFixed(0)}万円`;
  };

  const getSalaryRange = (jobPosting: JobPosting) => {
    const min = jobPosting.salaryRange?.min || jobPosting.salaryRangeMin;
    const max = jobPosting.salaryRange?.max || jobPosting.salaryRangeMax;
    return `${formatSalary(min)} 〜 ${formatSalary(max)}`;
  };

  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
      dataSource={jobPostings}
      renderItem={(jobPosting) => (
        <List.Item>
          <Card
            hoverable
            onClick={() => onEdit(jobPosting)}
          >
            <Space direction="vertical" className="w-full">
              <Space className="w-full justify-between">
                <Space>
                  <Title level={5} style={{ margin: 0 }}>{jobPosting.title}</Title>
                  <Tag color={statusColors[jobPosting.status]}>
                    {statusLabels[jobPosting.status]}
                  </Tag>
                </Space>
                <Button type="link" onClick={(e) => {
                  e.stopPropagation();
                  onEdit(jobPosting);
                }}>
                  詳細
                </Button>
              </Space>

              <Space direction="vertical">
                <Text>
                  <TeamOutlined className="mr-2" />
                  {jobPosting.department}
                </Text>
                <Text>
                  <EnvironmentOutlined className="mr-2" />
                  {jobPosting.location}
                </Text>
                <Text>
                  <CalendarOutlined className="mr-2" />
                  {new Date(jobPosting.postedDate).toLocaleDateString('ja-JP')}
                </Text>
              </Space>

              <Space className="w-full justify-between">
                <Text>{employmentTypeLabels[jobPosting.employmentType]}</Text>
                <Text>
                  {getSalaryRange(jobPosting)}
                </Text>
              </Space>

              <div>
                {jobPosting.preferredSkills.map((skill) => (
                  <Tag key={skill} className="mr-2 mb-2">{skill}</Tag>
                ))}
              </div>
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
};