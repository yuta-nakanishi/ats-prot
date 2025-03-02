import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { Candidate, JobPosting } from '../types';

const { Text } = Typography;

interface Props {
  candidates: Candidate[];
  jobPostings: JobPosting[];
  onSelectCandidate: (candidate: Candidate) => void;
  onStatusChange: (id: string, status: Candidate['status']) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

// 状態に対応する表示ラベル
const statusLabels = {
  new: '新規',
  screening: '書類選考中',
  interview: '面接中',
  technical: '技術面接中',
  offer: '内定提示中',
  hired: '内定承諾',
  rejected: '不採用',
  withdrawn: '辞退'
};

// 状態に対応する色
const statusColors = {
  new: 'blue',
  screening: 'cyan',
  interview: 'purple',
  technical: 'geekblue',
  offer: 'orange',
  hired: 'green',
  rejected: 'red',
  withdrawn: 'gray'
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
      title: '求人',
      dataIndex: 'jobPostingId',
      key: 'jobPosting',
      render: (jobPostingId: string) => {
        const jobPosting = jobPostings.find(jp => jp.id === jobPostingId);
        return jobPosting ? jobPosting.title : '未設定';
      }
    },
    {
      title: '役職',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '応募日',
      key: 'appliedDate',
      render: (record: Candidate) => record.appliedDate ? formatDate(record.appliedDate) : '未設定'
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