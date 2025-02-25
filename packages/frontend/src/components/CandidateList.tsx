import React from 'react';
import { Table, Tag, Space, Typography, Button } from 'antd';
import { UserOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Candidate } from '../types';

const { Text } = Typography;

interface Props {
  candidates: Candidate[];
  jobPostings: JobPosting[];
  onSelectCandidate: (candidate: Candidate) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

const statusColors = {
  new: 'blue',
  reviewing: 'gold',
  interviewed: 'purple',
  offered: 'green',
  rejected: 'red'
};

const statusLabels = {
  new: '新規',
  reviewing: '審査中',
  interviewed: '面接済',
  offered: '内定',
  rejected: '不採用'
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP');
};

export const CandidateList: React.FC<Props> = ({
  candidates,
  jobPostings,
  onSelectCandidate,
  currentPage,
  pageSize,
  total,
  onPageChange
}) => {
  const columns = [
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'ステータス',
      key: 'status',
      render: (record: Candidate) => (
        <Tag color={statusColors[record.status]}>
          {statusLabels[record.status]}
        </Tag>
      ),
    },
    {
      title: '応募求人',
      key: 'jobPosting',
      render: (record: Candidate) => {
        const jobPosting = jobPostings?.find(job => job.id === record.jobPostingId) || record.jobPosting;
        return (
          <Text>
            {jobPosting?.title || '-'}
          </Text>
        );
      },
    },
    {
      title: '役職',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '応募日',
      key: 'appliedDate',
      render: (record: Candidate) => formatDate(record.appliedDate)
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={candidates}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => onSelectCandidate(record),
        style: { cursor: 'pointer' }
      })}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        onChange: onPageChange,
        showSizeChanger: true,
        showTotal: (total) => `全${total}件`,
      }}
    />
  );
};