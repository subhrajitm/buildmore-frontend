import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, ChevronDown, BarChart3, Sun, Moon, LogOut, ShieldCheck, User, Package, FileText, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/currency';
import { LocationModal, getStoredLocation } from './LocationModal';

export const Header: React.FC = () => {
  const { totalItems, totalValue } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState(() => getStoredLocation());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setProfileOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setSearchQuery('');
  };

  return (
  <>
    <header className={`${isDark ? 'bg-zinc-900/95 border-yellow-400/10' : 'bg-white/95 border-slate-200'} backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b transition-colors duration-300`}>
      <div className="max-w-[1920px] mx-auto px-6 py-2 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow-400 rounded-sm flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} uppercase leading-none`}>Build<span className="text-yellow-400">More</span></span>
              <span className="text-[9px] font-black tracking-widest text-yellow-400 uppercase leading-none">Infra Mart</span>
            </div>
          </Link>
          <button
            onClick={() => setLocationOpen(true)}
            className={`hidden lg:flex items-center gap-2 group cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} p-1.5 rounded-md transition-colors`}
          >
            <MapPin className="w-5 h-5 text-yellow-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] leading-tight text-slate-500 font-bold">Deliver to</span>
              <span className={`text-xs font-bold leading-tight max-w-[120px] truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {location || 'Select location'}
              </span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative flex items-center group">
            <div className="absolute left-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for materials, tools, and more..."
              className={`w-full ${isDark ? 'bg-zinc-800 border-white/5 text-white focus:bg-zinc-700' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'} border rounded-lg pl-10 pr-4 py-2.5 text-sm transition-all outline-none focus:ring-2 focus:ring-yellow-400`}
            />
          </div>
        </form>

        <div className="flex items-center gap-6 text-sm font-bold">
          <div className="hidden xl:flex items-center gap-6 text-slate-400">
            <button
              onClick={toggleDark}
              className={`p-2 rounded-lg transition-all ${isDark ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className={`h-6 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${profileOpen ? isDark ? 'bg-white/10' : 'bg-slate-100' : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${isDark ? 'bg-zinc-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[10px] leading-tight text-slate-500 font-bold">Account</span>
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <span className="flex items-center gap-0.5 bg-yellow-400 text-black px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-widest">
                          <ShieldCheck className="w-2 h-2" /> Admin
                        </span>
                      )}
                      <span className={`text-xs font-bold leading-tight max-w-[90px] truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden z-50 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${isDark ? 'bg-zinc-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          {user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <span className="mt-2 inline-flex items-center gap-1 bg-yellow-400 text-black px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                          <ShieldCheck className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1.5">
                      {[
                        { to: '/profile', icon: User, label: 'My Profile' },
                        { to: '/profile?tab=orders', icon: Package, label: 'My Orders' },
                        { to: '/wishlist', icon: Heart, label: 'My Wishlist' },
                        { to: '/rfqs', icon: FileText, label: 'Quote Requests' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setProfileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          {label}
                        </Link>
                      ))}
                    </div>

                    <div className={`border-t py-1.5 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors text-red-400 ${isDark ? 'hover:bg-red-400/10' : 'hover:bg-red-50'}`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="flex flex-col cursor-pointer group text-right">
                <span className="text-[10px] leading-tight text-slate-500 font-bold">Account</span>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign In</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                </div>
              </Link>
            )}

            <Link to="/cart" className="relative flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <div className="p-2 bg-yellow-400 rounded-lg group-hover:bg-yellow-300 transition-colors shadow-sm">
                  <ShoppingCart className="w-5 h-5 text-black" />
                </div>
                {totalItems > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ${isDark ? 'ring-black' : 'ring-white'}`}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold">Cart Total</span>
                <span className="text-xs font-bold text-yellow-400">{formatPrice(totalValue)}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>

    {locationOpen && (
      <LocationModal
        onClose={() => setLocationOpen(false)}
        onSelect={loc => setLocation(loc)}
      />
    )}
  </>
  );
};
