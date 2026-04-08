import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Mail, Lock, ArrowRight, ShieldCheck, Globe, AlertCircle, User, Phone, CheckCircle } from 'lucide-react';
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

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup extra fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Forgot password
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
    if (phone.length > 10) {
      setError('Phone number must be at most 10 digits.');
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
      setSuccessMsg('Password updated successfully. You can now log in.');
    } else {
      setError(result.error || 'Password reset failed.');
    }
  };

  const inputClass = `w-full py-4 pl-12 pr-4 rounded-xl border text-sm outline-none transition-all ${
    isDark
      ? 'bg-zinc-800 border-white/5 text-white focus:ring-1 focus:ring-yellow-400 focus:bg-zinc-700'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white'
  }`;

  const labelClass = 'text-[10px] font-black uppercase tracking-widest text-slate-500';

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-in zoom-in-95 duration-500">
      <div className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border ${isDark ? 'bg-zinc-900 border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}>

        {/* Left panel */}
        <div className={`p-12 flex flex-col justify-between ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-sm flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <span className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Build<span className="text-yellow-400">More</span>
              </span>
            </div>
            <h2 className={`text-4xl font-black tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              The Procurement <br />Standard
            </h2>
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

        {/* Right panel */}
        <div className="p-12 space-y-8">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
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
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-[1.5px] bg-yellow-400"></span>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Enterprise Entrance</span>
                </div>
                <h3 className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h3>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className={labelClass}>Enterprise Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@buildglobal.com" required className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Access Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required className={inputClass} />
                  </div>
                </div>

                {error && <ErrorBanner msg={error} />}

                <div className="space-y-4 pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-300 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Authenticating...' : 'Authorize Entrance'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                    <button type="button" onClick={() => switchMode('forgot')} className="text-slate-500 hover:text-yellow-400 transition-colors">
                      Reset Password
                    </button>
                    <button type="button" onClick={() => switchMode('signup')} className="text-slate-500 hover:text-yellow-400 transition-colors">
                      Create Account
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-[1.5px] bg-yellow-400"></span>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">New Account</span>
                </div>
                <h3 className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Register</h3>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className={labelClass}>Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Enterprise Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@buildglobal.com" required className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Phone (max 10 digits)</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" required className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Password (min 8 chars)</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required minLength={8} className={inputClass} />
                  </div>
                </div>

                {error && <ErrorBanner msg={error} />}

                <div className="space-y-4 pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-300 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Creating Account...' : 'Create Account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Already registered?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="text-yellow-400 hover:underline">Sign In</button>
                  </p>
                </div>
              </form>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-[1.5px] bg-yellow-400"></span>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Reset Access</span>
                </div>
                <h3 className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Reset Password</h3>
              </div>

              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-2">
                  <label className={labelClass}>Registered Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="admin@buildglobal.com" required className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>New Password (min 8 chars)</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••••••" required minLength={8} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••••" required minLength={8} className={inputClass} />
                  </div>
                </div>

                {error && <ErrorBanner msg={error} />}
                {successMsg && <SuccessBanner msg={successMsg} />}

                <div className="space-y-4 pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-300 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Updating...' : 'Update Password'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <button type="button" onClick={() => switchMode('login')} className="text-yellow-400 hover:underline">Back to Sign In</button>
                  </p>
                </div>
              </form>
            </>
          )}

          {mode === 'login' && (
            <div className="pt-2 flex items-center gap-4">
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
          )}
        </div>
      </div>
    </div>
  );
};

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="text-[10px] font-black uppercase tracking-widest">{msg}</span>
    </div>
  );
}

function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
      <CheckCircle className="w-4 h-4 shrink-0" />
      <span className="text-[10px] font-black uppercase tracking-widest">{msg}</span>
    </div>
  );
}
