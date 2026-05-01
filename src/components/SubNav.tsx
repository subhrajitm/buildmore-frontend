import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCategoryMeta } from '../utils/categoryMeta';
import { categoryApi, Category } from '../api';
import { useTheme } from '../context/ThemeContext';

export const SubNav: React.FC = () => {
  const { isDark } = useTheme();
  const { pathname, search } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [mobileCategoryId, setMobileCategoryId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryApi.getAll().then(res => {
      setCategories(res.categories || []);
      if (res.categories && res.categories.length > 0) {
        setActiveCategory(res.categories[0]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setMobileCategoryId(null);
  }, [pathname, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  const totalSubcategories = categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0);
  const activeMeta = activeCategory ? getCategoryMeta(activeCategory.name) : null;

  return (
    <div className="relative font-primary" ref={menuRef}>
      <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-300'} border-b py-2 px-3 sm:px-6 transition-colors duration-300 relative z-[45]`}>
        <div className="max-w-[1920px] mx-auto flex items-center">

          {/* Explore toggle — always visible, never scrolls */}
          <button
            onClick={() => setIsMenuOpen(o => !o)}
            className="flex items-center gap-1.5 font-bold text-xs text-yellow-400 shrink-0"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            Explore
          </button>

          <div className={`w-px h-4 shrink-0 mx-4 sm:mx-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Scrollable section: category links + All Products */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-none min-w-0">
            <div className={`flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {categories.slice(0, 5).map(cat => {
                const meta = getCategoryMeta(cat.name);
                return (
                  <Link
                    key={cat._id}
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                      isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <meta.icon className="w-3 h-3" />
                    {cat.name}
                  </Link>
                );
              })}
            </div>

            <div className={`w-px h-4 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

            <Link
              to="/products"
              className={`text-xs font-semibold shrink-0 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
            >
              All Products
            </Link>
          </div>
        </div>
      </nav>

      {/* Mega menu */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[40] pointer-events-auto" onClick={() => setIsMenuOpen(false)} />

          <div className={`absolute top-full left-0 right-0 z-[42] border-b shadow-2xl ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'} rounded-b-2xl overflow-hidden`}>

            {/* ── Mobile layout (< md) ─────────────────────────────── */}
            <div className="md:hidden max-h-[70vh] overflow-y-auto">
              {/* Header row */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Categories
                </span>
                <Link
                  to="/products/categories"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              {/* Accordion list */}
              {categories.map(cat => {
                const meta = getCategoryMeta(cat.name);
                const isExpanded = mobileCategoryId === cat._id;
                return (
                  <div key={cat._id} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    {/* Category row */}
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isExpanded
                          ? isDark ? 'bg-yellow-400/5' : 'bg-yellow-50'
                          : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setMobileCategoryId(isExpanded ? null : cat._id)}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isExpanded ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <meta.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`flex-1 text-sm font-semibold ${
                        isExpanded ? 'text-yellow-400' : isDark ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {cat.subcategories?.length || 0}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90 text-yellow-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                    </button>

                    {/* Expanded subcategories */}
                    {isExpanded && (
                      <div className={`px-4 pb-4 pt-2 ${isDark ? 'bg-black/20' : 'bg-slate-50/80'}`}>
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {cat.subcategories.map(sub => (
                              <Link
                                key={sub._id}
                                to={`/products?category=${encodeURIComponent(cat.name)}`}
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                                  isDark
                                    ? 'border-white/8 bg-white/[0.02] text-slate-300 hover:border-yellow-400/40 hover:text-yellow-400'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-yellow-400/50 hover:text-yellow-600 hover:bg-yellow-50'
                                }`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No subcategories</p>
                        )}
                        <Link
                          to={`/products/${cat.slug}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-widest transition-colors"
                        >
                          Explore All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Desktop layout (≥ md) ────────────────────────────── */}
            <div className="hidden md:flex max-w-[1920px] mx-auto" style={{ minHeight: 340 }}>

              {/* Left — category list */}
              <div className={`w-[168px] shrink-0 border-r flex flex-col ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between px-3 py-4 border-b border-dashed border-white/5">
                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Categories
                  </div>
                  <Link
                    to="/products/categories"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="flex-1 py-0.5 overflow-y-auto">
                  {categories.map(cat => {
                    const meta = getCategoryMeta(cat.name);
                    const isActive = activeCategory?._id === cat._id;
                    return (
                      <button
                        key={cat._id}
                        onMouseEnter={() => setActiveCategory(cat)}
                        onClick={() => setActiveCategory(cat)}
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
                        }`}>{cat.name}</span>
                        <span className={`text-[8px] font-black px-1 py-px rounded shrink-0 ${
                          isActive ? 'text-yellow-400' : isDark ? 'text-slate-600' : 'text-slate-400'
                        }`}>{cat.subcategories?.length || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center — subcategories of active category */}
              <div className="flex-1 p-6 overflow-y-auto min-w-0">
                {activeCategory && activeMeta && (
                  <>
                    <div className={`flex items-center justify-between mb-5 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0">
                          <activeMeta.icon className="w-4 h-4 text-black" />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-sm font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeCategory.name}</h3>
                          <p className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {activeCategory.description || activeMeta.desc} · {activeCategory.subcategories?.length || 0} types
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/products/${activeCategory.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-1.5 bg-yellow-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 shrink-0 ml-3"
                      >
                        Explore All <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {activeCategory.subcategories?.map(sub => (
                        <Link
                          key={sub._id}
                          to={`/products?category=${encodeURIComponent(activeCategory.name)}`}
                          onClick={() => setIsMenuOpen(false)}
                          className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                            isDark
                              ? 'border-white/8 bg-white/[0.02] text-slate-300 hover:border-yellow-400/40 hover:text-yellow-400 hover:bg-yellow-400/5'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-yellow-400/50 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right — stats */}
              <div className={`w-[190px] shrink-0 border-l p-5 flex flex-col gap-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Catalog</p>
                  <div className={`p-3 rounded-xl space-y-2.5 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div>
                      <p className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{categories.length}</p>
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
