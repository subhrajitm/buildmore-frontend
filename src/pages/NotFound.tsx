import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const NotFound: React.FC = () => {
  const { isDark } = useTheme();
  return (
  <div className="flex flex-col items-center justify-center py-48 gap-6 text-center">
    <AlertCircle className="w-12 h-12 text-slate-500 opacity-40" />
    <div className="space-y-2">
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">404</p>
      <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Page Not Found</h1>
      <p className="text-sm text-slate-500 font-medium">The page you're looking for doesn't exist.</p>
    </div>
    <Link
      to="/"
      className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all"
    >
      Back to Home
    </Link>
  </div>
  );
};
