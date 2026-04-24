import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES[0]);
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

  const activeMeta = getCategoryMeta(activeCategory);

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

          {/* Top department links */}
          <div className={`flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {TOP_CATEGORIES.map(top => (
              <Link
                key={top.slug}
                to={`/products?group=${top.slug}`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <top.icon className="w-3 h-3" />
                {top.shortName}
              </Link>
            ))}
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
            <div className="max-w-[1920px] mx-auto flex" style={{ minHeight: 340 }}>

              {/* Left — all leaf categories list (compact) */}
              <div className={`w-[168px] shrink-0 border-r flex flex-col ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="px-3 pt-3 pb-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-yellow-400">
                  Categories
                </div>
                <div className="flex-1 py-0.5 overflow-y-auto">
                  {ALL_CATEGORIES.map(catName => {
                    const meta = getCategoryMeta(catName);
                    const isActive = catName === activeCategory;
                    return (
                      <button
                        key={catName}
                        onMouseEnter={() => setActiveCategory(catName)}
                        onClick={() => setActiveCategory(catName)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 transition-all text-left ${
                          isActive
                            ? isDark ? 'bg-yellow-400/10' : 'bg-yellow-50'
                            : isDark ? 'hover:bg-white/5' : 'hover:bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${
                          isActive ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-500' : 'bg-white text-slate-400'
                        }`}>
                          <meta.icon className="w-2.5 h-2.5" />
                        </div>
                        <span className={`text-[10px] font-semibold leading-tight flex-1 min-w-0 truncate ${
                          isActive ? 'text-yellow-400' : isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>{catName}</span>
                        <span className={`text-[8px] font-black px-1 py-px rounded shrink-0 ${
                          isActive ? 'text-yellow-400' : isDark ? 'text-slate-600' : 'text-slate-400'
                        }`}>{meta.subcategories.length}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center — subcategories of active category */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className={`flex items-center justify-between mb-5 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center">
                      <activeMeta.icon className="w-4.5 h-4.5 text-black" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeCategory}</h3>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{activeMeta.desc} · {activeMeta.subcategories.length} types</p>
                    </div>
                  </div>
                  <Link
                    to={`/products?category=${encodeURIComponent(activeCategory)}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Browse all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Subcategory pills grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {activeMeta.subcategories.map(sub => (
                    <Link
                      key={sub}
                      to={`/products?category=${encodeURIComponent(activeCategory)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        isDark
                          ? 'border-white/8 bg-white/[0.02] text-slate-300 hover:border-yellow-400/40 hover:text-yellow-400 hover:bg-yellow-400/5'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-yellow-400/50 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right — stats */}
              <div className={`w-[190px] shrink-0 border-l p-5 flex flex-col gap-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
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
