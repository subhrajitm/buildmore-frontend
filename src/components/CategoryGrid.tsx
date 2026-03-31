import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryGridProps {
  isDark: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ isDark }) => (
  <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
    {/* Featured card */}
    <Link
      to="/products"
      className={`col-span-1 md:col-span-2 row-span-2 ${isDark ? 'bg-zinc-800 border-white/5 hover:border-yellow-400/30' : 'bg-slate-50 border-slate-100 hover:border-yellow-400/40'} p-8 rounded-xl border flex flex-col justify-between relative overflow-hidden group shadow-sm transition-all duration-300`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 ${isDark ? 'bg-yellow-400/5' : 'bg-yellow-400/10'} rounded-full blur-3xl -mr-20 -mt-20`}></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-400">Featured Vertical</span>
        </div>
        <h3 className={`text-3xl font-black tracking-tighter mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Structural <br />Components</h3>
        <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs font-medium">High-performance structural binders and reinforced materials.</p>
      </div>
      <div className="relative z-10 mt-6 flex justify-center">
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000"
          alt="Structural Materials"
          className="w-full h-40 object-cover rounded-lg grayscale group-hover:grayscale-0 transition-all duration-700 shadow-xl"
          referrerPolicy="no-referrer"
        />
      </div>
      <span className={`relative z-10 ${isDark ? 'text-white' : 'text-slate-900'} text-[9px] font-black mt-6 flex items-center gap-2 uppercase tracking-widest group-hover:text-yellow-400 transition-all`}>
        Explore All <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>

    {/* Category cards */}
    {CATEGORIES.map((cat, idx) => (
      <Link
        key={idx}
        to={`/products?category=${encodeURIComponent(cat.name)}`}
        className={`${isDark ? 'bg-zinc-900 border-white/5 hover:bg-zinc-800' : 'bg-white border-slate-100 hover:bg-slate-50'} p-6 rounded-xl border group cursor-pointer hover:border-yellow-400/30 transition-all flex flex-col items-start shadow-sm`}
      >
        <div className={`p-3 rounded-lg mb-4 transition-all duration-300 ${isDark ? 'bg-white/5 group-hover:bg-yellow-400 group-hover:text-black text-white' : 'bg-slate-50 group-hover:bg-yellow-400 group-hover:text-black text-slate-700'}`}>
          <cat.icon className="w-5 h-5" />
        </div>
        <h4 className={`font-black text-[11px] uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.name}</h4>
        <p className="text-[9px] text-slate-500 mt-2 font-black uppercase tracking-widest">{cat.desc}</p>
      </Link>
    ))}
  </section>
);
