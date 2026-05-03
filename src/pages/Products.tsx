import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Star, ChevronDown, Heart, Layers, Package, ArrowRight, Loader2, Filter, Grid3X3, List, Box, Info } from 'lucide-react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { productApi, categoryApi, BackendProduct, Category } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';
import { getCategoryMeta } from '../utils/categoryMeta';
import { formatPrice } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rated', value: 'rating' },
];

// ─── Ultra-Compact Premium Product Card ──────────────────────────────────────
const ProductCard: React.FC<{ product: any; className?: string }> = ({ product, className = '' }) => {
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
    e.preventDefault(); e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('buildmore_wishlist') || '[]');
      const id = String(product.id);
      const updated = next ? [...saved, id] : saved.filter(wid => wid !== id);
      localStorage.setItem('buildmore_wishlist', JSON.stringify(updated));
    } catch {}
  };

  return (
    <Link to={`/product/${product.id}`} className={`group relative flex flex-col ${className}`}>
      <div className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${isDark ? 'bg-[#0a0a0a] border-white/10 hover:border-yellow-400/50' : 'bg-white border-slate-200 hover:border-yellow-400'}`}>
        {/* Compact Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-3">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <button
            onClick={handleWishlist}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform active:scale-90"
          >
            <Heart className={`w-3 h-3 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500 border-none' : 'text-white'}`} />
          </button>
        </div>

        {/* Info Area - Even More Compact */}
        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-400/5 px-1.5 py-0.5 rounded border border-yellow-400/10 truncate max-w-[50px]">{product.category}</span>
            {product.rating && (
              <div className="flex items-center gap-0.5 text-[7px] font-black text-slate-400">
                <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                {product.rating}
              </div>
            )}
          </div>
          <h3 className={`font-bold text-[11px] leading-[1.2] line-clamp-2 h-[26px] tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-white/5">
            <span className={`text-[13px] font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(product.price)}</span>
            <button 
              onClick={handleAdd}
              className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                added 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
            >
              {added ? '✓' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Main Catalog Page ─────────────────────────────────────────────────────────
export const Products: React.FC = () => {
  const { isDark } = useTheme();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [subCatOpen, setSubCatOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const subCatRef = useRef<HTMLDivElement>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      productApi.getAll({ limit: 500 }),
      categoryApi.getAll()
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
    })
    .catch((err) => {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
    })
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (categorySlug) {
      const found = categories.find(c => c.slug === categorySlug);
      if (found) setSelectedCategory(found.name);
    } else if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory(null);
    }
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [categorySlug, categories, searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortOpen && sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
      if (subCatOpen && subCatRef.current && !subCatRef.current.contains(e.target as Node)) {
        setSubCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen, subCatOpen]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(p => {
        const pCat = typeof p.category === 'object' && p.category ? (p.category as any).name : p.category;
        return p.productName.toLowerCase().includes(q) || (pCat && pCat.toLowerCase().includes(q));
      });
    }
    if (selectedCategory) {
      const catObj = categories.find(c => c.name.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      result = result.filter(p => {
        if (typeof p.category === 'object' && p.category) {
          return (p.category as any).name?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
        }
        // p.category is a string — could be ObjectId or category name
        if (catObj && p.category === catObj._id) return true;
        return p.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
      });
    }
    if (selectedSubcategory) {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
      case 'rating': result.sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0)); break;
    }
    return result;
  }, [debouncedSearch, selectedCategory, selectedSubcategory, sortBy, products, categories]);

  const activeCategoryObj = categories.find(c => c.name === selectedCategory);
  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy)!;

  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const sidebarBg = isDark ? 'bg-[#080808]' : 'bg-[#fcfcfc]';
  const borderClass = isDark ? 'border-white/[0.04]' : 'border-slate-100';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-500' : 'text-slate-400';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initializing Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 px-6">
        <p className="text-red-400 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-xs text-yellow-400">Retry</button>
      </div>
    );
  }

  return (
    <div className={`max-w-[1920px] mx-auto flex flex-col h-[calc(100vh-80px)] overflow-hidden border ${borderClass} ${bgClass} shadow-2xl relative`}>
      {/* ── Control Bar ── */}
      <div className={`px-3 sm:px-6 py-2 border-b ${borderClass} ${isDark ? 'bg-[#050505]' : 'bg-white'} flex items-center justify-between gap-2 z-30`}>
        {/* Left: Breadcrumbs — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 shrink-0">
          <Link to="/" className="hover:text-yellow-400 transition-colors">InfraMart</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-yellow-400">Products</span>
          {selectedCategory && (
            <>
              <ChevronRight className="w-2.5 h-2.5" />
              <span className="text-yellow-500 truncate max-w-[100px]">{selectedCategory}</span>
            </>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Top Bar Search */}
          <div className={`relative w-28 sm:w-48 flex items-center px-3 py-1.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/10 focus-within:border-yellow-400/50' : 'bg-slate-50 border-slate-200 focus-within:border-yellow-400'} transition-all`}>
            <Search className="w-3 h-3 text-slate-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className={`flex-1 bg-transparent px-2 text-[9px] font-black uppercase outline-none ${isDark ? 'text-white placeholder-slate-700' : 'text-slate-900 placeholder-slate-400'}`}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-2.5 h-2.5 text-slate-500" /></button>}
          </div>

          {/* Sub Category Dropdown */}
          {activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
            <div className="relative" ref={subCatRef}>
              <button
                onClick={() => setSubCatOpen(!subCatOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 border ${borderClass} text-[9px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/[0.03] text-slate-300 hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                {selectedSubcategory || 'All Types'}
                <ChevronDown className={`w-3 h-3 transition-transform ${subCatOpen ? 'rotate-180' : ''}`} />
              </button>
              {subCatOpen && (
                <div className={`absolute right-0 top-full mt-1 w-48 border shadow-2xl z-[70] overflow-hidden ${isDark ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-100'}`}>
                  <button
                    onClick={() => { setSelectedSubcategory(null); setSubCatOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors ${!selectedSubcategory ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All {selectedCategory}
                  </button>
                  {activeCategoryObj.subcategories.map(sub => (
                    <button
                      key={sub._id}
                      onClick={() => { setSelectedSubcategory(sub.name); setSubCatOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors ${selectedSubcategory === sub.name ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sort Icon Button */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`w-8 h-7.5 flex items-center justify-center border ${borderClass} transition-all ${isDark ? 'bg-white/[0.03] text-slate-300 hover:bg-white/10' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}
            >
              <Filter className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className={`absolute right-0 top-full mt-1 w-44 border shadow-2xl z-[70] overflow-hidden ${isDark ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-100'}`}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-colors ${sortBy === opt.value ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Compact Sidebar ── */}
        <aside className={`w-[200px] flex-shrink-0 border-r ${borderClass} ${sidebarBg} overflow-y-auto hidden lg:flex flex-col`}>
          <nav className="p-3 pt-5 flex-1 space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left group ${
                  !selectedCategory 
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10' 
                    : `${isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`
              }`}
            >
              <Grid3X3 className={`w-3.5 h-3.5 ${!selectedCategory ? 'text-black' : 'text-slate-600'}`} />
              <span className="text-[9px] font-black uppercase tracking-widest">All Items</span>
            </button>

            <div className="pt-3 pb-1 px-3">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">Groups</span>
            </div>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              const meta = getCategoryMeta(cat.name);
              return (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedSubcategory(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-left group ${
                    isActive 
                      ? 'bg-yellow-400 text-black shadow shadow-yellow-400/10' 
                      : `${isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`
                  }`}
                >
                  <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive ? 'bg-black/10' : isDark ? 'bg-zinc-900' : 'bg-white border border-slate-100'
                  }`}>
                    <meta.icon className={`w-3 h-3 ${isActive ? 'text-black' : isDark ? 'text-slate-500 group-hover:text-yellow-400' : 'text-slate-500 group-hover:text-yellow-500'}`} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tight flex-1 truncate">{cat.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Catalog Area ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Dynamic Product Grid - Increased Density */}
          <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar ${isDark ? 'bg-[#0a0a0a]' : 'bg-slate-50/30'}`}>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                {filteredProducts.map(p => (
                  <ProductCard key={p._id} product={normalizeProduct(p)} />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${borderClass} flex items-center justify-center animate-pulse`}>
                  <Package className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className={`text-xs font-black uppercase tracking-tight ${textClass}`}>No materials match</h3>
                  <button 
                    onClick={() => { setSearch(''); setSelectedCategory(null); setSelectedSubcategory(null); }}
                    className="mt-4 px-5 py-2 bg-yellow-400 text-black rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-yellow-300"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Status Overlay */}
      <div className="absolute bottom-4 left-4 lg:left-52 flex items-center gap-4 z-40 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black ${textClass}`}>{filteredProducts.length}</span>
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">SKUs</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black ${textClass}`}>{categories.length}</span>
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Groups</span>
        </div>
      </div>
    </div>
  );
};
