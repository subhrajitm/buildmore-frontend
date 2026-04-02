import React from 'react';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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

  return (
    <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-200'} border-b py-2 px-6 overflow-x-auto transition-colors duration-300`}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8 whitespace-nowrap">
          <button className="flex items-center gap-2 font-bold text-xs text-yellow-400">
            <Menu className="w-4 h-4" />
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
  );
};
