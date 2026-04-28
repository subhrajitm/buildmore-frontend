import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, User, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthProps {
  isDark: boolean;
}

type Mode = 'login' | 'signup' | 'forgot';

export const Auth: React.FC<AuthProps> = ({ isDark }) => {
  const { login, signup, forgotPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/profile';

  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const resetState = () => {
    setError('');
    setSuccessMsg('');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetState();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error || 'Authentication failed.');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    const result = await signup(name, email, password, phone);
    setLoading(false);
    if (!result.success) setError(result.error || 'Signup failed.');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(forgotEmail, newPassword);
    setLoading(false);
    if (result.success) {
      setSuccessMsg('Password updated successfully. Redirecting to sign in…');
      setTimeout(() => switchMode('login'), 2500);
    } else {
      setError(result.error || 'Password reset failed.');
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all ${
    isDark
      ? 'bg-zinc-800 border-white/5 text-white focus:ring-1 focus:ring-yellow-400'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-900'
  }`;

  const labelClass = 'text-[9px] font-black uppercase tracking-widest text-slate-500';

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className={`w-full max-w-md p-8 rounded-2xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-yellow-400 rounded-sm flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-black" />
          </div>
          <span className={`text-lg font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Build<span className="text-yellow-400">More</span>
          </span>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-white/5 mb-6">
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === m
                  ? 'bg-yellow-400 text-black'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@company.com" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className={`${inputClass} pl-10`} />
              </div>
            </div>

            {error && <ErrorBanner msg={error} />}

            <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-3 h-3" />}
            </button>
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
              <button type="button" onClick={() => switchMode('forgot')} className="text-slate-500 hover:text-yellow-400">Forgot?</button>
              <button type="button" onClick={() => switchMode('signup')} className="text-slate-500 hover:text-yellow-400">Create Account</button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className={labelClass}>Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@company.com" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} className={`${inputClass} pl-10`} />
              </div>
            </div>

            {error && <ErrorBanner msg={error} />}

            <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Account'}
              {!loading && <ArrowRight className="w-3 h-3" />}
            </button>
            <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-500">
              Already registered?{' '}
              <button type="button" onClick={() => switchMode('login')} className="text-yellow-400 hover:underline">Sign In</button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-1">
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="email@company.com" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={8} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={8} className={`${inputClass} pl-10`} />
              </div>
            </div>

            {error && <ErrorBanner msg={error} />}
            {successMsg && <SuccessBanner msg={successMsg} />}

            <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-500">
              <button type="button" onClick={() => switchMode('login')} className="text-yellow-400 hover:underline">Back to Sign In</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
      <AlertCircle className="w-3 h-3 shrink-0" />
      <span className="text-[9px] font-black uppercase tracking-widest">{msg}</span>
    </div>
  );
}

function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
      <CheckCircle className="w-3 h-3 shrink-0" />
      <span className="text-[9px] font-black uppercase tracking-widest">{msg}</span>
    </div>
  );
}