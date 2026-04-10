import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  isDark: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await adminLogin(email, password);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const inputClass = `w-full px-4 py-4 rounded-xl border text-sm font-bold outline-none transition-colors ${
    isDark 
      ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' 
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <div className={`w-full max-w-md rounded-3xl border p-8 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className={`text-xl font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>BuildMore</h1>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Admin Portal</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400 font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              placeholder="admin@buildmore.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In to Admin'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dashed text-center">
          <a 
            href="/" 
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${
              isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            ← Back to Main Site
          </a>
        </div>
      </div>
    </div>
  );
};