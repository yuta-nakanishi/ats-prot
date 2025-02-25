// 求人関連の型定義
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

// 候補者関連の型定義
export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'new' | 'reviewing' | 'interviewed' | 'offered' | 'rejected';
  experience: number;
  skills: string[];
  appliedDate: string;
  notes: string;
  interviews: Interview[];
  evaluations: Evaluation[];
  expectedSalary?: number;
  currentSalary?: number;
  source: string;
  location: string;
  documents: Document[];
  jobPostingId: string;
  emailHistory: EmailMessage[];
}

// 面接関連の型定義
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

// 評価関連の型定義
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

// ドキュメント関連の型定義
export interface Document {
  id: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certification';
  name: string;
  url: string;
  uploadDate: string;
}

// メール関連の型定義
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

// 権限システム関連の型
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionResource {
  COMPANY = 'company',
  USER = 'user',
  DEPARTMENT = 'department',
  TEAM = 'team',
  JOB_POSTING = 'job_posting',
  CANDIDATE = 'candidate',
  INTERVIEW = 'interview',
  EVALUATION = 'evaluation',
  REPORT = 'report',
}

export interface Permission {
  id: string;
  name: string;
  action: PermissionAction;
  resource: PermissionResource;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomRoleWithPermissions extends CustomRole {
  permissions: Permission[];
}

export interface UserWithRoles {
  id: string;
  email: string;
  name: string;
  role: string;
  customRoles: CustomRole[];
}

export interface ResourcePermission {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  action: PermissionAction;
  isGranted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomRoleDto {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateCustomRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface AssignCustomRoleDto {
  userId: string;
  customRoleId: string;
}

export interface CreateResourcePermissionDto {
  userId: string;
  resourceType: string;
  resourceId: string;
  action: PermissionAction;
  isGranted: boolean;
}