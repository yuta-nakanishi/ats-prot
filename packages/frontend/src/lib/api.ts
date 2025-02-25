import axios from 'axios';
import type { JobPosting, Candidate, Interview, Evaluation, LoginResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエスト前にトークンをヘッダーに追加するインターセプター
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 認証関連のAPI
export const authApi = {
  login: async (data: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  register: async (data: { email: string; password: string; name: string }): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    // サーバーサイドでのログアウト処理があれば呼び出し
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('ログアウトAPI呼び出しエラー:', error);
    }
    // ローカルのトークンを削除
    localStorage.removeItem('token');
  }
};

// 求人関連のAPI
export const jobPostingsApi = {
  getAll: async (status?: string): Promise<JobPosting[]> => {
    const response = await api.get('/job-postings', { params: { status } });
    return response.data;
  },
  getOne: async (id: string): Promise<JobPosting> => {
    const response = await api.get(`/job-postings/${id}`);
    return response.data;
  },
  create: async (data: Omit<JobPosting, 'id'>): Promise<JobPosting> => {
    const response = await api.post('/job-postings', data);
    return response.data;
  },
  update: async (id: string, data: Partial<JobPosting>): Promise<JobPosting> => {
    const response = await api.put(`/job-postings/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/job-postings/${id}`);
  },
};

// 候補者関連のAPI
export const candidatesApi = {
  getAll: async (status?: string): Promise<Candidate[]> => {
    const response = await api.get('/candidates', {
      params: { status },
      withCredentials: true
    });
    return response.data;
  },
  getOne: async (id: string): Promise<Candidate> => {
    const response = await api.get(`/candidates/${id}`, {
      withCredentials: true
    });
    return response.data;
  },
  create: async (data: Omit<Candidate, 'id'>): Promise<Candidate> => {
    const response = await api.post('/candidates', data, {
      withCredentials: true
    });
    return response.data;
  },
  update: async (id: string, data: Partial<Candidate>): Promise<Candidate> => {
    const response = await api.put(`/candidates/${id}`, data, {
      withCredentials: true
    });
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/candidates/${id}`);
  },
};

// 面接関連のAPI
export const interviewsApi = {
  getByCandidateId: async (candidateId: string): Promise<Interview[]> => {
    const response = await api.get(`/interviews/candidate/${candidateId}`);
    return response.data;
  },
  create: async (data: Omit<Interview, 'id'>): Promise<Interview> => {
    const response = await api.post('/interviews', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Interview>): Promise<Interview> => {
    const response = await api.put(`/interviews/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/interviews/${id}`);
  },
};

// 評価関連のAPI
export const evaluationsApi = {
  getByCandidateId: async (candidateId: string): Promise<Evaluation[]> => {
    const response = await api.get(`/evaluations/candidate/${candidateId}`);
    return response.data;
  },
  create: async (data: Omit<Evaluation, 'id'>): Promise<Evaluation> => {
    const response = await api.post('/evaluations', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Evaluation>): Promise<Evaluation> => {
    const response = await api.put(`/evaluations/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/evaluations/${id}`);
  },
};