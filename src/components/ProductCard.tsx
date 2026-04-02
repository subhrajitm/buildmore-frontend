import React, { useState } from 'react';
import { Search, Star, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: any;
  isDark: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isDark }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`rounded-xl overflow-hidden flex flex-col border transition-all group shadow-sm ${isDark ? 'bg-zinc-900 border-white/5 hover:border-yellow-400/20' : 'bg-white border-slate-100 hover:border-yellow-400/40 hover:shadow-xl'}`}>
      <div className={`relative h-48 flex items-center justify-center p-6 transition-colors duration-300 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
        <img
          src={product.image}
          alt={product.name}
          className={`max-h-full object-contain transition-all duration-700 ${isDark ? 'grayscale group-hover:grayscale-0' : 'grayscale-0'}`}
          referrerPolicy="no-referrer"
        />
        {product.discount && (
          <span className="absolute top-3 left-3 bg-yellow-400 text-black text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
            {product.discount}
          </span>
        )}
        <Link to={`/product/${product.id}`} className="absolute bottom-3 right-3 p-2.5 bg-yellow-400 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
          <Search className="w-3.5 h-3.5 text-black" />
        </Link>
      </div>
      <div className="p-4 flex-1 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500">ID: {product.id}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.rating}</span>
          </div>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 h-10 hover:text-yellow-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {product.name}
          </h3>
        </Link>
        <div className="pt-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-slate-500 line-through font-bold">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          {product.bulkInfo && (
            <div className={`${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'} text-[10px] font-bold px-2 py-1 rounded-md inline-block mt-2`}>
              {product.bulkInfo}
            </div>
          )}
        </div>
        <div className="pt-4 mt-auto">
          <button
            onClick={handleAdd}
            className={`w-full text-sm font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-yellow-400 text-black hover:bg-yellow-300'
            }`}
          >
            {added ? (
              <><Check className="w-4 h-4" /> Added to Cart</>
            ) : (
              <>{product.isTechnical ? 'View Details' : 'Add to Cart'}<ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
