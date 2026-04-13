import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, X, ShoppingBag, Heart, Star, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { productApi, BackendProduct } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';
import { formatPrice } from '../utils/currency';

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

const PRICE_RANGES = [
  { label: 'Under ₹4,000', min: 0, max: 50 },
  { label: '₹4,000 - ₹8,000', min: 50, max: 100 },
  { label: '₹8,000 - ₹17,000', min: 100, max: 200 },
  { label: '₹17,000 - ₹42,000', min: 200, max: 500 },
  { label: 'Over ₹42,000', min: 500, max: Infinity },
];

const RATING_FILTERS = [
  { label: '4★ & above', min: 4 },
  { label: '3★ & above', min: 3 },
  { label: '2★ & above', min: 2 },
  { label: '1★ & above', min: 1 },
];

export const Products: React.FC<ProductsProps> = ({ isDark }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get('category');
    return cat ? [cat] : [];
  });
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    productApi.getCategories()
      .then(res => setCategories(res.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const category = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
    productApi.getAll(category ? { category } : undefined)
      .then(res => setProducts(res.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategories]);

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat || q) {
      if (cat) setSelectedCategories([cat]);
      if (q) setSearch(q);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const togglePriceRange = (idx: number) => {
    setSelectedPriceRanges(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedRating(null);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSearch('');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRanges.length > 0 || selectedRating !== null || inStockOnly || onSaleOnly;

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p => 
        p.productName.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter(p => {
        return selectedPriceRanges.some(idx => {
          const range = PRICE_RANGES[idx];
          return p.price >= range.min && (range.max === Infinity || p.price < range.max);
        });
      });
    }

    if (selectedRating !== null) {
      result = result.filter(p => (p as any).rating >= selectedRating);
    }

    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    if (onSaleOnly) {
      result = result.filter(p => (p as any).discount);
    }

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
      case 'rating': result.sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0)); break;
    }
    return result;
  }, [search, selectedCategories, selectedPriceRanges, selectedRating, inStockOnly, onSaleOnly, sortBy, products]);

  const visible = filtered.slice(0, visibleCount);
  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy)!;

  const sidebarClass = isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200';
  const activeFiltersCount = selectedCategories.length + selectedPriceRanges.length + (selectedRating !== null ? 1 : 0) + (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0);

  return (
    <div className="max-w-[1920px] mx-auto pb-32">
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'} ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-bold">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {selectedCategories.length > 0 ? selectedCategories[0] : 'All Products'}
              <span className={`ml-2 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                ({filtered.length} items)
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className={`hidden md:flex items-center p-1 rounded-lg border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-bold ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              >
                <span>{currentSort.label}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
                        sortBy === opt.value
                          ? 'bg-yellow-400 text-black'
                          : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${filterOpen ? 'block' : 'hidden'}
          lg:block
          w-64 flex-shrink-0 border-r ${isDark ? 'border-white/10' : 'border-slate-200'} 
          ${isDark ? 'bg-zinc-900' : 'bg-white'} sticky top-[137px] h-[calc(100vh-137px)] overflow-y-auto p-6
        `}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Filters</h2>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-bold text-yellow-400 hover:text-yellow-300">
                Clear all
              </button>
            )}
          </div>

          {/* Categories with counts */}
          <div className="mb-8">
            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</h3>
            <div className="space-y-3">
              {categories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                const count = products.filter(p => p.category === cat).length;
                return (
                  <label key={cat} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}>
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleCategory(cat)}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {cat}
                      </span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      ({count})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Price Range</h3>
            <div className="space-y-3">
              {PRICE_RANGES.map((range, idx) => {
                const isSelected = selectedPriceRanges.includes(idx);
                return (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}>
                      {isSelected && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => togglePriceRange(idx)}
                      className="hidden"
                    />
                    <span className={`text-sm font-medium ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {range.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-8">
            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rating</h3>
            <div className="space-y-3">
              {RATING_FILTERS.map((rating, idx) => {
                const isSelected = selectedRating === rating.min;
                return (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => setSelectedRating(isSelected ? null : rating.min)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${star <= rating.min ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                        />
                      ))}
                      <span className={`text-sm font-medium ml-1 ${isSelected ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        & Up
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Availability</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${inStockOnly ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}>
                  {inStockOnly && <Check className="w-3 h-3 text-black" />}
                </div>
                <input 
                  type="checkbox" 
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="hidden"
                />
                <span className={`text-sm font-medium ${inStockOnly ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  In Stock Only
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${onSaleOnly ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}>
                  {onSaleOnly && <Check className="w-3 h-3 text-black" />}
                </div>
                <input 
                  type="checkbox" 
                  checked={onSaleOnly}
                  onChange={() => setOnSaleOnly(!onSaleOnly)}
                  className="hidden"
                />
                <span className={`text-sm font-medium ${onSaleOnly ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  On Sale
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Mobile Search & Sort */}
          <div className="lg:hidden mb-6 space-y-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(12); }}
                placeholder="Search products..."
                className={`flex-1 bg-transparent text-sm font-medium outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-yellow-400 text-black'
                      : isDark ? 'bg-zinc-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Mobile Sort */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold whitespace-nowrap ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
              >
                <span>{currentSort.label}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`p-2 rounded-lg border ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map(cat => (
                <span key={cat} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  {cat}
                  <button onClick={() => toggleCategory(cat)} className="hover:text-yellow-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedPriceRanges.map(idx => (
                <span key={idx} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  {PRICE_RANGES[idx].label}
                  <button onClick={() => togglePriceRange(idx)} className="hover:text-yellow-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedRating !== null && (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  {selectedRating}★ & Up
                  <button onClick={() => setSelectedRating(null)} className="hover:text-yellow-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  In Stock
                  <button onClick={() => setInStockOnly(false)} className="hover:text-yellow-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {onSaleOnly && (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  On Sale
                  <button onClick={() => setOnSaleOnly(false)} className="hover:text-yellow-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid/List */}
          {loading ? (
            <div className={`flex flex-col items-center justify-center py-32 gap-4`}>
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-500">Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <Search className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No products found</h3>
              <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or search</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2 bg-yellow-400 text-black text-sm font-bold rounded-xl hover:bg-yellow-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0' : 'space-y-0'}>
              {visible.map(product => (
                <ProductCard key={product._id} product={normalizeProduct(product)} isDark={isDark} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Load More */}
          {visible.length < filtered.length && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setVisibleCount(c => c + 20)}
                className="px-8 py-3 bg-yellow-400 text-black text-sm font-black rounded-xl hover:bg-yellow-300 transition-colors"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setFilterOpen(false)}>
          <div className={`absolute right-0 top-0 h-full w-80 ${sidebarClass} p-6 overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Filters</h2>
              <button onClick={() => setFilterOpen(false)} className="p-2">
                <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded accent-yellow-400"
                      />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={clearFilters} className={`flex-1 py-3 rounded-xl border text-sm font-bold ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                Clear
              </button>
              <button onClick={() => setFilterOpen(false)} className="flex-1 py-3 bg-yellow-400 text-black rounded-xl text-sm font-bold">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}