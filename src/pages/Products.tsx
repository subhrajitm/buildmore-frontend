import React from 'react';
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../data/mockData';

interface ProductsProps {
  isDark: boolean;
}

export const Products: React.FC<ProductsProps> = ({ isDark }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1.5px] bg-yellow-400"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Enterprise Catalog</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Procurement HUB</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sort By:</span>
            <button className={`text-[10px] font-black flex items-center gap-2 uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Price Engine <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className={`p-2 rounded-lg border cursor-pointer hover:bg-yellow-400 hover:text-black transition-colors ${isDark ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <Filter className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 space-y-8">
          <div className="space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Verticals</h3>
            <div className="space-y-2">
              {['Pneumatic Tools', 'Heavy Machinery', 'Safety Protocol', 'Raw Materials', 'Fasteners'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isDark ? 'border-white/10 bg-white/5 group-hover:border-yellow-400' : 'border-slate-200 bg-slate-50 group-hover:border-slate-900'}`}>
                    <div className="w-2 h-2 bg-yellow-400 rounded-sm opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Procurement Tier</h3>
            <div className="space-y-2">
              {['Standard Export', 'Bulk Distribution', 'LTL Freight Only', 'Custom Fab'].map(tier => (
                <label key={tier} className="flex items-center gap-3 cursor-pointer group">
                   <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isDark ? 'border-white/10 bg-white/5 group-hover:border-yellow-400' : 'border-slate-200 bg-slate-50 group-hover:border-slate-900'}`}>
                    <div className="w-2 h-2 bg-yellow-400 rounded-sm opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>{tier}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} isDark={isDark} />
            ))}
            {PRODUCTS.map(product => (
              <ProductCard key={`dup-${product.id}`} product={{...product, id: product.id + 10}} isDark={isDark} />
            ))}
          </div>

          <div className="flex justify-center pt-10">
             <button className="bg-yellow-400 text-black px-12 py-4 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-all shadow-xl flex items-center gap-3">
              Load More Inventory <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

