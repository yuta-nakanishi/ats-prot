/**
 * API基本URL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * CSRFトークンをリクエストヘッダに含める
 */
const getCSRFToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const tokenElement = document.querySelector('meta[name="csrf-token"]');
  return tokenElement ? (tokenElement as HTMLMetaElement).content : null;
};

/**
 * ブラウザ環境かどうかを判定
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * 認証トークンを取得する
 */
export const getAuthToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem('token');
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 共通APIリクエスト関数
 * @param endpoint APIエンドポイント
 * @param method HTTPメソッド
 * @param data リクエストデータ（オプション）
 * @returns レスポンスデータ
 */
export async function apiRequest<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  data?: any
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 認証トークンがあれば追加
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // CSRFトークンがあれば追加
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  // URLがhttpまたはhttpsで始まらない場合、ベースURLを追加
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  // GETメソッド以外でデータがある場合はリクエストボディに追加
  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // レスポンスがJSONでない場合
    if (!response.headers.get('content-type')?.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`APIリクエスト失敗: ${response.status} ${response.statusText}`);
      }
      return {} as T;
    }

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.message || `APIリクエスト失敗: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('APIリクエストエラー:', error);
    throw error;
  }
} 