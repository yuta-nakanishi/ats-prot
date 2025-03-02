'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Space, Tabs, Button, Input, Select, Spin } from 'antd';
import { TeamOutlined, PlusOutlined, SearchOutlined, FilterOutlined, LogoutOutlined } from '@ant-design/icons';
import { JobPostingList } from './components/JobPostingList';
import { AddCandidateModal } from './components/AddCandidateModal';
import { JobPostingModal } from './components/JobPostingModal';
import { EmailTemplateList } from './components/EmailTemplateList';
import { Dashboard } from './components/reporting/Dashboard';
import { CandidatesTab } from './components/CandidatesTab';
import { Candidate, Document, Interview, Evaluation, JobPosting, EmailTemplate, CandidateStatus } from './lib/types';
import { jobPostingsApi, candidatesApi, interviewsApi, evaluationsApi, emailTemplatesApi } from './lib/api';
import { useAuth } from './contexts/AuthContext';
import axios from 'axios';
import PermissionGuard from './components/permissions/PermissionGuard';
import { PermissionAction, PermissionResource } from './lib/types';

const { Header, Content } = Layout;
const { Title } = Typography;

interface AppProps {
  initialTab?: 'dashboard' | 'candidates' | 'jobs' | 'templates' | 'users' | 'permissions';
}

function App({ initialTab = 'dashboard' }: AppProps) {
  const { logout } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState<CandidateStatus | 'all'>('all');
  const [jobStatusFilter, setJobStatusFilter] = useState<JobPosting['status'] | 'all'>('all');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesData, jobPostingsData, emailTemplatesData] = await Promise.all([
          candidatesApi.getAll(),
          jobPostingsApi.getAll(),
          emailTemplatesApi.getAll()
        ]);
        
        // バックエンドからのデータを適切な形式に変換
        const transformedCandidates = candidatesData.map(candidate => ({
          ...candidate,
          // 必要に応じて追加フィールドを設定
          appliedAt: candidate.appliedAt || candidate.appliedDate || new Date().toISOString(),
          updatedAt: candidate.updatedAt || new Date().toISOString()
        }));
        
        setCandidates(transformedCandidates);
        setJobPostings(jobPostingsData);
        setEmailTemplates(emailTemplatesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // APIエラーがあれば、認証切れの可能性もあるためログインページにリダイレクト
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logout]);

  const handleStatusChange = (id: string, status: CandidateStatus) => {
    candidatesApi.update(id, { status })
      .then(updatedCandidate => {
        // バックエンドのレスポンスを適切な形式に変換
        const transformedCandidate = {
          ...updatedCandidate,
          appliedAt: updatedCandidate.appliedAt || updatedCandidate.appliedDate || new Date().toISOString(),
          updatedAt: updatedCandidate.updatedAt || new Date().toISOString()
        };
        
        setCandidates(candidates.map(candidate =>
          candidate.id === id ? transformedCandidate : candidate
        ));
      })
      .catch(error => {
        console.error('Error updating candidate status:', error);
      });
  };

  const handleAddCandidate = (newCandidate: Omit<Candidate, 'id'>) => {
    // 必要なフィールドを追加
    const candidateToCreate = {
      ...newCandidate,
      emailHistory: [],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    candidatesApi.create(candidateToCreate)
      .then(candidate => {
        // バックエンドのレスポンスを適切な形式に変換
        const transformedCandidate = {
          ...candidate,
          appliedAt: candidate.appliedAt || candidate.appliedDate || new Date().toISOString(),
          updatedAt: candidate.updatedAt || new Date().toISOString()
        };
        
        setCandidates([transformedCandidate, ...candidates]);
      })
      .catch(error => {
        console.error('Error creating candidate:', error);
      });
  };

  const handleUpdateCandidate = (candidateId: string, updates: Partial<Candidate>) => {
    candidatesApi.update(candidateId, updates)
      .then(updatedCandidate => {
        // バックエンドのレスポンスを適切な形式に変換
        const transformedCandidate = {
          ...updatedCandidate,
          appliedAt: updatedCandidate.appliedAt || updatedCandidate.appliedDate || new Date().toISOString(),
          updatedAt: updatedCandidate.updatedAt || new Date().toISOString()
        };
        
        setCandidates(candidates.map(candidate =>
          candidate.id === candidateId ? transformedCandidate : candidate
        ));
      })
      .catch(error => {
        console.error('Error updating candidate:', error);
      });
  };

  const handleAddInterview = (candidateId: string, interview: Omit<Interview, 'id'>) => {
    // 新しいインタビューを作成する
    const newInterview = {
      ...interview,
      id: crypto.randomUUID()
    };
    
    // 候補者の面接リストを更新する
    setCandidates(candidates.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          interviews: [
            ...(candidate.interviews || []),
            newInterview
          ]
        };
      }
      return candidate;
    }));

    // 実際にはここでバックエンドAPIを呼び出す必要があります
    // TODO: バックエンドの面接作成APIを実装して連携する
  };

  const handleUpdateInterview = (candidateId: string, interviewId: string, updates: Partial<Interview>) => {
    // 面接データを更新する
    setCandidates(candidates.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          interviews: (candidate.interviews || []).map(interview =>
            interview.id === interviewId ? { ...interview, ...updates } : interview
          )
        };
      }
      return candidate;
    }));

    // 実際にはここでバックエンドAPIを呼び出す必要があります
    // TODO: バックエンドの面接更新APIを実装して連携する
    // interviewsApi.update(interviewId, { ...updates }) のように
  };

  const handleAddEvaluation = (candidateId: string, evaluation: Omit<Evaluation, 'id'>) => {
    // 評価を作成する
    const newEvaluation = {
      ...evaluation,
      id: crypto.randomUUID()
    };
    
    // 候補者の評価リストを更新する
    setCandidates(candidates.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          evaluations: [
            ...(candidate.evaluations || []),
            newEvaluation
          ]
        };
      }
      return candidate;
    }));

    // 実際にはここでバックエンドAPIを呼び出す必要があります
    // TODO: バックエンドの評価作成APIを実装して連携する
    // evaluationsApi.create({ ...evaluation, candidateId }) のように
  };

  const handleAddDocument = (candidateId: string, document: Omit<Document, 'id' | 'uploadDate'>) => {
    // ドキュメントを作成する
    const newDocument = {
      ...document,
      id: crypto.randomUUID(),
      uploadDate: new Date().toISOString()
    };
    
    // 候補者のドキュメントリストを更新する
    setCandidates(candidates.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          documents: [
            ...(candidate.documents || []),
            newDocument
          ]
        };
      }
      return candidate;
    }));

    // 実際にはここでバックエンドAPIを呼び出す必要があります
    // TODO: バックエンドのドキュメントアップロードAPIを実装して連携する
  };

  const handleAddJobPosting = (jobPosting: Omit<JobPosting, 'id'>) => {
    jobPostingsApi.create(jobPosting)
      .then(newJobPosting => {
        setJobPostings([newJobPosting, ...jobPostings]);
      })
      .catch(error => {
        console.error('Error creating job posting:', error);
      });
  };

  const handleUpdateJobPosting = (jobPosting: JobPosting) => {
    jobPostingsApi.update(jobPosting.id, jobPosting)
      .then(updatedJobPosting => {
        setJobPostings(jobPostings.map(jp =>
          jp.id === jobPosting.id ? updatedJobPosting : jp
        ));
      })
      .catch(error => {
        console.error('Error updating job posting:', error);
      });
  };

  const handleDeleteJobPosting = (jobPostingId: string) => {
    jobPostingsApi.delete(jobPostingId)
      .then(() => {
        setJobPostings(jobPostings.filter(jp => jp.id !== jobPostingId));
      })
      .catch(error => {
        console.error('Error deleting job posting:', error);
      });
  };

  const handleAddEmailTemplate = (template: Omit<EmailTemplate, 'id'>) => {
    emailTemplatesApi.create(template)
      .then(newTemplate => {
        setEmailTemplates([...emailTemplates, newTemplate]);
      })
      .catch(error => {
        console.error('Error creating email template:', error);
      });
  };

  const handleEditEmailTemplate = (templateId: string, updates: Partial<EmailTemplate>) => {
    emailTemplatesApi.update(templateId, updates)
      .then(updatedTemplate => {
        setEmailTemplates(emailTemplates.map(template =>
          template.id === templateId ? updatedTemplate : template
        ));
      })
      .catch(error => {
        console.error('Error updating email template:', error);
      });
  };

  const handleDeleteEmailTemplate = (templateId: string) => {
    emailTemplatesApi.delete(templateId)
      .then(() => {
        setEmailTemplates(emailTemplates.filter(template => template.id !== templateId));
      })
      .catch(error => {
        console.error('Error deleting email template:', error);
      });
  };

  const tabItems = [
    {
      key: 'dashboard',
      label: 'ダッシュボード',
      children: (
        <Dashboard
          candidates={candidates}
          jobPostings={jobPostings}
        />
      )
    },
    {
      key: 'candidates',
      label: '候補者一覧',
      children: <CandidatesTab
        candidates={candidates}
        jobPostings={jobPostings}
        onStatusChange={handleStatusChange}
        onAddCandidate={() => setShowAddCandidateModal(true)}
        onUpdateCandidate={handleUpdateCandidate}
        onAddInterview={handleAddInterview}
        onUpdateInterview={handleUpdateInterview}
        onAddEvaluation={handleAddEvaluation}
        onAddDocument={handleAddDocument}
        searchValue={candidateSearch}
        onSearchChange={(value) => setCandidateSearch(value)}
        statusFilter={candidateStatusFilter}
        onStatusFilterChange={(value) => setCandidateStatusFilter(value)}
      />
    },
    {
      key: 'jobs',
      label: '求人一覧',
      children: (
        <div>
          <Space className="w-full mb-4" size="middle">
            <PermissionGuard
              action={PermissionAction.CREATE}
              resource={PermissionResource.JOB_POSTING}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedJobPosting(undefined);
                  setShowJobPostingModal(true);
                }}
              >
                求人を追加
              </Button>
            </PermissionGuard>
            <Input
              placeholder="求人を検索..."
              prefix={<SearchOutlined />}
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              value={jobStatusFilter}
              onChange={(value) => setJobStatusFilter(value)}
              placeholder="ステータス"
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全て' },
                { value: 'open', label: '公開中' },
                { value: 'closed', label: '終了' },
                { value: 'draft', label: '下書き' },
              ]}
              suffixIcon={<FilterOutlined />}
            />
          </Space>
          <JobPostingList
            jobPostings={jobPostings.filter(jp => {
              // フィルタリング
              const matchesSearch = jp.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                jp.department.toLowerCase().includes(jobSearch.toLowerCase());
              const matchesStatus = jobStatusFilter === 'all' || jp.status === jobStatusFilter;
              return matchesSearch && matchesStatus;
            })}
            onEdit={(jobPosting) => {
              setSelectedJobPosting(jobPosting);
              setShowJobPostingModal(true);
            }}
            onDelete={handleDeleteJobPosting}
          />
        </div>
      )
    },
    {
      key: 'templates',
      label: 'テンプレート',
      children: (
        <EmailTemplateList
          templates={emailTemplates}
          onAdd={handleAddEmailTemplate}
          onEdit={handleEditEmailTemplate}
          onDelete={handleDeleteEmailTemplate}
        />
      )
    },
    {
      key: 'users',
      label: 'ユーザー管理',
      children: (
        <iframe
          src="/users"
          style={{ width: '100%', height: '80vh', border: 'none' }}
          title="ユーザー管理"
        />
      )
    },
    {
      key: 'permissions',
      label: '権限管理',
      children: (
        <iframe
          src="/permissions"
          style={{ width: '100%', height: '80vh', border: 'none' }}
          title="権限管理"
        />
      )
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-6 flex items-center justify-between">
        <div className="flex items-center">
          <TeamOutlined className="text-2xl text-blue-600" />
          <Title level={4} style={{ margin: 0 }}>採用管理システム</Title>
        </div>
        <div>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </div>
      </Header>

      <Content className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="読み込み中..." spinning={true}>
              <div className="h-32 w-full" />
            </Spin>
          </div>
        ) : (
          <Tabs defaultActiveKey={initialTab} items={tabItems} />
        )}
      </Content>

      <AddCandidateModal
        isOpen={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        onSubmit={handleAddCandidate}
        jobPostings={jobPostings}
      />

      <JobPostingModal
        isOpen={showJobPostingModal}
        onClose={() => {
          setShowJobPostingModal(false);
          setSelectedJobPosting(undefined);
        }}
        onSubmit={selectedJobPosting 
          ? (updatedPosting) => handleUpdateJobPosting(updatedPosting as JobPosting)
          : handleAddJobPosting}
        initialValues={selectedJobPosting}
      />
    </Layout>
  );
}

export default App;