import React, { useState } from 'react';
import { Card, Tag, Button, Space, Typography, Descriptions, Select, Rate, List } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  BankOutlined,
  CalendarOutlined,
  EditOutlined,
  PlusOutlined,
  FileOutlined,
  UploadOutlined,
  SendOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Candidate, Interview, Evaluation, Document, EmailMessage, JobPosting } from '../types';
import { AddInterviewModal } from './AddInterviewModal';
import { EditCandidateModal } from './EditCandidateModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { EvaluationModal } from './EvaluationModal';
import { EmailModal } from './EmailModal';

const { Text, Title } = Typography;

interface Props {
  candidate: Candidate;
  jobPostings: JobPosting[];
  onStatusChange: (id: string, status: Candidate['status']) => void;
  onAddInterview: (candidateId: string, interview: Omit<Interview, 'id' | 'status' | 'feedback'>) => void;
  onUpdateInterview: (candidateId: string, interviewId: string, updates: Partial<Interview>) => void;
  onAddEvaluation: (candidateId: string, evaluation: Omit<Evaluation, 'id'>) => void;
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
  onAddDocument: (candidateId: string, document: Omit<Document, 'id' | 'uploadDate'>) => void;
  onBack: () => void;
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

const InterviewItem: React.FC<{
  interview: Interview;
  onEvaluate: (interviewId: string) => void;
}> = ({ interview, onEvaluate }) => {
  const getInterviewTypeLabel = (type: Interview['type']) => {
    switch (type) {
      case 'initial': return '一次面接';
      case 'technical': return '技術面接';
      case 'cultural': return 'カルチャー面接';
      case 'final': return '最終面接';
    }
  };

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <Space direction="vertical" className="w-full">
        <Space>
          <Text strong>{getInterviewTypeLabel(interview.type)}</Text>
          <Tag color={
            interview.status === 'scheduled' ? 'processing' :
            interview.status === 'completed' ? 'success' : 'error'
          }>
            {interview.status === 'scheduled' ? '予定' :
             interview.status === 'completed' ? '完了' : 'キャンセル'}
          </Tag>
          {interview.status === 'scheduled' && (
            <Button
              type="link"
              size="small"
              onClick={() => onEvaluate(interview.id)}
            >
              評価を入力
            </Button>
          )}
        </Space>
        <Space direction="vertical" className="ml-4">
          <Text type="secondary">
            <CalendarOutlined /> {formatDate(interview.date)} {interview.time}
          </Text>
          <Text type="secondary">
            <UserOutlined /> {interview.interviewer}
          </Text>
          {interview.feedback && (
            <Text>{interview.feedback}</Text>
          )}
        </Space>
      </Space>
    </div>
  );
};

const EvaluationSection: React.FC<{ evaluation: Evaluation }> = ({ evaluation }) => (
  <Card size="small" className="mb-4">
    <Space direction="vertical" className="w-full">
      <Space>
        <Text strong>{evaluation.evaluator}</Text>
        <Text type="secondary">{formatDate(evaluation.date)}</Text>
      </Space>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="技術力">
          <Rate disabled defaultValue={evaluation.technicalSkills} />
        </Descriptions.Item>
        <Descriptions.Item label="コミュニケーション">
          <Rate disabled defaultValue={evaluation.communication} />
        </Descriptions.Item>
        <Descriptions.Item label="問題解決力">
          <Rate disabled defaultValue={evaluation.problemSolving} />
        </Descriptions.Item>
        <Descriptions.Item label="チームワーク">
          <Rate disabled defaultValue={evaluation.teamwork} />
        </Descriptions.Item>
        <Descriptions.Item label="文化適合性">
          <Rate disabled defaultValue={evaluation.culture} />
        </Descriptions.Item>
      </Descriptions>
      {evaluation.comments && (
        <Text>{evaluation.comments}</Text>
      )}
    </Space>
  </Card>
);

export const CandidateDetail: React.FC<Props> = ({
  candidate,
  jobPostings,
  onStatusChange,
  onAddInterview,
  onUpdateInterview,
  onAddEvaluation,
  onUpdateCandidate,
  onAddDocument,
  onBack
}) => {
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>('');
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>('');

  const jobPosting = candidate.jobPosting || jobPostings.find(job => job.id === candidate.jobPostingId);
  const emailHistory = candidate.emailHistory || [];
  const interviews = candidate.interviews || [];
  const evaluations = candidate.evaluations || [];
  const documents = candidate.documents || [];

  const handleEvaluationSubmit = (evaluation: Omit<Evaluation, 'id'>) => {
    onAddEvaluation(candidate.id, evaluation);
    onUpdateInterview(candidate.id, selectedInterviewId, { status: 'completed' });
    setShowEvaluationModal(false);
  };

  const handleSendEmail = (email: Omit<EmailMessage, 'id' | 'sentDate'>) => {
    const newEmail: EmailMessage = {
      ...email,
      id: crypto.randomUUID(),
      sentDate: new Date().toISOString()
    };
    
    onUpdateCandidate(candidate.id, {
      emailHistory: [...emailHistory, newEmail]
    });
  };

  const handleEvaluate = (interviewId: string) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (interview) {
      setSelectedInterviewId(interviewId);
      setSelectedInterviewer(interview.interviewer);
      setShowEvaluationModal(true);
    }
  };

  return (
    <div className="space-y-4">
      <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
        一覧に戻る
      </Button>

      <Card
        title={
          <Space>
            <Title level={5} style={{ margin: 0 }}>{candidate.name}</Title>
            <Tag color={statusColors[candidate.status]}>{statusLabels[candidate.status]}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<SendOutlined />}
              onClick={() => setShowEmailModal(true)}
            >
              メール送信
            </Button>
            <Select
              value={candidate.status}
              onChange={(value) => onStatusChange(candidate.id, value)}
              style={{ width: 120 }}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
            <Button
              icon={<EditOutlined />}
              onClick={() => setShowEditModal(true)}
            />
          </Space>
        }
      >
        <Space direction="vertical" className="w-full">
          <Descriptions column={{ xs: 1, sm: 2, md: 4 }}>
            <Descriptions.Item label={<><MailOutlined /> メール</>}>
              {candidate.email}
            </Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined /> 役職</>}>
              {candidate.role}
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> 応募日</>}>
              {formatDate(candidate.appliedDate)}
            </Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined /> 勤務地</>}>
              {candidate.location}
            </Descriptions.Item>
            <Descriptions.Item label={<><BankOutlined /> 応募経路</>}>
              {candidate.source}
            </Descriptions.Item>
            {candidate.expectedSalary && (
              <Descriptions.Item label={<><DollarOutlined /> 希望年収</>}>
                {(candidate.expectedSalary / 10000).toFixed(0)}万円
                {candidate.currentSalary && ` (現在: ${(candidate.currentSalary / 10000).toFixed(0)}万円)`}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div>
            {candidate.skills.map((skill) => (
              <Tag key={skill} className="mr-2 mb-2">{skill}</Tag>
            ))}
          </div>

          <Space wrap>
            {documents.map((doc) => (
              <Button
                key={doc.id}
                type="link"
                icon={<FileOutlined />}
                href={doc.url}
                target="_blank"
              >
                {doc.name}
              </Button>
            ))}
            <Button
              icon={<UploadOutlined />}
              onClick={() => setShowDocumentModal(true)}
            >
              書類を追加
            </Button>
          </Space>

          <Space direction="vertical" className="w-full mt-8">
            {jobPosting && (
              <div>
                <Title level={5}>応募求人</Title>
                <Card size="small" className="w-full">
                  <Space direction="vertical">
                    <Text strong>{jobPosting.title}</Text>
                    <Text type="secondary">{jobPosting.department} - {jobPosting.location}</Text>
                    <Text>{jobPosting.description}</Text>
                    <div>
                      <Text type="secondary">必須要件:</Text>
                      <ul className="list-disc list-inside mt-2">
                        {jobPosting.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Text type="secondary">歓迎スキル:</Text>
                      <div className="mt-2">
                        {jobPosting.preferredSkills.map((skill) => (
                          <Tag key={skill} className="mr-2 mb-2">{skill}</Tag>
                        ))}
                      </div>
                    </div>
                  </Space>
                </Card>
              </div>
            )}

            {interviews.length > 0 && (
              <div>
                <Title level={5}>面接スケジュール</Title>
                {interviews.map((interview) => (
                  <InterviewItem
                    key={interview.id}
                    interview={interview}
                    onEvaluate={handleEvaluate}
                  />
                ))}
              </div>
            )}

            {evaluations.length > 0 && (
              <div>
                <Title level={5}>評価</Title>
                {evaluations.map((evaluation) => (
                  <EvaluationSection key={evaluation.id} evaluation={evaluation} />
                ))}
              </div>
            )}

            {emailHistory.length > 0 && (
              <div>
                <Title level={5}>メール履歴</Title>
                <List
                  dataSource={emailHistory.sort((a, b) => 
                    new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()
                  )}
                  renderItem={(email) => (
                    <List.Item>
                      <Space direction="vertical" className="w-full">
                        <Space className="w-full justify-between">
                          <Text strong>{email.subject}</Text>
                          <Text type="secondary">{formatDate(email.sentDate)}</Text>
                        </Space>
                        <Text>{email.body.length > 100 ? `${email.body.slice(0, 100)}...` : email.body}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {candidate.notes && (
              <div>
                <Title level={5}>メモ</Title>
                <Text>{candidate.notes}</Text>
              </div>
            )}
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowInterviewModal(true)}
          >
            面接を追加
          </Button>
        </Space>
      </Card>

      <AddInterviewModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSubmit={(interview) => onAddInterview(candidate.id, interview)}
        candidateName={candidate.name}
      />

      <EditCandidateModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={onUpdateCandidate}
        candidate={candidate}
        jobPostings={jobPostings}
      />

      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onSubmit={(document) => onAddDocument(candidate.id, document)}
      />

      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        onSubmit={handleEvaluationSubmit}
        interviewId={selectedInterviewId}
        interviewer={selectedInterviewer}
      />

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleSendEmail}
        recipientEmail={candidate.email}
        recipientName={candidate.name}
      />
    </div>
  );
};