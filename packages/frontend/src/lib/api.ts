import axios from 'axios';
import type { LoginResponse } from '../types';
import type { 
  JobPosting, 
  Candidate, 
  Interview, 
  Evaluation, 
  Permission,
  CustomRole,
  CustomRoleWithPermissions,
  CreateCustomRoleDto,
  UpdateCustomRoleDto,
  AssignCustomRoleDto,
  UserWithRoles,
  ResourcePermission,
  CreateResourcePermissionDto,
  PermissionAction,
  PermissionResource
} from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
    const response = await api.post('/auth/login', data, {
      withCredentials: true
    });
    return response.data;
  },
  register: async (data: { email: string; password: string; name: string }): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', data, {
      withCredentials: true
    });
    return response.data;
  },
  logout: async (): Promise<void> => {
    // サーバーサイドでのログアウト処理があれば呼び出し
    try {
      await api.post('/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('ログアウトAPI呼び出しエラー:', error);
    }
    // ローカルのトークンを削除
    localStorage.removeItem('token');
  },
  // 全ユーザー情報を取得
  getAllUsers: async (): Promise<UserWithRoles[]> => {
    try {
      const response = await api.get<UserWithRoles[]>('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  // 特定のユーザー情報を取得
  getUserById: async (userId: string): Promise<UserWithRoles> => {
    try {
      const response = await api.get<UserWithRoles>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
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

// 権限関連のAPI
export const permissionsApi = {
  // 全ての権限を取得
  getAllPermissions: async () => {
    try {
      const response = await api.get<Permission[]>('/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },

  // カスタムロール関連
  getCompanyCustomRoles: async () => {
    try {
      const response = await api.get<CustomRole[]>('/custom-roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching custom roles:', error);
      throw error;
    }
  },

  getCustomRoleById: async (id: string) => {
    try {
      const response = await api.get<CustomRoleWithPermissions>(`/custom-roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching custom role ${id}:`, error);
      throw error;
    }
  },

  createCustomRole: async (data: CreateCustomRoleDto) => {
    try {
      const response = await api.post<CustomRole>('/custom-roles', data);
      return response.data;
    } catch (error) {
      console.error('Error creating custom role:', error);
      throw error;
    }
  },

  updateCustomRole: async (id: string, data: UpdateCustomRoleDto) => {
    try {
      const response = await api.patch<CustomRole>(`/custom-roles/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating custom role ${id}:`, error);
      throw error;
    }
  },

  deleteCustomRole: async (id: string) => {
    try {
      await api.delete(`/custom-roles/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting custom role ${id}:`, error);
      throw error;
    }
  },

  // ユーザーにカスタムロールを割り当て
  assignCustomRoleToUser: async (data: AssignCustomRoleDto) => {
    try {
      const response = await api.post('/custom-roles/assign', data);
      return response.data;
    } catch (error: any) {
      console.error('Error assigning custom role to user:', error);
      if (error.response && error.response.status === 403) {
        console.error('アクセス権限がありません。ユーザーに必要な権限（ユーザー管理権限）が付与されているか確認してください。');
        throw new Error('アクセス権限がありません。ユーザー管理権限が必要です。');
      }
      throw error;
    }
  },

  // ユーザーからカスタムロールを削除
  removeCustomRoleFromUser: async (data: AssignCustomRoleDto) => {
    try {
      const response = await api.post('/custom-roles/unassign', data);
      return response.data;
    } catch (error) {
      console.error('Error removing custom role from user:', error);
      throw error;
    }
  },

  // ユーザーとそのロール情報を取得
  getUserWithRoles: async (userId: string) => {
    try {
      const response = await api.get<UserWithRoles>(`/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user roles for ${userId}:`, error);
      throw error;
    }
  },

  // リソース権限関連
  getResourcePermissions: async (userId: string) => {
    try {
      const response = await api.get<ResourcePermission[]>(`/resource-permissions?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resource permissions for user ${userId}:`, error);
      throw error;
    }
  },

  createResourcePermission: async (data: CreateResourcePermissionDto) => {
    try {
      const response = await api.post<ResourcePermission>('/resource-permissions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating resource permission:', error);
      throw error;
    }
  },

  deleteResourcePermission: async (id: string) => {
    try {
      await api.delete(`/resource-permissions/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting resource permission ${id}:`, error);
      throw error;
    }
  },

  // ユーザーの権限チェック
  checkPermission: async (action: PermissionAction, resource: PermissionResource) => {
    try {
      const response = await api.get<{ hasPermission: boolean }>
        (`/permissions/check?action=${action}&resource=${resource}`);
      return response.data.hasPermission;
    } catch (error) {
      console.error(`Error checking permission:`, error);
      throw error;
    }
  },

  // リソース特有の権限チェック
  checkResourcePermission: async (
    action: PermissionAction, 
    resourceType: string, 
    resourceId: string
  ) => {
    try {
      const response = await api.get<{ hasPermission: boolean }>
        (`/permissions/check-resource?action=${action}&resourceType=${resourceType}&resourceId=${resourceId}`);
      return response.data.hasPermission;
    } catch (error: any) {
      console.error(`Error checking resource permission:`, error);
      // 一時的な処理として、APIエンドポイントが存在しない場合やエラーが発生した場合でも
      // アプリケーションのクラッシュを防ぐためにfalseを返す
      return false;
    }
  },

  // カスタムロールに割り当てられたユーザーの取得
  getUsersByCustomRoleId: async (roleId: string) => {
    try {
      const response = await api.get<UserWithRoles[]>(`/custom-roles/${roleId}/users`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for custom role ${roleId}:`, error);
      throw error;
    }
  },

  // カスタムロールに割り当てられた権限の取得
  getPermissionsByCustomRoleId: async (roleId: string) => {
    try {
      const response = await api.get<Permission[]>(`/custom-roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching permissions for custom role ${roleId}:`, error);
      throw error;
    }
  },
};