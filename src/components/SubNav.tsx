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
      <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-200'} border-b py-2 px-6 overflow-x-auto transition-colors duration-300 relative z-[45]`}>
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
          <div className={`absolute top-full left-0 right-0 z-[42] border-b shadow-2xl transition-all duration-300 transform origin-top animate-fade-down ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="max-w-[1920px] mx-auto py-8 px-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                {CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="space-y-3 group/item">
                    <Link 
                      to={`/products?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between group/link"
                    >
                      <div className="flex items-center gap-2.5 transition-transform group-hover/link:translate-x-1">
                        <div className={`p-1.5 rounded-md transition-colors ${isDark ? 'bg-white/5 text-yellow-500' : 'bg-slate-100 text-slate-600'} group-hover/link:bg-yellow-400 group-hover/link:text-black`}>
                          <cat.icon className="w-4 h-4" />
                        </div>
                        <h4 className={`font-black text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {cat.name}
                        </h4>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-100 text-slate-400 opacity-60'}`}>
                        {cat.count || 0}+ Items
                      </span>
                    </Link>
                    
                    <ul className="space-y-1.5 ml-[34px]">
                      {cat.subcategories.slice(0, 4).map((sub, sidx) => (
                        <li key={sidx}>
                          <Link 
                            to={`/products?category=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub)}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-[11px] text-slate-500 hover:text-yellow-400 transition-colors flex items-center justify-between group/sub"
                          >
                            <span className="flex items-center gap-2">
                              {sub}
                            </span>
                            <ChevronRight className="w-2.5 h-2.5 opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">Market Status</span>
                      <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Global Pricing Synchronized</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">Last Update</span>
                      <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Today, 14:42 PM</span>
                    </div>
                  </div>
                </div>
                <Link 
                  to="/products"
                  className="flex items-center gap-2 text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:translate-x-2 transition-transform bg-black/5 dark:bg-white/5 px-4 py-2 rounded-lg"
                >
                  Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
