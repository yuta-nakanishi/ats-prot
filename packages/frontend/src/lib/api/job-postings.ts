import { apiRequest } from './common';
import { JobPosting } from '@/types';

/**
 * 求人一覧を取得する
 */
export const getJobPostings = async (companyId?: string): Promise<JobPosting[]> => {
  const endpoint = companyId ? `/job-postings?companyId=${companyId}` : '/job-postings';
  return apiRequest<JobPosting[]>(endpoint, 'GET');
};

/**
 * 求人詳細を取得する
 */
export const getJobPostingById = async (id: string): Promise<JobPosting> => {
  return apiRequest<JobPosting>(`/job-postings/${id}`, 'GET');
};

/**
 * 新規求人を作成する
 */
export const createJobPosting = async (data: Partial<JobPosting>): Promise<JobPosting> => {
  return apiRequest<JobPosting>('/job-postings', 'POST', data);
};

/**
 * 求人情報を更新する
 */
export const updateJobPosting = async (id: string, data: Partial<JobPosting>): Promise<JobPosting> => {
  return apiRequest<JobPosting>(`/job-postings/${id}`, 'PUT', data);
};

/**
 * 求人を削除する
 */
export const deleteJobPosting = async (id: string): Promise<void> => {
  await apiRequest(`/job-postings/${id}`, 'DELETE');
};

/**
 * 求人を複製する
 */
export const duplicateJobPosting = async (id: string): Promise<JobPosting> => {
  return apiRequest<JobPosting>(`/job-postings/${id}/duplicate`, 'POST');
}; 