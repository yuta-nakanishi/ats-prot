import { destroyCookie } from 'nookies';

/**
 * クライアント側の認証情報を完全にクリアする
 * ログアウト処理やセッションのリセットに使用する
 */
export function clearAuthState() {
  try {
    // 1. ローカルストレージからの削除
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 2. Cookie削除（複数の方法で確実に削除）
      destroyCookie(null, 'token', { path: '/' });
      document.cookie = 'token=; Max-Age=-99999999; path=/;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      
      // ドメイン指定の削除も追加
      const domain = window.location.hostname;
      document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      
      // サブドメインも対応
      if (domain.indexOf('.') !== -1) {
        const rootDomain = domain.split('.').slice(-2).join('.');
        document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${rootDomain}`;
      }
      
      // 3. セッションストレージのクリア
      sessionStorage.clear();
    }
    
    return true;
  } catch (error) {
    console.error('[Auth] 認証状態のクリアに失敗:', error);
    return false;
  }
}

/**
 * 認証トークンの存在確認
 * @returns boolean トークンが存在するかどうか
 */
export function hasAuthToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // ローカルストレージのトークンを確認
  const token = localStorage.getItem('token');
  
  // Cookieのトークンも確認
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  
  return !!(token || tokenCookie);
}

/**
 * ログイン状態の判定
 * @returns boolean ログイン状態かどうか
 */
export function isAuthenticated(): boolean {
  return hasAuthToken();
} 