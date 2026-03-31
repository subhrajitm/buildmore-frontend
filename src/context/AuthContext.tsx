import React, { createContext, useContext, useState } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('buildmore_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    if (!email || !password) return { success: false, error: 'All fields are required.' };
    if (!/\S+@\S+\.\S+/.test(email)) return { success: false, error: 'Enter a valid email address.' };
    if (password.length < 6) return { success: false, error: 'Invalid credentials.' };

    const newUser: User = {
      email,
      name: email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()),
    };
    setUser(newUser);
    localStorage.setItem('buildmore_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('buildmore_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
