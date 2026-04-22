import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getCategoryMeta } from '../utils/categoryMeta';

interface SubNavProps {
  isDark: boolean;
}

const NAV_LINKS = [
  { label: 'Products', to: '/products' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Shipping', to: '/logistics' },
  { label: 'Compliance', to: '/compliance' },
  { label: 'Technical Details', to: '/specs' },
  { label: 'Quote Requests', to: '/rfqs' },
];

const ALL_CATEGORIES = [
  'Cement & Concrete',
  'Tiles & Flooring',
  'Paints & Finishes',
  'Construction Chemicals',
  'Plywood, Laminates & Boards',
  'Electrical',
  'Lighting & Fans',
  'Electrical Infrastructure',
  'Plumbing & Sanitary',
  'Hardware & Fittings',
  'Kitchen & Wardrobe Solutions',
  'Doors & Windows',
  'Tools & Equipment',
];

const totalSubcategories = ALL_CATEGORIES.reduce(
  (sum, name) => sum + getCategoryMeta(name).subcategories.length, 0
);

export const SubNav: React.FC<SubNavProps> = ({ isDark }) => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const activeMeta = getCategoryMeta(activeCategory);

  return (
    <div className="relative font-primary" ref={menuRef}>
      <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-300'} border-b py-2 px-6 overflow-x-auto transition-colors duration-300 relative z-[45]`}>
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8 whitespace-nowrap">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 font-bold text-xs text-yellow-400 transition-all"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              Explore
            </button>
            <div className={`flex items-center gap-8 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {NAV_LINKS.map(link => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`transition-colors pb-0.5 ${
                      isActive
                        ? `border-b-2 ${isDark ? 'text-white border-yellow-400' : 'text-slate-900 border-slate-900'}`
                        : 'hover:text-yellow-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-[40] pointer-events-auto"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className={`absolute top-full left-0 right-0 z-[42] border-b shadow-2xl ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'} rounded-b-2xl overflow-hidden`}>
            <div className="max-w-[1920px] mx-auto flex" style={{ minHeight: 360 }}>

              {/* Left — compact category list */}
              <div className={`w-[210px] shrink-0 border-r flex flex-col ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400">Categories</span>
                  <span className={`text-[9px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ALL_CATEGORIES.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto pb-3">
                  {ALL_CATEGORIES.map(name => {
                    const meta = getCategoryMeta(name);
                    const isActive = name === activeCategory;
                    const subCount = meta.subcategories.length;
                    return (
                      <Link
                        key={name}
                        to={`/products?category=${encodeURIComponent(name)}`}
                        onClick={() => setIsMenuOpen(false)}
                        onMouseEnter={() => setActiveCategory(name)}
                        className={`flex items-center gap-2 px-3 py-1.5 transition-all group ${
                          isActive
                            ? isDark ? 'bg-yellow-400/10' : 'bg-yellow-50'
                            : isDark ? 'hover:bg-white/5' : 'hover:bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? 'bg-yellow-400 text-black'
                            : isDark ? 'text-slate-500 group-hover:text-yellow-400' : 'text-slate-400 group-hover:text-yellow-500'
                        }`}>
                          <meta.icon className="w-3 h-3" />
                        </div>
                        <span className={`text-[10px] font-bold flex-1 leading-tight transition-colors ${
                          isActive
                            ? 'text-yellow-400'
                            : isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
                        }`}>
                          {name}
                        </span>
                        <span className={`text-[8px] font-black shrink-0 tabular-nums px-1 py-0.5 rounded ${
                          isActive
                            ? 'bg-yellow-400/20 text-yellow-400'
                            : isDark ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {subCount}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Center — subcategories */}
              <div className="flex-1 flex flex-col p-5 gap-4">
                {/* Category header */}
                <div className={`flex items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0">
                    <activeMeta.icon className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs font-black leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activeMeta.name}
                    </h3>
                    <p className="text-[9px] text-slate-500 font-medium">{activeMeta.desc} · {activeMeta.subcategories.length} subcategories</p>
                  </div>
                  <Link
                    to={`/products?category=${encodeURIComponent(activeCategory)}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Browse all <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>

                {/* Subcategory pills */}
                <div className="grid grid-cols-4 gap-1.5 content-start flex-1">
                  {activeMeta.subcategories.map((sub, idx) => (
                    <Link
                      key={idx}
                      to={`/products?category=${encodeURIComponent(activeCategory)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all group border ${
                        isDark
                          ? 'border-white/5 text-slate-400 hover:border-yellow-400/30 hover:text-white hover:bg-yellow-400/5'
                          : 'border-slate-100 text-slate-500 hover:border-yellow-400/40 hover:text-slate-900 hover:bg-yellow-50'
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-yellow-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="truncate">{sub}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right — stats + CTA */}
              <div className={`w-[190px] shrink-0 border-l flex flex-col p-5 gap-5 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                {/* Stats */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Catalog</p>
                  <div className={`p-3 rounded-xl space-y-2.5 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div>
                      <p className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{ALL_CATEGORIES.length}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Categories</p>
                    </div>
                    <div className={`border-t pt-2.5 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                      <p className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalSubcategories}+</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Subcategories</p>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <div className="flex-1">
                  <p className={`text-xs font-black leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    One platform for all construction materials.
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium mt-1 leading-relaxed">
                    From structural to finishing — bulk procurement made simple.
                  </p>
                </div>

                {/* Browse all */}
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
