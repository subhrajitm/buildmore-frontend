import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { TrustSignals } from '../components/TrustSignals';
import { PRODUCTS, TESTIMONIALS } from '../data/mockData';

interface LandingProps {
  isDark: boolean;
}

export const Landing: React.FC<LandingProps> = ({ isDark }) => {
  return (
    <>
      <Hero isDark={isDark} />
      
      <CategoryGrid isDark={isDark} />

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[1.5px] bg-yellow-400"></span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Inventory Drops</span>
            </div>
            <h2 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Infrastructure Deals</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 border px-4 py-2 rounded-lg shadow-sm ${isDark ? 'bg-zinc-800 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Window Closes:</span>
              <span className={`text-base font-mono font-black ${isDark ? 'text-yellow-400' : 'text-slate-900'}`}>08:42:12</span>
            </div>
            <Link to="/products" className={`text-[10px] font-black hover:text-yellow-400 transition-all flex items-center gap-2 uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} isDark={isDark} />
          ))}
        </div>
      </section>

      <TrustSignals isDark={isDark} />

      <section className="space-y-10 pb-10">
        <div className="text-center space-y-2">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-yellow-400">Global Impact</span>
          <h2 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>The Infrastructure Standard</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className={`p-8 rounded-xl border group shadow-sm transition-colors duration-300 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100'}`}>
              <div className="flex text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide italic">"{t.quote}"</p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">
                  <span className="text-sm font-black text-black">{t.author.charAt(0)}</span>
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.author}</p>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
