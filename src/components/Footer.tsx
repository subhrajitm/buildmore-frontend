import React from 'react';
import { BarChart3, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark }) => (
  <footer className={`${isDark ? 'bg-zinc-900 text-slate-400 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'} pt-16 pb-8 border-t transition-colors duration-300`}>
    <div className="max-w-[1920px] mx-auto px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-sm flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <span className={`text-xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Build<span className="text-yellow-400">More</span></span>
          </div>
          <p className="text-[9px] leading-relaxed max-w-xs font-bold uppercase tracking-wider text-slate-500">
            The unified operating system for global procurement. Verified manufacturers and technical precision.
          </p>
        </div>
        
        <div className="space-y-4">
          <h5 className={`font-black text-[9px] uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Operations</h5>
          <ul className="space-y-2 text-[9px] font-black uppercase tracking-widest">
            <li><Link to="/products" className="hover:text-yellow-400 transition-colors">Bulk Orders</Link></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Price Engine</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Logistics</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className={`font-black text-[9px] uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support</h5>
          <ul className="space-y-2 text-[9px] font-black uppercase tracking-widest">
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">SDS Sheets</a></li>
            <li><a href="#" className="hover:text-yellow-400 transition-colors">Returns</a></li>
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          <h5 className={`font-black text-[9px] uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Intelligence</h5>
          <div className="flex group">
            <input 
              type="email" 
              placeholder="ENTERPRISE EMAIL" 
              className={`border rounded-l-sm text-[8px] font-black py-3 px-4 w-full outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:ring-yellow-400' : 'bg-white border-slate-200 text-slate-900 focus:ring-slate-900'}`}
            />
            <button className={`px-4 rounded-r-sm transition-colors ${isDark ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-slate-900 text-white hover:bg-black'}`}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className={`border-t pt-8 flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <p className="text-[8px] font-black tracking-[0.4em] uppercase text-slate-500">
          © 2026 BuildMore. v4.2.0-STABLE
        </p>
      </div>
    </div>
  </footer>
);
