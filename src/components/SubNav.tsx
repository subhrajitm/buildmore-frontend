import React from 'react';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SubNavProps {
  isDark: boolean;
}

const NAV_LINKS = [
  { label: 'Procurement', to: '/products' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Logistics', to: '/logistics' },
  { label: 'Compliance', to: '/compliance' },
  { label: 'Specs', to: '/specs' },
  { label: 'RFQs', to: '/rfqs' },
];

export const SubNav: React.FC<SubNavProps> = ({ isDark }) => {
  const { pathname } = useLocation();

  return (
    <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-200'} border-b py-2 px-6 overflow-x-auto transition-colors duration-300`}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8 whitespace-nowrap">
          <button className="flex items-center gap-2 font-black text-[10px] text-yellow-400 uppercase tracking-widest">
            <Menu className="w-3.5 h-3.5" />
            Directories
          </button>
          <div className={`flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`transition-colors pb-0.5 ${
                    isActive
                      ? `border-b ${isDark ? 'text-white border-yellow-400' : 'text-slate-900 border-slate-900'}`
                      : 'hover:text-yellow-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
            System Status: Optimal
          </div>
        </div>
      </div>
    </nav>
  );
};
