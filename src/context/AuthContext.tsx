import React, { createContext, useContext, useState } from 'react';
import { authApi, userApi } from '../api';
import { parseNameFromEmail, decodeTokenRole, isTokenExpired } from '../utils/authUtils';

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
  requestReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (patch: Partial<Pick<User, 'name'>>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const tok = localStorage.getItem('buildmore_token');
      if (tok && isTokenExpired(tok)) return null;
      const stored = localStorage.getItem('buildmore_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('buildmore_token');
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('buildmore_token');
      localStorage.removeItem('buildmore_user');
      return null;
    }
    return stored;
  });

  const persistAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('buildmore_user', JSON.stringify(user));
    localStorage.setItem('buildmore_token', token);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.login({ email, password });
      const tok = res.token!;
      const role = decodeTokenRole(tok);
      let name = parseNameFromEmail(email);
      try {
        const profile = await userApi.getProfile(tok);
        name = profile.user.name;
      } catch { /* use email-derived fallback */ }
      persistAuth({ email, name, role }, tok);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.signup({ name, email, password, phone });
      const role = decodeTokenRole(res.token!);
      persistAuth({ email, name, role }, res.token!);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed.' };
    }
  };

  const requestReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authApi.requestReset({ email });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Request failed.' };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await authApi.forgotPassword({ email, resetCode: otp, password: newPassword });
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

  const updateUser = (patch: Partial<Pick<User, 'name'>>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('buildmore_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN', login, signup, requestReset, resetPassword, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
