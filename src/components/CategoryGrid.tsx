import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryGridProps {
  isDark: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ isDark }) => (
  <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-5 py-4 font-primary">
    {/* Featured Collection Card */}
    <Link
      to="/products"
      className={`col-span-1 md:col-span-2 row-span-2 ${isDark ? 'bg-zinc-800 border-white/5 hover:border-yellow-400/40 bg-gradient-to-br from-zinc-800 to-zinc-900' : 'bg-slate-50 border-slate-100 hover:border-yellow-400/50 bg-gradient-to-br from-white to-slate-50'} p-8 rounded-2xl border flex flex-col justify-between relative overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500`}
    >
      <div className={`absolute top-0 right-0 w-72 h-72 ${isDark ? 'bg-yellow-400/10' : 'bg-yellow-400/20'} rounded-full blur-3xl -mr-28 -mt-28 group-hover:scale-125 transition-transform duration-700`}></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[2.5px] bg-yellow-400 rounded-full"></span>
          <span className="text-[10px] font-black text-yellow-400 tracking-widest uppercase">Premium Selection</span>
        </div>
        <h3 className={`text-4xl font-black tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'} leading-[1.1]`}>Structural <br />Materials</h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">Expertly curated high-performance materials for heavy construction.</p>
      </div>
      <div className="relative z-10 mt-6 group-hover:translate-x-2 transition-transform duration-500">
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000"
          alt="Structural Materials"
          className="w-full h-36 object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl border border-white/10"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="relative z-10 mt-6 flex items-center justify-between">
        <span className={`text-xs font-black flex items-center gap-2 group-hover:text-yellow-400 transition-all ${isDark ? 'text-white' : 'text-slate-900'}`}>
          View Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
          240+ New arrivals
        </div>
      </div>
    </Link>

    {/* Dynamic Category Cards */}
    {CATEGORIES.map((cat, idx) => (
      <Link
        key={idx}
        to={`/products?category=${encodeURIComponent(cat.name)}`}
        className={`${isDark ? 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800' : 'bg-white border-slate-200 hover:bg-slate-50'} p-5 rounded-2xl border group cursor-pointer hover:border-yellow-400 transition-all duration-300 flex flex-col relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1`}
      >
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
            {cat.count.toLocaleString()}
          </span>
        </div>
        
        <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all duration-500 shadow-md ${isDark ? 'bg-zinc-800 text-white group-hover:bg-yellow-400 group-hover:text-black' : 'bg-slate-100 text-slate-700 group-hover:bg-yellow-400 group-hover:text-black'}`}>
          <cat.icon className="w-5 h-5" />
        </div>
        
        <h4 className={`font-black text-xs mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.name}</h4>
        <p className="text-[10px] text-slate-500 font-medium mb-3">{cat.desc}</p>
        
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex flex-wrap gap-2">
            {cat.subcategories.slice(0, 3).map((sub, sidx) => (
              <span key={sidx} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-100 text-slate-500'}`}>
                {sub}
              </span>
            ))}
          </div>
        </div>
      </Link>
    ))}
  </section>
);
