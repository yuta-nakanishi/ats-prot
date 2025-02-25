import React, { useState, useEffect } from 'react';
import { Space, Button, Input, Select } from 'antd';
import { UserAddOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { CandidateList } from './CandidateList';
import { CandidateDetail } from './CandidateDetail';
import { Candidate, JobPosting } from '../types';
import PermissionGuard from './permissions/PermissionGuard';
import { PermissionAction, PermissionResource } from '../lib/types';

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
  candidates: initialCandidates,
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
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCandidates(initialCandidates);
    if (selectedCandidate) {
      const updatedSelectedCandidate = initialCandidates.find(c => c.id === selectedCandidate.id);
      if (updatedSelectedCandidate) {
        setSelectedCandidate(updatedSelectedCandidate);
      }
    }
  }, [initialCandidates, selectedCandidate]);

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

  const handleStatusChange = (id: string, status: Candidate['status']) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === id ? { ...candidate, status } : candidate
      )
    );
    
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate(prev => prev ? { ...prev, status } : null);
    }
    
    onStatusChange(id, status);
  };

  const handleUpdateCandidate = (candidateId: string, updates: Partial<Candidate>) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId ? { ...candidate, ...updates } : candidate
      )
    );
    
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(prev => prev ? { ...prev, ...updates } : null);
    }
    
    onUpdateCandidate(candidateId, updates);
  };

  if (selectedCandidate) {
    return (
      <CandidateDetail
        candidate={selectedCandidate}
        jobPostings={jobPostings}
        onStatusChange={handleStatusChange}
        onAddInterview={onAddInterview}
        onUpdateInterview={onUpdateInterview}
        onAddEvaluation={onAddEvaluation}
        onUpdateCandidate={handleUpdateCandidate}
        onAddDocument={onAddDocument}
        onBack={() => setSelectedCandidate(null)}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Input 
            placeholder="候補者を検索..." 
            prefix={<SearchOutlined />} 
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            style={{ width: 300 }}
          />
          <Select 
            value={statusFilter} 
            onChange={onStatusFilterChange}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="all">全てのステータス</Select.Option>
            <Select.Option value="new">新規</Select.Option>
            <Select.Option value="reviewing">審査中</Select.Option>
            <Select.Option value="interviewed">面接済</Select.Option>
            <Select.Option value="offered">オファー</Select.Option>
            <Select.Option value="rejected">不採用</Select.Option>
          </Select>
        </Space>
        <PermissionGuard
          action={PermissionAction.CREATE}
          resource={PermissionResource.CANDIDATE}
        >
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={onAddCandidate}
          >
            候補者を追加
          </Button>
        </PermissionGuard>
      </div>
      <CandidateList 
        candidates={paginatedCandidates} 
        jobPostings={jobPostings}
        onSelectCandidate={setSelectedCandidate}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        total={filteredCandidates.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
};