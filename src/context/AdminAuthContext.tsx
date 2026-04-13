import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

interface AdminUser {
  email: string;
  name: string;
  role: 'ADMIN';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

function parseNameFromEmail(email: string) {
  return email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function decodeTokenRole(token: string): 'ADMIN' | 'USER' {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch {
    return 'USER';
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload?.exp) return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return false;
  }
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const tok = localStorage.getItem('buildmore_admin_token');
      if (tok && isTokenExpired(tok)) return null;
      const stored = localStorage.getItem('buildmore_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('buildmore_admin_token');
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('buildmore_admin_token');
      localStorage.removeItem('buildmore_admin_user');
      return null;
    }
    return stored;
  });

  const persistAdminAuth = (user: AdminUser, token: string) => {
    setAdminUser(user);
    setAdminToken(token);
    localStorage.setItem('buildmore_admin_user', JSON.stringify(user));
    localStorage.setItem('buildmore_admin_token', token);
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.login({ email, password });
      const tok = res.token!;
      const role = decodeTokenRole(tok);
      
      if (role !== 'ADMIN') {
        return { success: false, error: 'Access denied. Admin credentials required.' };
      }
      
      const name = parseNameFromEmail(email);
      persistAdminAuth({ email, name, role: 'ADMIN' }, tok);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('buildmore_admin_user');
    localStorage.removeItem('buildmore_admin_token');
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminToken, isAdminAuthenticated: !!adminUser, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};