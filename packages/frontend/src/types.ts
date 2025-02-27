// 候補者の状態
export type CandidateStatus = 'new' | 'screening' | 'interview' | 'technical' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
export type CandidateSource = 'company_website' | 'indeed' | 'linkedin' | 'referral' | 'agency' | 'job_fair' | 'other';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  status: CandidateStatus;
  experience?: number;
  skills?: string[];
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  interviews?: Interview[];
  evaluations?: Evaluation[];
  expectedSalary?: string;
  currentCompany?: string;
  source: CandidateSource;
  location?: string;
  birthDate?: string;
  availableFrom?: string;
  education?: string;
  urls?: {
    website?: string;
    linkedin?: string;
    github?: string;
  };
  resumeFileName?: string;
  resumeFilePath?: string;
  rating?: number;
  jobId?: string;
  jobPosting?: JobPosting;
}

// 企業（テナント）の型定義
export interface Company {
  id: string;
  name: string;
  tenantId: string;
  description?: string;
  industry?: string;
  employeeCount?: number;
  website?: string;
  createdAt: string;
  updatedAt: string;
  users?: User[];
}

// ユーザー型定義
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  departmentId?: string;
  teamId?: string;
  jobTitle?: string;
  phoneNumber?: string;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ユーザーロール
export enum UserRole {
  COMPANY_ADMIN = 'company_admin',
  HIRING_MANAGER = 'hiring_manager',
  RECRUITER = 'recruiter',
  INTERVIEWER = 'interviewer',
  READONLY = 'readonly',
}

export interface Interview {
  id: string;
  type: 'initial' | 'technical' | 'cultural' | 'final';
  date: string;
  time: string;
  interviewer: string;
  location: 'online' | 'office';
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
}

export interface Evaluation {
  id: string;
  evaluator: string;
  date: string;
  criteria: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    teamwork: number;
    culture: number;
  };
  comments: string;
}

export interface Document {
  id: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certification';
  name: string;
  url: string;
  uploadDate: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  status: 'open' | 'closed' | 'draft';
  description: string;
  requirements: string[];
  preferredSkills: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  postedDate: string;
  closingDate?: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  sentDate: string;
  sender: string;
  recipient: string;
  type: 'interview_invitation' | 'offer' | 'rejection' | 'general';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'interview_invitation' | 'offer' | 'rejection' | 'general';
  variables: string[];
}

export interface LoginResponse {
  token: string;
}

// Email templates
export const initialEmailTemplates: EmailTemplate[] = [
  {
    id: 'template1',
    name: '一次面接案内',
    subject: '【{{company}}】一次面接のご案内',
    body: `{{candidate_name}} 様

この度は{{company}}にご応募いただき、誠にありがとうございます。

一次面接の日程について、ご案内させていただきます。

日時：{{interview_date}} {{interview_time}}
場所：{{interview_location}}
面接官：{{interviewer}}

{{additional_info}}

ご都合が合わない場合は、お手数ですが別の日程をご提案ください。

よろしくお願いいたします。

{{sender_name}}
{{company}}`,
    type: 'interview_invitation',
    variables: ['company', 'candidate_name', 'interview_date', 'interview_time', 'interview_location', 'interviewer', 'additional_info', 'sender_name']
  },
  {
    id: 'template2',
    name: '内定通知',
    subject: '【{{company}}】内定のご案内',
    body: `{{candidate_name}} 様

この度は{{company}}の採用選考にご参加いただき、誠にありがとうございます。

厳正なる選考の結果、{{role}}職として内定を差し上げたく、ご連絡させていただきました。

詳細な条件等につきましては、改めてご案内させていただきます。

何かご不明な点がございましたら、お気軽にご連絡ください。

{{sender_name}}
{{company}}`,
    type: 'offer',
    variables: ['company', 'candidate_name', 'role', 'sender_name']
  }
];

// Mock data for development
export const mockJobPostings: JobPosting[] = [
  {
    id: 'job1',
    title: 'シニアフロントエンドエンジニア',
    department: '開発部',
    location: '東京',
    employmentType: 'full-time',
    status: 'open',
    description: 'モダンなWebアプリケーションの開発をリードする経験豊富なフロントエンドエンジニアを募集しています。',
    requirements: [
      '5年以上のフロントエンド開発経験',
      'React/TypeScriptでの開発経験',
      'チームリーディング経験'
    ],
    preferredSkills: [
      'Next.js',
      'GraphQL',
      'CI/CD',
      'AWS'
    ],
    salaryRange: {
      min: 6000000,
      max: 10000000
    },
    postedDate: '2024-02-01'
  }
];

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: '山田 太郎',
    email: 'taro.yamada@example.com',
    position: 'フロントエンドエンジニア',
    status: 'screening',
    experience: 5,
    skills: ['React', 'TypeScript', 'Node.js'],
    appliedAt: '2024-03-15',
    updatedAt: '2024-03-20',
    notes: '',
    source: 'referral',
    location: '東京',
    expectedSalary: '700万円',
    currentCompany: '株式会社テック',
    jobId: 'job1',
    rating: 4,
    interviews: [
      {
        id: 'i1',
        type: 'initial',
        date: '2024-03-20',
        time: '14:00',
        interviewer: '鈴木 部長',
        location: 'online',
        status: 'scheduled'
      }
    ],
    evaluations: [],
    urls: {
      linkedin: 'https://linkedin.com/in/taro-yamada',
      github: 'https://github.com/taro-yamada'
    }
  }
];