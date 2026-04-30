import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Loader2, Package } from 'lucide-react';
import { productApi, BackendProduct } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';
import { formatPrice } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const Wishlist: React.FC = () => {
  const { isDark } = useTheme();
  const { addItem } = useCart();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const getIds = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('buildmore_wishlist') || '[]');
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const ids = getIds();
    setWishlistIds(ids);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(ids.map(id => productApi.getById(id).then(r => r.product).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean) as BackendProduct[]))
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = (id: string) => {
    const updated = wishlistIds.filter(wid => wid !== id);
    setWishlistIds(updated);
    setProducts(prev => prev.filter(p => p._id !== id));
    localStorage.setItem('buildmore_wishlist', JSON.stringify(updated));
  };

  const cardBg = isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-500 fill-current" />
        </div>
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tighter ${textClass}`}>
            My Wishlist
          </h1>
          <p className={`text-xs font-bold uppercase tracking-widest ${mutedClass}`}>
            {products.length} saved {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
          <p className={`text-xs font-black uppercase tracking-widest ${mutedClass}`}>Loading wishlist...</p>
        </div>
      ) : products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-40 gap-6 rounded-3xl border-2 border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Heart className="w-10 h-10 text-red-400 opacity-50" />
          </div>
          <div className="text-center">
            <p className={`text-sm font-black uppercase tracking-widest ${textClass}`}>Your wishlist is empty</p>
            <p className={`text-xs font-bold ${mutedClass} mt-1`}>Save items you love by clicking the heart icon on any product.</p>
          </div>
          <Link
            to="/products"
            className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => {
            const norm = normalizeProduct(p);
            return (
              <div key={p._id} className={`group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${cardBg}`}>
                <Link to={`/product/${p._id}`} className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <img src={norm.image} alt={norm.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button
                    onClick={e => { e.preventDefault(); removeFromWishlist(p._id); }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">{norm.category}</span>
                  <Link to={`/product/${p._id}`} className={`text-sm font-black line-clamp-2 group-hover:text-yellow-400 transition-colors leading-snug ${textClass}`}>
                    {norm.name}
                  </Link>
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <span className={`text-lg font-black ${textClass}`}>{formatPrice(norm.price)}</span>
                    <button
                      onClick={() => addItem(norm)}
                      className="flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-slate-400" />
                    <span className={`text-[9px] font-bold uppercase ${p.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
