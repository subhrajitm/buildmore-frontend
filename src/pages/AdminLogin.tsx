import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  Lock, Loader2, AlertCircle, Shield, BarChart3, Eye, EyeOff, 
  CheckCircle, Globe, Server, ArrowRight, Building2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const AdminLogin: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const features = [
    { icon: BarChart3, label: 'Real-time Analytics', desc: 'Track performance metrics' },
    { icon: Globe, label: 'Global Management', desc: 'Control all operations' },
    { icon: Shield, label: 'Enterprise Security', desc: 'Bank-grade protection' },
    { icon: Server, label: 'System Control', desc: 'Full backend access' },
  ];

  return (
    <div className="flex h-screen w-full">
      {/* Left Panel - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 flex-col justify-between h-full ${isDark ? 'bg-zinc-900' : 'bg-slate-900'}`}>
        <div className="space-y-8 p-8 lg:p-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-white'}`}>
                Build<span className="text-yellow-400">More</span>
              </span>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Admin Control Center</p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tight">
              Enterprise<br />
              <span className="text-yellow-400">Administration</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
              Secure access to the BuildMore operating system. Manage products, 
              orders, shipments, and RFQs across global operations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-black uppercase tracking-wider">{feature.label}</p>
                  <p className="text-slate-500 text-[10px] font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`w-full max-w-md ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-3xl border p-8 ${isDark ? 'border-white/10' : 'border-slate-200 shadow-2xl'}`}>
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className={`text-lg font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>BuildMore</span>
              <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Admin Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome Back
            </h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter your credentials to access the admin panel
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admin Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border text-sm font-bold outline-none transition-colors ${
                    isDark 
                      ? 'bg-zinc-950 border-white/10 text-white placeholder-slate-600 focus:border-yellow-400/50' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
                  }`}
                  placeholder="admin@buildmore.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 rounded-xl border text-sm font-bold outline-none transition-colors ${
                    isDark 
                      ? 'bg-zinc-950 border-white/10 text-white placeholder-slate-600 focus:border-yellow-400/50' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
                  }`}
                  placeholder="Enter your access key"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Control Panel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-dashed text-center">
            <Link 
              to="/" 
              className={`text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-2 ${
                isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ← Return to Main Portal
            </Link>
          </div>

          <div className={`mt-6 p-4 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Restricted access. All activities are monitored and logged for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};