"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, ApiError } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales' | 'Sanction' | 'Disbursement' | 'Collection' | 'Borrower';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearError = () => setError(null);

  // Validate active token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('creditsea_lms_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            // Token invalid or expired
            logout();
          }
        } catch (err) {
          console.error('Session refresh failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Handle automatic routing adjustments on auth changes
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === '/login' || pathname === '/signup';
    const isBorrowerRoute = pathname.startsWith('/borrower');
    const isDashboardRoute = pathname.startsWith('/dashboard');

    if (!user) {
      // Unauthenticated users are redirected to login if hitting protected pages
      if (isBorrowerRoute || isDashboardRoute) {
        router.replace('/login');
      }
    } else {
      // Authenticated users are redirected away from login/signup screens
      if (isAuthRoute) {
        if (user.role === 'Borrower') {
          router.replace('/borrower');
        } else {
          router.replace('/dashboard');
        }
      }
      
      // Role protection redirects
      if (user.role === 'Borrower' && isDashboardRoute) {
        router.replace('/borrower');
      }
      
      if (user.role !== 'Borrower' && isBorrowerRoute && user.role !== 'Admin') {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  // Log in
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('creditsea_lms_token', res.token);
        setToken(res.token);
        setUser(res.user);
        
        if (res.user.role === 'Borrower') {
          router.push('/borrower');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up
  const register = async (name: string, email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.success && res.token) {
        localStorage.setItem('creditsea_lms_token', res.token);
        setToken(res.token);
        setUser(res.user);
        router.push('/borrower');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Log out
  const logout = () => {
    localStorage.removeItem('creditsea_lms_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
