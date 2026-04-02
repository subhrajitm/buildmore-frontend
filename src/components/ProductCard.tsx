import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Search, Star, ArrowRight, Check, Truck, ShieldCheck, Zap } from 'lucide-react';

interface ProductCardProps {
  product: any;
  isDark: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isDark }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`rounded-[20px] overflow-hidden flex flex-col border transition-all duration-500 group relative ${isDark ? 'bg-zinc-900 border-white/5 hover:border-yellow-400/30' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
      {/* Visual Header - Compact */}
      <div className={`relative h-40 flex items-center justify-center p-6 transition-colors duration-500 overflow-hidden ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
        <img
          src={product.image}
          alt={product.name}
          className={`max-h-full object-contain transition-all duration-700 group-hover:scale-105 ${isDark ? 'grayscale group-hover:grayscale-0' : 'grayscale-0'}`}
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount && (
            <span className="bg-yellow-400 text-black text-[8px] font-black px-2 py-1 rounded shadow-xl uppercase tracking-tighter">
              -{product.discount}
            </span>
          )}
          <span className={`text-[7px] font-black px-2 py-1 rounded shadow-xl uppercase tracking-widest ${isDark ? 'bg-black/60 text-white' : 'bg-white/90 text-slate-900'}`}>
            {product.category}
          </span>
        </div>

        <Link to={`/product/${product.id}`} className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/5">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
            <Search className="w-4 h-4 text-black" />
          </div>
        </Link>
      </div>

      {/* Content Section - Compact */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">BM-{product.id}</span>
          <div className="flex items-center gap-1">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
            <span className={`text-[9px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.rating}</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className={`font-black text-xs leading-tight tracking-tight h-8 line-clamp-2 transition-colors ${isDark ? 'text-white group-hover:text-yellow-400' : 'text-slate-900 group-hover:text-yellow-400'}`}>
            {product.name}
          </h3>
        </Link>

        {/* Technical Data Points - Inline */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <Truck className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">24H</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">CERT</span>
          </div>
        </div>

        <div className="pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${product.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-2 mt-auto">
          <button
            onClick={handleAdd}
            className={`w-full text-[9px] font-black uppercase tracking-widest py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-yellow-400 text-black hover:bg-yellow-300'
            }`}
          >
            {added ? (
              <><Check className="w-3.5 h-3.5" /> Added</>
            ) : (
              <>{product.isTechnical ? 'Details' : 'Pipeline'}<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
