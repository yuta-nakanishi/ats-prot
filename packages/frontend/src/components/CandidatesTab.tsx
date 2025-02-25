import React, { useState } from 'react';
import { Space, Button, Input, Select } from 'antd';
import { UserAddOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { CandidateList } from './CandidateList';
import { CandidateDetail } from './CandidateDetail';
import { Candidate, JobPosting } from '../types';

interface Props {
  candidates: Candidate[];
  jobPostings: JobPosting[];
  onStatusChange: (id: string, status: Candidate['status']) => void;
  onAddCandidate: () => void;
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
  onAddInterview: (candidateId: string, interview: any) => void;
  onUpdateInterview: (candidateId: string, interviewId: string, updates: any) => void;
  onAddEvaluation: (candidateId: string, evaluation: any) => void;
  onAddDocument: (candidateId: string, document: any) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: Candidate['status'] | 'all';
  onStatusFilterChange: (value: Candidate['status'] | 'all') => void;
}

const PAGE_SIZE = 9;

export const CandidatesTab: React.FC<Props> = ({
  candidates,
  jobPostings,
  onStatusChange,
  onAddCandidate,
  onUpdateCandidate,
  onAddInterview,
  onUpdateInterview,
  onAddEvaluation,
  onAddDocument,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchValue.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchValue.toLowerCase())) ||
      candidate.location.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setSelectedCandidate(null);
  };

  if (selectedCandidate) {
    return (
      <CandidateDetail
        candidate={selectedCandidate}
        jobPostings={jobPostings}
        onStatusChange={onStatusChange}
        onAddInterview={onAddInterview}
        onUpdateInterview={onUpdateInterview}
        onAddEvaluation={onAddEvaluation}
        onUpdateCandidate={onUpdateCandidate}
        onAddDocument={onAddDocument}
        onBack={() => setSelectedCandidate(null)}
      />
    );
  }

  return (
    <>
      <Space className="w-full mb-4" size="middle">
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={onAddCandidate}
        >
          候補者を追加
        </Button>
        <Input
          placeholder="候補者を検索..."
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={statusFilter}
          onChange={onStatusFilterChange}
          style={{ width: 150 }}
          prefix={<FilterOutlined />}
        >
          <Select.Option value="all">全てのステータス</Select.Option>
          <Select.Option value="new">新規</Select.Option>
          <Select.Option value="reviewing">審査中</Select.Option>
          <Select.Option value="interviewed">面接済</Select.Option>
          <Select.Option value="offered">内定</Select.Option>
          <Select.Option value="rejected">不採用</Select.Option>
        </Select>
      </Space>

      <CandidateList
        candidates={paginatedCandidates}
        jobPostings={jobPostings}
        onSelectCandidate={setSelectedCandidate}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        total={filteredCandidates.length}
        onPageChange={handlePageChange}
      />
    </>
  );
};