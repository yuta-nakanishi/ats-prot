import { User, UserRole } from '../../types';
import { apiRequest } from './common';

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
 * 企業に所属するユーザー一覧を取得する
 * @param companyId 企業ID
 * @returns ユーザー配列
 */
export const getCompanyUsers = async (companyId: string): Promise<User[]> => {
  try {
    const data = await apiRequest<User[]>(`/companies/${companyId}/users`, 'GET');
    return data;
  } catch (error) {
    console.error('企業ユーザー一覧取得エラー:', error);
    throw error;
  }
};

/**
 * ユーザー詳細を取得する
 * @param userId ユーザーID
 * @returns ユーザー情報
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const data = await apiRequest<User>(`/users/${userId}`, 'GET');
    return data;
  } catch (error) {
    console.error('ユーザー詳細取得エラー:', error);
    throw error;
  }
};

/**
 * ユーザーを作成する
 * @param userData ユーザーデータ
 * @returns 作成されたユーザー情報
 */
export const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const data = await apiRequest<User>('/users', 'POST', userData);
    return data;
  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    throw error;
  }
};

/**
 * 企業に所属するユーザーを作成する
 * @param companyId 企業ID
 * @param userData ユーザーデータ
 * @returns 作成されたユーザー情報
 */
export const createCompanyUser = async (companyId: string, userData: Partial<User>): Promise<User> => {
  try {
    const data = await apiRequest<User>(`/companies/${companyId}/users`, 'POST', userData);
    return data;
  } catch (error) {
    console.error('企業ユーザー作成エラー:', error);
    throw error;
  }
};

/**
 * ユーザー情報を更新する
 * @param userId ユーザーID
 * @param userData 更新するユーザーデータ
 * @returns 更新されたユーザー情報
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  try {
    const data = await apiRequest<User>(`/users/${userId}`, 'PUT', userData);
    return data;
  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    throw error;
  }
};

/**
 * ユーザーを削除する
 * @param userId ユーザーID
 * @returns 成功した場合はtrue
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await apiRequest(`/users/${userId}`, 'DELETE');
    return true;
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    throw error;
  }
};

/**
 * ユーザーのパスワードを変更する
 * @param userId ユーザーID
 * @param currentPassword 現在のパスワード
 * @param newPassword 新しいパスワード
 * @returns 成功した場合はtrue
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    await apiRequest(`/users/${userId}/change-password`, 'POST', {
      currentPassword,
      newPassword,
    });
    return true;
  } catch (error) {
    console.error('パスワード変更エラー:', error);
    throw error;
  }
};

/**
 * ユーザーを無効化（ソフト削除）する
 * @param userId ユーザーID
 * @returns 更新されたユーザー情報
 */
export const deactivateUser = async (userId: string): Promise<User> => {
  try {
    const data = await apiRequest<User>(`/users/${userId}/deactivate`, 'POST');
    return data;
  } catch (error) {
    console.error('ユーザー無効化エラー:', error);
    throw error;
  }
};

/**
 * ユーザーを再有効化する
 * @param userId ユーザーID
 * @returns 更新されたユーザー情報
 */
export const activateUser = async (userId: string): Promise<User> => {
  try {
    const data = await apiRequest<User>(`/users/${userId}/activate`, 'POST');
    return data;
  } catch (error) {
    console.error('ユーザー有効化エラー:', error);
    throw error;
  }
}; 