import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCategoryMeta, TOP_CATEGORIES, ALL_CATEGORIES } from '../utils/categoryMeta';

interface SubNavProps {
  isDark: boolean;
}

const totalSubcategories = ALL_CATEGORIES.reduce(
  (sum, name) => sum + getCategoryMeta(name).subcategories.length, 0
);

export const SubNav: React.FC<SubNavProps> = ({ isDark }) => {
  const { pathname, search } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTopIdx, setActiveTopIdx] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMenuOpen(false); }, [pathname, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  const activeTop = TOP_CATEGORIES[activeTopIdx];

  return (
    <div className="relative font-primary" ref={menuRef}>
      <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-300'} border-b py-2 px-6 overflow-x-auto transition-colors duration-300 relative z-[45]`}>
        <div className="max-w-[1920px] mx-auto flex items-center gap-6 whitespace-nowrap">

          {/* Explore toggle */}
          <button
            onClick={() => setIsMenuOpen(o => !o)}
            className="flex items-center gap-1.5 font-bold text-xs text-yellow-400 shrink-0"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            Explore
          </button>

          <div className={`w-px h-4 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Top categories */}
          <div className={`flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {TOP_CATEGORIES.map((top, idx) => {
              const isActive = isMenuOpen && activeTopIdx === idx;
              return (
                <button
                  key={top.slug}
                  onMouseEnter={() => { if (isMenuOpen) setActiveTopIdx(idx); }}
                  onClick={() => {
                    if (isMenuOpen && activeTopIdx === idx) {
                      setIsMenuOpen(false);
                    } else {
                      setActiveTopIdx(idx);
                      setIsMenuOpen(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-yellow-400 text-black'
                      : isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <top.icon className="w-3 h-3" />
                  {top.shortName}
                </button>
              );
            })}
          </div>

          <div className={`w-px h-4 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Quick all-products link */}
          <Link
            to="/products"
            className={`text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
          >
            All Products
          </Link>
        </div>
      </nav>

      {/* Mega menu */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[40] pointer-events-auto" onClick={() => setIsMenuOpen(false)} />
          <div className={`absolute top-full left-0 right-0 z-[42] border-b shadow-2xl ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'} rounded-b-2xl overflow-hidden`}>
            <div className="max-w-[1920px] mx-auto flex" style={{ minHeight: 360 }}>

              {/* Left — top category tabs */}
              <div className={`w-[220px] shrink-0 border-r flex flex-col ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="px-4 pt-4 pb-2 text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400">
                  Departments
                </div>
                <div className="flex-1 py-2 space-y-0.5 px-2">
                  {TOP_CATEGORIES.map((top, idx) => {
                    const isActive = idx === activeTopIdx;
                    const leafCount = top.categories.length;
                    const subCount = top.categories.reduce((s, c) => s + getCategoryMeta(c).subcategories.length, 0);
                    return (
                      <button
                        key={top.slug}
                        onMouseEnter={() => setActiveTopIdx(idx)}
                        onClick={() => setActiveTopIdx(idx)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
                          isActive
                            ? isDark ? 'bg-yellow-400/10' : 'bg-yellow-50'
                            : isDark ? 'hover:bg-white/5' : 'hover:bg-white'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-400' : 'bg-white text-slate-400'}`}>
                          <top.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-yellow-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{top.name}</p>
                          <p className={`text-[9px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{leafCount} categories · {subCount} types</p>
                        </div>
                        <ChevronRight className={`w-3 h-3 shrink-0 transition-all ${isActive ? 'text-yellow-400' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center — leaf categories of active top */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-yellow-400 flex items-center justify-center">
                      <activeTop.icon className="w-3 h-3 text-black" />
                    </div>
                    <h3 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeTop.name}</h3>
                  </div>
                  <Link
                    to={`/products?group=${activeTop.slug}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Browse all <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>

                {/* Leaf categories grid */}
                <div className={`grid gap-4 ${activeTop.categories.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-3'}`}>
                  {activeTop.categories.map(catName => {
                    const meta = getCategoryMeta(catName);
                    return (
                      <div key={catName} className={`rounded-xl p-3 border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                        <Link
                          to={`/products?category=${encodeURIComponent(catName)}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 mb-2 group"
                        >
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all ${isDark ? 'bg-white/5 text-slate-400 group-hover:bg-yellow-400 group-hover:text-black' : 'bg-white text-slate-400 group-hover:bg-yellow-400 group-hover:text-black'}`}>
                            <meta.icon className="w-3 h-3" />
                          </div>
                          <span className={`text-[11px] font-black leading-tight transition-colors group-hover:text-yellow-400 ${isDark ? 'text-white' : 'text-slate-900'}`}>{catName}</span>
                        </Link>
                        <div className="flex flex-wrap gap-1">
                          {meta.subcategories.slice(0, 5).map(sub => (
                            <Link
                              key={sub}
                              to={`/products?category=${encodeURIComponent(catName)}`}
                              onClick={() => setIsMenuOpen(false)}
                              className={`text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors ${isDark ? 'text-slate-500 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                              {sub}
                            </Link>
                          ))}
                          {meta.subcategories.length > 5 && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>+{meta.subcategories.length - 5}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right — stats */}
              <div className={`w-[180px] shrink-0 border-l p-5 flex flex-col gap-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Catalog</p>
                  <div className={`p-3 rounded-xl space-y-2.5 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div>
                      <p className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{TOP_CATEGORIES.length}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Departments</p>
                    </div>
                    <div className={`border-t pt-2.5 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                      <p className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{ALL_CATEGORIES.length}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Categories</p>
                    </div>
                    <div className={`border-t pt-2.5 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                      <p className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalSubcategories}+</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Product Types</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-black leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>One platform for all construction materials.</p>
                  <p className="text-[9px] text-slate-500 font-medium mt-1 leading-relaxed">From structural to finishing.</p>
                </div>
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 transition-colors group"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-black">Browse All</span>
                  <ArrowRight className="w-3 h-3 text-black group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
