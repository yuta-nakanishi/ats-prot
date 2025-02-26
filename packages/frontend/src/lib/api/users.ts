import { User, UserRole } from '../../types';

// APIベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateUserDto {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  companyId: string;
  departmentId?: string;
  teamId?: string;
  jobTitle?: string;
  phoneNumber?: string;
  isCompanyAdmin?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  departmentId?: string | null;
  teamId?: string | null;
  jobTitle?: string;
  phoneNumber?: string;
  isCompanyAdmin?: boolean;
  isActive?: boolean;
}

/**
 * 会社に所属するユーザー一覧を取得する
 */
export const getCompanyUsers = async (companyId: string): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/users`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('ユーザー一覧の取得に失敗しました');
  }

  return response.json();
};

/**
 * ユーザー情報を取得する
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`ユーザーID ${userId} の取得に失敗しました`);
  }

  return response.json();
};

/**
 * 新規ユーザーを作成する
 */
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'ユーザー作成に失敗しました');
  }

  return response.json();
};

/**
 * ユーザー情報を更新する
 */
export const updateUser = async (userId: string, data: UpdateUserDto): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('ユーザー情報の更新に失敗しました');
  }

  return response.json();
};

/**
 * ユーザーを削除（無効化）する
 */
export const deactivateUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('ユーザーの無効化に失敗しました');
  }
};

/**
 * ユーザーを再有効化する
 */
export const activateUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('ユーザーの有効化に失敗しました');
  }
}; 