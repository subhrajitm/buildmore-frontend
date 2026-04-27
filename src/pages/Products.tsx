import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Star, ChevronDown, Heart } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi, BackendProduct } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';
import { getCategoryMeta, TOP_CATEGORIES, ALL_CATEGORIES } from '../utils/categoryMeta';
import { formatPrice } from '../utils/currency';
import { useCart } from '../context/CartContext';

interface ProductsProps {
  isDark: boolean;
}

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rated', value: 'rating' },
];

// ─── Swiggy-style product card ─────────────────────────────────────────────────
function ProductCard({ product, isDark, className = '' }: { product: any; isDark: boolean; className?: string }) {
  const { addItem } = useCart();
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

  return (
    <Link to={`/products/${product.id}`} className={`group ${className}`}>
      <div className={`rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isDark ? 'bg-zinc-900 border-white/10 hover:border-yellow-400/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>

        {/* Image with overlay */}
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white text-sm font-black tracking-wide drop-shadow">
              FROM {formatPrice(product.price)}
            </span>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
          </button>

          {/* Discount badge */}
          {product.discount && (
            <div className="absolute top-2.5 left-2.5 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
              {product.discount}% OFF
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className={`font-bold text-sm leading-snug mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{typeof product.rating === 'number' ? product.rating.toFixed(1) : '4.0'}</span>
            </div>
            <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
            <span className={`text-[10px] font-semibold ${product.stock > 0 ? isDark ? 'text-green-400' : 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <p className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {product.category}
          </p>

          <button
            onClick={handleAdd}
            className={`mt-2.5 w-full py-1.5 rounded-xl text-xs font-black transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95'
            }`}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Horizontal scroll row with L/R arrows ────────────────────────────────────
function ScrollSection({ title, isDark, children }: { title: string; isDark: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -480 : 480, behavior: 'smooth' });
  };

  return (
    <section className="py-7">
      <div className="flex items-center justify-between px-6 mb-5">
        <h2 className={`text-[22px] font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto px-6 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export const Products: React.FC<ProductsProps> = ({ isDark }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const catScrollRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    () => searchParams.get('category') || null
  );
  const [selectedTopSlug, setSelectedTopSlug] = useState<string | null>(
    () => searchParams.get('group') || null
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    productApi.getAll()
      .then(res => setProducts(res.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const group = searchParams.get('group');
    const q = searchParams.get('search');
    if (cat) setSelectedCategory(cat);
    if (group) setSelectedTopSlug(group);
    if (q) setSearch(q);
    if (cat || group || q) setSearchParams({}, { replace: true });
  }, [searchParams]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTopSlug(null);
    setSelectedSubcategory(null);
    setSearch('');
  };

  const isFiltering = !!(selectedCategory || selectedTopSlug || search.trim());

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
    } else if (selectedTopSlug) {
      const top = TOP_CATEGORIES.find(t => t.slug === selectedTopSlug);
      if (top) result = result.filter(p => top.categories.some(c => c.trim().toLowerCase() === p.category?.trim().toLowerCase()));
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
  }, [search, selectedCategory, selectedTopSlug, selectedSubcategory, sortBy, products]);

  const scrollCat = (dir: 'left' | 'right') => {
    catScrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy)!;

  return (
    <div className={`max-w-[1440px] mx-auto pb-32 ${isDark ? 'bg-black' : 'bg-white'}`}>

      {/* ── Search + Sort bar ── */}
      <div className={`px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search building materials..."
              className={`flex-1 bg-transparent text-sm font-medium outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-yellow-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              {currentSort.label}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className={`absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${sortBy === opt.value ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isFiltering && (
            <button onClick={clearFilters} className="shrink-0 text-xs font-bold text-yellow-500 hover:text-yellow-400">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Category circles ── */}
      <div className="py-7">
        <div className="flex items-center justify-between px-6 mb-5">
          <h2 className={`text-[22px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>What are you looking for?</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCat('left')}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCat('right')}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={catScrollRef}
          className="flex gap-7 overflow-x-auto px-6 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ALL_CATEGORIES.map(cat => {
            const meta = getCategoryMeta(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat);
                  setSelectedSubcategory(null);
                }}
                className="flex flex-col items-center gap-2.5 shrink-0 group"
              >
                <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center transition-all border-2 ${
                  isSelected
                    ? 'bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/25'
                    : isDark
                    ? 'bg-zinc-800 border-transparent group-hover:border-yellow-400/40 group-hover:bg-zinc-700'
                    : 'bg-slate-100 border-transparent group-hover:border-yellow-300 group-hover:bg-yellow-50'
                }`}>
                  <meta.icon className={`w-9 h-9 transition-colors ${isSelected ? 'text-black' : isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                </div>
                <span className={`text-xs font-semibold text-center max-w-[88px] leading-tight transition-colors ${
                  isSelected ? 'text-yellow-500' : isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Subcategory pills (shown when a category is selected) ── */}
      {selectedCategory && (() => {
        const subs = getCategoryMeta(selectedCategory).subcategories;
        return (
          <div className={`border-t px-6 py-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <div
              className="flex items-center gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  !selectedSubcategory
                    ? 'bg-yellow-400 border-yellow-400 text-black'
                    : isDark
                    ? 'border-white/15 text-slate-400 hover:border-yellow-400/50 hover:text-yellow-400'
                    : 'border-slate-200 text-slate-500 hover:border-yellow-400 hover:text-yellow-600'
                }`}
              >
                All
              </button>
              {subs.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? null : sub)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedSubcategory === sub
                      ? 'bg-yellow-400 border-yellow-400 text-black'
                      : isDark
                      ? 'border-white/15 text-slate-400 hover:border-yellow-400/50 hover:text-yellow-400'
                      : 'border-slate-200 text-slate-500 hover:border-yellow-400 hover:text-yellow-600'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {!selectedCategory && <div className={`border-t mx-6 ${isDark ? 'border-white/10' : 'border-slate-100'}`} />}

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading products...</p>
        </div>

      ) : isFiltering ? (
        /* ── Filtered grid view ── */
        <div className="px-6 pt-7">
          <div className="mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedCategory ?? (selectedTopSlug ? (TOP_CATEGORIES.find(t => t.slug === selectedTopSlug)?.name ?? 'Results') : 'Search Results')}
              </h2>
              {selectedSubcategory && (
                <span className="flex items-center gap-1.5 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full">
                  {selectedSubcategory}
                  <button onClick={() => setSelectedSubcategory(null)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <Search className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className={`text-base font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No products found</h3>
              <p className="text-xs text-slate-500 mb-4">Try a different search or category</p>
              <button onClick={clearFilters} className="px-5 py-2 bg-yellow-400 text-black text-xs font-black rounded-xl hover:bg-yellow-300 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={normalizeProduct(product)} isDark={isDark} className="w-full" />
              ))}
            </div>
          )}
        </div>

      ) : (
        /* ── Default: horizontal scroll sections per TOP_CATEGORY ── */
        <div>
          {TOP_CATEGORIES.map((top, idx) => {
            const catProducts = products.filter(p => top.categories.some(c => c.trim().toLowerCase() === p.category?.trim().toLowerCase()));
            if (catProducts.length === 0) return null;
            return (
              <React.Fragment key={top.slug}>
                <ScrollSection title={top.name} isDark={isDark}>
                  {catProducts.map(product => (
                    <ProductCard
                      key={product._id}
                      product={normalizeProduct(product)}
                      isDark={isDark}
                      className="shrink-0 w-56"
                    />
                  ))}
                </ScrollSection>
                {idx < TOP_CATEGORIES.length - 1 && (
                  <div className={`border-t mx-6 ${isDark ? 'border-white/10' : 'border-slate-100'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
