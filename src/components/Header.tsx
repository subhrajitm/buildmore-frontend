import React, { useState } from 'react';
import { Search, MapPin, ShoppingCart, ChevronDown, BarChart3, Sun, Moon, Award, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (d: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, setIsDark }) => {
  const { totalItems, totalValue } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setSearchQuery('');
  };

  return (
    <header className={`${isDark ? 'bg-zinc-900/95 border-yellow-400/10' : 'bg-white/95 border-slate-200'} backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b transition-colors duration-300`}>
      <div className="max-w-[1920px] mx-auto px-6 py-2 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow-400 rounded-sm flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} uppercase`}>Build<span className="text-yellow-400">More</span></span>
          </Link>
          <div className={`hidden lg:flex items-center gap-2 group cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} p-1.5 rounded-md transition-colors`}>
            <MapPin className="w-5 h-5 text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-[10px] leading-tight text-slate-500 font-bold">Deliver to</span>
              <span className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>London Hub SE1</span>
            </div>
          </div>
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
            {/* <a href="#" className={`hover:text-yellow-400 transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Award className="w-3.5 h-3.5" />
              Certifications
            </a> */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-all ${isDark ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className={`h-6 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex flex-col cursor-pointer group text-right">
                  <span className="text-[10px] leading-tight text-slate-500 font-bold">Account</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'}`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
                <span className="text-xs font-bold text-yellow-400">${totalValue.toFixed(2)}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
