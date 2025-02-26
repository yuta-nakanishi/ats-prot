import { Company, User } from '../../types';

// テナント（企業）作成のためのDTO
export interface CreateTenantDto {
  name: string;
  tenantId?: string;
  description?: string;
  industry?: string;
  employeeCount?: number;
  website?: string;
  adminEmail?: string;
}

// テナント更新用DTO
export interface UpdateTenantDto {
  name?: string;
  description?: string;
  industry?: string;
  employeeCount?: number;
  website?: string;
}

// テナント作成のレスポンス
export interface CreateTenantResponse {
  company: Company;
  adminUser?: {
    id: string;
    email: string;
    name: string;
  };
  adminCreated: boolean;
  temporaryPassword?: string;
}

// APIベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// APIクライアント関数

/**
 * すべてのテナントを取得する
 */
export const getAllTenants = async (): Promise<Company[]> => {
  const response = await fetch(`${API_BASE_URL}/companies?include=users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('テナント一覧の取得に失敗しました');
  }

  const data = await response.json();
  console.log('テナントデータのレスポンス:', data); // APIレスポンスをログ出力
  return data;
};

/**
 * IDでテナントを取得する
 */
export const getTenantById = async (id: string): Promise<Company> => {
  const response = await fetch(`${API_BASE_URL}/companies/${id}?include=users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`テナントID ${id} の取得に失敗しました`);
  }

  const data = await response.json();
  console.log(`テナント詳細データのレスポンス(ID: ${id}):`, data); // APIレスポンスをログ出力
  return data;
};

/**
 * 新しいテナントを作成する
 */
export const createTenant = async (data: CreateTenantDto): Promise<CreateTenantResponse> => {
  const response = await fetch(`${API_BASE_URL}/companies/with-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'テナント作成に失敗しました');
  }

  return response.json();
};

/**
 * テナント情報を更新する
 */
export const updateTenant = async (id: string, data: UpdateTenantDto): Promise<Company> => {
  const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('テナント情報の更新に失敗しました');
  }

  return response.json();
};

/**
 * テナントを削除する
 */
export const deleteTenant = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('テナントの削除に失敗しました');
  }
};

/**
 * テナントのユーザー一覧を取得する
 */
export const getTenantUsers = async (companyId: string): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`テナントID ${companyId} のユーザー一覧の取得に失敗しました`);
  }

  return response.json();
}; 