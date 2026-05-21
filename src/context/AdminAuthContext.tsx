'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';
import { parseNameFromEmail, decodeTokenRole, isTokenExpired } from '../utils/authUtils';

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

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check dedicated admin token first
      const adminTok = localStorage.getItem('buildmore_admin_token');
      if (adminTok && !isTokenExpired(adminTok)) {
        const stored = localStorage.getItem('buildmore_admin_user');
        if (stored) setAdminUser(JSON.parse(stored));
        setAdminToken(adminTok);
        return;
      }
      localStorage.removeItem('buildmore_admin_token');
      localStorage.removeItem('buildmore_admin_user');

      // Fall back to regular user token if they have ADMIN role
      const userTok = localStorage.getItem('buildmore_token');
      if (userTok && !isTokenExpired(userTok) && decodeTokenRole(userTok) === 'ADMIN') {
        const stored = localStorage.getItem('buildmore_user');
        if (stored) {
          const u = JSON.parse(stored);
          setAdminUser({ email: u.email, name: u.name, role: 'ADMIN' });
          setAdminToken(userTok);
        }
      }
    } catch { /* ignore */ }
  }, []);

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
    localStorage.removeItem('buildmore_user');
    localStorage.removeItem('buildmore_token');
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
