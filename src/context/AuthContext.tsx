import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../api';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseNameFromEmail(email: string) {
  return email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function decodeTokenRole(token: string): 'USER' | 'ADMIN' {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch {
    return 'USER';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('buildmore_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('buildmore_token')
  );

  const persistAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('buildmore_user', JSON.stringify(user));
    localStorage.setItem('buildmore_token', token);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.login({ email, password });
      const role = decodeTokenRole(res.token!);
      const newUser: User = { email, name: parseNameFromEmail(email), role };
      persistAuth(newUser, res.token!);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.signup({ name, email, password, phone });
      const role = decodeTokenRole(res.token!);
      const newUser: User = { email, name, role };
      persistAuth(newUser, res.token!);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed.' };
    }
  };

  const forgotPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authApi.forgotPassword({ email, password: newPassword });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('buildmore_user');
    localStorage.removeItem('buildmore_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN', login, signup, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
