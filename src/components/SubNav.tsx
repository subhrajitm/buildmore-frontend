import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubNavProps {
  isDark: boolean;
}

export const SubNav: React.FC<SubNavProps> = ({ isDark }) => (
  <nav className={`${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-200'} border-b py-2 px-6 overflow-x-auto transition-colors duration-300`}>
    <div className="max-w-[1920px] mx-auto flex items-center justify-between">
      <div className="flex items-center gap-8 whitespace-nowrap">
        <button className="flex items-center gap-2 font-black text-[10px] text-yellow-400 uppercase tracking-widest">
          <Menu className="w-3.5 h-3.5" />
          Directories
        </button>
        <div className={`flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <Link to="/products" className={`${isDark ? 'text-white border-yellow-400' : 'text-slate-900 border-slate-900'} border-b pb-0.5`}>Procurement</Link>
          <Link to="/inventory" className="hover:text-yellow-400 transition-colors">Inventory</Link>
          <Link to="/logistics" className="hover:text-yellow-400 transition-colors">Logistics</Link>
          <Link to="/compliance" className="hover:text-yellow-400 transition-colors">Compliance</Link>
          <Link to="/specs" className="hover:text-yellow-400 transition-colors">Specs</Link>
          <Link to="/rfqs" className="hover:text-yellow-400 transition-colors">RFQs</Link>
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
