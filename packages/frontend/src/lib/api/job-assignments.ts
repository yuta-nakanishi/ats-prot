import { apiRequest } from './common';
import { AssignmentRole, User } from '@/types';

// API用のユーザー型（必要な情報のみ含む）
interface UserBasic {
  id: string;
  name: string;
  email: string;
  role?: string;
  jobTitle?: string;
}

// API用のジョブポスティング型（必要な情報のみ含む）
interface JobPostingBasic {
  id: string;
  title: string;
  status: string;
}

export interface JobAssignment {
  id: string;
  userId: string;
  jobPostingId: string;
  role: 'primary' | 'secondary' | 'viewer';
  notificationsEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserBasic;
  jobPosting?: JobPostingBasic;
}

export interface CreateJobAssignmentDto {
  userId: string;
  jobPostingId: string;
  role?: 'primary' | 'secondary' | 'viewer';
  notificationsEnabled?: boolean;
  notes?: string;
}

export interface UpdateJobAssignmentDto {
  role?: 'primary' | 'secondary' | 'viewer';
  notificationsEnabled?: boolean;
  notes?: string;
}

/**
 * 求人の担当者一覧を取得する
 */
export const getJobAssignmentsByJobPosting = async (jobPostingId: string): Promise<JobAssignment[]> => {
  return apiRequest<JobAssignment[]>(`/job-assignments?jobPostingId=${jobPostingId}`, 'GET');
};

/**
 * ユーザーが担当する求人一覧を取得する
 */
export const getJobAssignmentsByUser = async (userId: string): Promise<JobAssignment[]> => {
  return apiRequest<JobAssignment[]>(`/job-assignments?userId=${userId}`, 'GET');
};

/**
 * 求人に担当者を追加する
 */
export const createJobAssignment = async (data: CreateJobAssignmentDto): Promise<JobAssignment> => {
  return apiRequest<JobAssignment>('/job-assignments', 'POST', data);
};

/**
 * 担当者情報を更新する
 */
export const updateJobAssignment = async (id: string, data: UpdateJobAssignmentDto): Promise<JobAssignment> => {
  return apiRequest<JobAssignment>(`/job-assignments/${id}`, 'PUT', data);
};

/**
 * 担当者割り当てを削除する
 */
export const deleteJobAssignment = async (id: string): Promise<void> => {
  await apiRequest(`/job-assignments/${id}`, 'DELETE');
}; 