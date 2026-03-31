import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Mail, Lock, ArrowRight, ShieldCheck, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthProps {
  isDark: boolean;
}

export const Auth: React.FC<AuthProps> = ({ isDark }) => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const result = login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-in zoom-in-95 duration-500">
      <div className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border ${isDark ? 'bg-zinc-900 border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}>
        <div className={`p-12 flex flex-col justify-between ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-sm flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <span className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Build<span className="text-yellow-400">More</span></span>
            </div>
            <h2 className={`text-4xl font-black tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>The Procurement <br />Standard</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Unified operating system for global logistics, verified manufacturers, and technical precision.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-400">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Verified Sourcing</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Enterprise ISO Compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-400">
                <Globe className="w-6 h-6 text-black" />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Global Logistics</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time Freight Intelligence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-12 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[1.5px] bg-yellow-400"></span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Enterprise Entrance</span>
            </div>
            <h3 className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enterprise Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@buildglobal.com"
                  className={`w-full py-4 pl-12 pr-4 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-zinc-800 border-white/5 text-white focus:ring-1 focus:ring-yellow-400 focus:bg-zinc-700' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full py-4 pl-12 pr-4 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-zinc-800 border-white/5 text-white focus:ring-1 focus:ring-yellow-400 focus:bg-zinc-700' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white'}`}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-300 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Authorize Entrance'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                <button type="button" className="text-slate-500 hover:text-yellow-400 transition-colors">Request ID Reset</button>
                <button type="button" className="text-slate-500 hover:text-yellow-400 transition-colors">Apply for Enterprise Account</button>
              </div>
            </div>
          </form>

          <div className="pt-4 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 ${isDark ? 'border-zinc-900' : 'border-white'} overflow-hidden`}>
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-tight">
              Joined by <span className={isDark ? 'text-white' : 'text-slate-900'}>1,240+</span> leading <br />industrial enterprises globally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
