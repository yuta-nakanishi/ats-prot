'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { parseCookies, setCookie } from 'nookies';

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
    
    if (token && !cookieToken) {
      // ローカルストレージにはあるがクッキーにない場合、クッキーに設定
      setCookie(null, 'token', token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
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
      localStorage.setItem('token', response.token);
      
      // クライアント側でもクッキーに保存(ミドルウェア用)
      setCookie(null, 'token', response.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      
      setIsAuthenticated(true);
      
      // ダッシュボードへのリダイレクトを少し遅延させる
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name });
      localStorage.setItem('token', response.token);
      
      // クライアント側でもクッキーに保存(ミドルウェア用)
      setCookie(null, 'token', response.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      
      setIsAuthenticated(true);
      
      // ダッシュボードへのリダイレクトを少し遅延させる
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authApi.logout()
      .then(() => {
        localStorage.removeItem('token');
        // クッキーからも削除
        setCookie(null, 'token', '', {
          maxAge: -1,
          path: '/',
        });
        setIsAuthenticated(false);
        router.push('/login');
      })
      .catch(error => {
        console.error('Logout error:', error);
        // エラーが発生しても、ローカルの認証状態はクリアする
        localStorage.removeItem('token');
        // クッキーからも削除
        setCookie(null, 'token', '', {
          maxAge: -1,
          path: '/',
        });
        setIsAuthenticated(false);
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