import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: any;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addItem } = useCart();
  const { isDark } = useTheme();
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('buildmore_wishlist') || '[]');
      return saved.includes(String(product.id));
    } catch { return false; }
  });

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('buildmore_wishlist') || '[]');
      const id = String(product.id);
      const updated = next ? [...saved, id] : saved.filter(wid => wid !== id);
      localStorage.setItem('buildmore_wishlist', JSON.stringify(updated));
    } catch {}
  };

  if (viewMode === 'list') {
    return (
      <div className={`group relative flex gap-0 p-2 rounded-2xl border overflow-hidden transition-all hover:shadow-xl ${isDark ? 'bg-zinc-900 border-white/10 hover:border-yellow-400/30' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
        {/* Image */}
        <div className={`w-36 h-36 flex-shrink-0 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                  {product.category} • SKU: BM-{String(product.id).slice(-6).toUpperCase()}
                </span>
                <Link to={`/product/${product.id}`}>
                  <h3 className={`font-bold text-lg leading-snug mt-1 transition-colors ${isDark ? 'text-white group-hover:text-yellow-400' : 'text-slate-900 group-hover:text-yellow-500'}`}>
                    {product.name}
                  </h3>
                </Link>
              </div>
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-full transition-all ${isWishlisted ? 'bg-red-500 text-white' : isDark ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-white text-slate-400 hover:text-red-500 shadow-md'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {product.desc && (
              <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {product.desc}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className={`text-sm font-medium line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {product.discount} OFF
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to={`/product/${product.id}`}
                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${isDark ? 'border-white/10 text-white hover:border-yellow-400' : 'border-slate-200 text-slate-900 hover:border-slate-400'}`}
              >
                View Details
              </Link>
              <button
                onClick={handleAdd}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-400 text-black hover:bg-yellow-300'
                }`}
              >
                {added ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className={`group relative rounded-2xl border overflow-hidden transition-all hover:shadow-xl ${isDark ? 'bg-zinc-900 border-white/10 hover:border-yellow-400/30' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      {/* Image Section */}
      <div className={`relative h-44 flex items-center justify-center p-2 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-500 text-white' : isDark ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-white/90 text-slate-400 hover:text-red-500 shadow-md'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discount && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded">
              {product.discount} OFF
            </span>
          )}
          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${isDark ? 'bg-black/60 text-white' : 'bg-white/90 text-slate-600'}`}>
            {product.category}
          </span>
        </div>

        {/* Quick View Overlay */}
        <Link 
          to={`/product/${product.id}`} 
          className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40"
        >
          <span className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg shadow-lg">
            Quick View
          </span>
        </Link>
      </div>

      {/* Content Section */}
      <div className="px-2 pb-2 space-y-2">
        {/* Rating */}
        {product.rating != null && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-3 h-3 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                />
              ))}
            </div>
            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 transition-colors ${isDark ? 'text-white group-hover:text-yellow-400' : 'text-slate-900 group-hover:text-yellow-500'}`}>
            {product.name}
          </h3>
        </Link>

        {/* SKU */}
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
          SKU: BM-{String(product.id).slice(-6).toUpperCase()}
        </span>

        {/* Price & Add Button */}
        <div className="flex items-center justify-between pt-2">
          <div>
<span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className={`ml-2 text-sm font-medium line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-yellow-400 text-black hover:bg-yellow-300'
            }`}
          >
            {added ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};