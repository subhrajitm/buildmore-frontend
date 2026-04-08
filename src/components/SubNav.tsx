import React, { useState } from 'react';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../data/mockData';

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

export const SubNav: React.FC<SubNavProps> = ({ isDark }) => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative group/nav font-primary">
      <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-300'} border-b py-2 px-6 overflow-x-auto transition-colors duration-300 relative z-[45]`}>
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8 whitespace-nowrap">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 font-bold text-xs transition-all ${isMenuOpen ? 'text-white' : 'text-yellow-400'}`}
            >
              {isMenuOpen ? <X className="w-4 h-4 text-yellow-400" /> : <Menu className="w-4 h-4" />}
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

      {/* Mega Menu Overlay */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-[40] transition-opacity duration-300 pointer-events-auto"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className={`absolute top-full left-0 right-0 z-[42] border-b shadow-2xl transition-all duration-300 transform origin-top animate-fade-down overflow-hidden ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'} rounded-b-[24px]`}>
            <div className="max-w-[1920px] mx-auto flex min-h-[380px]">
              
              {/* Left Segment: Primary Categories */}
              <div className={`w-[260px] border-r p-6 space-y-3 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-4">Market Sectors</div>
                {CATEGORIES.slice(0, 3).map((cat, idx) => (
                  <button 
                    key={idx}
                    className={`w-full group p-4 rounded-xl border transition-all text-left flex flex-col gap-0.5 relative overflow-hidden ${idx === 0 ? (isDark ? 'bg-yellow-400 border-yellow-400 shadow-lg' : 'bg-yellow-400 border-yellow-400 shadow-md') : (isDark ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-yellow-400/50')}`}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className={`text-xs font-black uppercase tracking-tight ${idx === 0 ? 'text-black' : (isDark ? 'text-white' : 'text-slate-900')}`}>{cat.name}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${idx === 0 ? 'text-black' : 'text-yellow-400'}`} />
                    </div>
                    <span className={`text-[10px] font-medium z-10 ${idx === 0 ? 'text-black/60' : 'text-slate-500'}`}>Pro Materials</span>
                    {idx === 0 && <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />}
                  </button>
                ))}
              </div>

              {/* Center Segment: Deep Inventory */}
              <div className="flex-1 p-8 grid grid-cols-2 gap-x-10 gap-y-1">
                <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Catalog Inventory</div>
                {CATEGORIES[0].subcategories.concat(CATEGORIES[1].subcategories).slice(0, 8).map((sub, sidx) => (
                  <Link 
                    key={sidx}
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-white/5 group-hover:bg-yellow-400' : 'bg-slate-100 group-hover:bg-yellow-400'}`}>
                      <Menu className={`w-4 h-4 transition-colors ${isDark ? 'text-slate-400 group-hover:text-black' : 'text-slate-500 group-hover:text-black'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{sub}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Bulk availability</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Segment: Featured Insight */}
              <div className={`w-[320px] border-l p-8 flex flex-col justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-md">Insight</span>
                  </div>
                  <h3 className={`text-xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Real-time bulk <br />
                    <span className="text-yellow-400 italic">procurement</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Optimize your construction supply chain with proprietary price engines.
                  </p>
                </div>
                
                <div className="pt-6">
                  <Link 
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="group w-10 h-10 rounded-full border border-yellow-400 flex items-center justify-center transition-all hover:bg-yellow-400 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:text-black transition-colors" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
