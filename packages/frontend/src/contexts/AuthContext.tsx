'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { parseCookies, setCookie, destroyCookie } from 'nookies';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // トークンの存在チェック（ローカルストレージとクッキー両方をチェック）
    const token = localStorage.getItem('token');
    const cookies = parseCookies();
    const cookieToken = cookies.token;
    
    console.log('AuthContext init - token from localStorage:', !!token);
    console.log('AuthContext init - token from cookie:', !!cookieToken);
    
    if (token && !cookieToken) {
      // ローカルストレージにはあるがクッキーにない場合、クッキーに設定
      setCookie(null, 'token', token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
      });
    } else if (cookieToken && !token) {
      // クッキーにはあるがローカルストレージにない場合、ローカルストレージに設定
      localStorage.setItem('token', cookieToken);
    }
    
    setIsAuthenticated(!!(token || cookieToken));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      console.log('ログイン成功:', !!response.token);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // クライアント側でもクッキーに保存(ミドルウェア用)
        setCookie(null, 'token', response.token, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax',
        });
        
        setIsAuthenticated(true);
        
        // ダッシュボードへのリダイレクトを少し遅延させる
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        console.error('ログイン成功したがトークンがありません');
        throw new Error('認証トークンの取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      // エラーステータスコードに基づいたエラーメッセージを設定
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('アカウントが存在しないか、メールアドレスまたはパスワードが間違っています。');
        } else if (error.response.status === 403) {
          throw new Error('アカウントが無効化されています。管理者にお問い合わせください。');
        } else {
          throw new Error('ログイン処理中にエラーが発生しました。しばらく経ってからもう一度お試しください。');
        }
      } else {
        throw new Error('サーバーに接続できませんでした。インターネット接続を確認してください。');
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name });
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // クライアント側でもクッキーに保存(ミドルウェア用)
        setCookie(null, 'token', response.token, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax',
        });
        
        setIsAuthenticated(true);
        
        // ダッシュボードへのリダイレクトを少し遅延させる
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        throw new Error('認証トークンの取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      // エラーステータスコードに基づいたエラーメッセージを設定
      if (error.response) {
        if (error.response.status === 400) {
          throw new Error('入力情報に問題があります。正しい情報を入力してください。');
        } else if (error.response.status === 409) {
          throw new Error('このメールアドレスは既に登録されています。別のメールアドレスを使用してください。');
        } else {
          throw new Error('登録処理中にエラーが発生しました。しばらく経ってからもう一度お試しください。');
        }
      } else {
        throw new Error('サーバーに接続できませんでした。インターネット接続を確認してください。');
      }
    }
  };

  const logout = () => {
    console.log('ログアウト処理開始');
    authApi.logout()
      .then(() => {
        console.log('サーバーサイドログアウト成功');
      })
      .catch(error => {
        console.error('Logout API error:', error);
      })
      .finally(() => {
        // ローカルのトークンを削除
        localStorage.removeItem('token');
        
        // クッキーからも削除
        destroyCookie(null, 'token', { path: '/' });
        
        // Cookieを期限切れにする方法でも削除
        document.cookie = 'token=; Max-Age=-99999999; path=/;';
        
        setIsAuthenticated(false);
        console.log('ログアウト完了、ログイン画面へリダイレクト');
        router.push('/login');
      });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 