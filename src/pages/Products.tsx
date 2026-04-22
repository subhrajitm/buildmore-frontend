import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, X, Star, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { productApi, BackendProduct } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';
import { getCategoryMeta } from '../utils/categoryMeta';

interface ProductsProps {
  isDark: boolean;
}

const ALL_CATEGORIES = [
  'Cement & Concrete',
  'Tiles & Flooring',
  'Paints & Finishes',
  'Construction Chemicals',
  'Plywood, Laminates & Boards',
  'Electrical',
  'Lighting & Fans',
  'Electrical Infrastructure',
  'Plumbing & Sanitary',
  'Hardware & Fittings',
  'Kitchen & Wardrobe Solutions',
  'Doors & Windows',
  'Tools & Equipment',
];

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rated', value: 'rating' },
];

const PRICE_RANGES = [
  { label: 'Under ₹4,000', min: 0, max: 4000 },
  { label: '₹4,000 – ₹8,000', min: 4000, max: 8000 },
  { label: '₹8,000 – ₹17,000', min: 8000, max: 17000 },
  { label: '₹17,000 – ₹42,000', min: 17000, max: 42000 },
  { label: 'Over ₹42,000', min: 42000, max: Infinity },
];

const RATING_FILTERS = [
  { label: '4★ & above', min: 4 },
  { label: '3★ & above', min: 3 },
  { label: '2★ & above', min: 2 },
];

function Checkmark({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export const Products: React.FC<ProductsProps> = ({ isDark }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<BackendProduct[]>([]);
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

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

  const toggleExpand = (cat: string) => {
    setExpandedCategories(prev =>
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
  const activeFiltersCount = selectedCategories.length + selectedPriceRanges.length + (selectedRating !== null ? 1 : 0) + (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0);

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
      result = result.filter(p =>
        selectedPriceRanges.some(idx => {
          const range = PRICE_RANGES[idx];
          return p.price >= range.min && (range.max === Infinity || p.price < range.max);
        })
      );
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

  // Category filter sidebar section (shared between desktop and mobile)
  const CategoryFilter = () => (
    <div className="space-y-0.5">
      {ALL_CATEGORIES.map(cat => {
        const meta = getCategoryMeta(cat);
        const isSelected = selectedCategories.includes(cat);
        const isExpanded = expandedCategories.includes(cat);
        const count = products.filter(p => p.category === cat).length;
        return (
          <div key={cat}>
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group ${isSelected ? isDark ? 'bg-yellow-400/10' : 'bg-yellow-50' : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
              {/* Checkbox */}
              <button
                onClick={() => toggleCategory(cat)}
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${isSelected ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}
              >
                {isSelected && <Checkmark className="w-2.5 h-2.5 text-black" />}
              </button>
              {/* Icon */}
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${isSelected ? 'text-yellow-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <meta.icon className="w-3 h-3" />
              </div>
              {/* Label */}
              <span
                onClick={() => toggleCategory(cat)}
                className={`flex-1 text-xs font-semibold cursor-pointer leading-tight transition-colors ${isSelected ? isDark ? 'text-white' : 'text-slate-900' : isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'}`}
              >
                {cat}
              </span>
              {/* Count */}
              {count > 0 && (
                <span className={`text-[9px] font-black tabular-nums ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{count}</span>
              )}
              {/* Expand toggle */}
              <button
                onClick={() => toggleExpand(cat)}
                className={`shrink-0 transition-colors ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'}`}
              >
                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
            {/* Subcategories */}
            {isExpanded && (
              <div className="ml-9 mb-1 space-y-0.5">
                {meta.subcategories.map(sub => (
                  <div
                    key={sub}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium cursor-pointer transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-[1920px] mx-auto pb-32">
      {/* Header bar */}
      <div className={`border-b ${isDark ? 'border-white/10 bg-black' : 'border-slate-200 bg-white'}`}>
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div>
              <h1 className={`text-base font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedCategories.length === 1 ? selectedCategories[0] : 'All Products'}
              </h1>
              <p className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                {selectedCategories.length > 0 && selectedCategories.length < ALL_CATEGORIES.length
                  ? ` in ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`hidden md:flex items-center p-0.5 rounded-lg border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
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
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`hidden lg:flex flex-col w-60 shrink-0 border-r ${isDark ? 'border-white/10 bg-zinc-900' : 'border-slate-200 bg-white'} sticky top-[105px] h-[calc(100vh-105px)] overflow-y-auto`}>
          {/* Search */}
          <div className="p-4 pb-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-zinc-950 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(12); }}
                placeholder="Search products..."
                className={`flex-1 bg-transparent text-xs font-medium outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-yellow-400">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Filter header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Filters</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300">
                Clear all
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-5">
            {/* Categories */}
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Category</p>
              <CategoryFilter />
            </div>

            {/* Price Range */}
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Price Range</p>
              <div className="space-y-0.5">
                {PRICE_RANGES.map((range, idx) => {
                  const isSelected = selectedPriceRanges.includes(idx);
                  return (
                    <label key={idx} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group transition-all ${isSelected ? isDark ? 'bg-yellow-400/10' : 'bg-yellow-50' : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                      <div className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors ${isSelected ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}>
                        {isSelected && <Checkmark className="w-2.5 h-2.5 text-black" />}
                      </div>
                      <input type="checkbox" checked={isSelected} onChange={() => togglePriceRange(idx)} className="hidden" />
                      <span className={`text-xs font-medium ${isSelected ? isDark ? 'text-white' : 'text-slate-900' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{range.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rating</p>
              <div className="space-y-0.5">
                {RATING_FILTERS.map((rating, idx) => {
                  const isSelected = selectedRating === rating.min;
                  return (
                    <label key={idx} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group transition-all ${isSelected ? isDark ? 'bg-yellow-400/10' : 'bg-yellow-50' : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                      <div
                        onClick={() => setSelectedRating(isSelected ? null : rating.min)}
                        className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors ${isSelected ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}
                      >
                        {isSelected && <Checkmark className="w-2.5 h-2.5 text-black" />}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-2.5 h-2.5 ${star <= rating.min ? 'text-yellow-400 fill-current' : isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        ))}
                        <span className={`text-xs font-medium ml-1 ${isSelected ? isDark ? 'text-white' : 'text-slate-900' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>& up</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Availability */}
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Availability</p>
              <div className="space-y-0.5">
                {[
                  { label: 'In Stock Only', checked: inStockOnly, toggle: () => setInStockOnly(!inStockOnly) },
                  { label: 'On Sale', checked: onSaleOnly, toggle: () => setOnSaleOnly(!onSaleOnly) },
                ].map(({ label, checked, toggle }) => (
                  <label key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group transition-all ${checked ? isDark ? 'bg-yellow-400/10' : 'bg-yellow-50' : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <div className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors ${checked ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-slate-600 group-hover:border-yellow-400/50' : 'border-slate-300 group-hover:border-yellow-400'}`}>
                      {checked && <Checkmark className="w-2.5 h-2.5 text-black" />}
                    </div>
                    <input type="checkbox" checked={checked} onChange={toggle} className="hidden" />
                    <span className={`text-xs font-medium ${checked ? isDark ? 'text-white' : 'text-slate-900' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-5">
          {/* Mobile: search + category pills + sort */}
          <div className="lg:hidden mb-5 space-y-3">
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(12); }}
                placeholder="Search products..."
                className={`flex-1 bg-transparent text-sm font-medium outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
              />
              {search && <button onClick={() => setSearch('')} className="text-slate-400"><X className="w-4 h-4" /></button>}
            </div>
            {/* Scrollable category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {ALL_CATEGORIES.map(cat => {
                const meta = getCategoryMeta(cat);
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 transition-colors border ${
                      isSelected
                        ? 'bg-yellow-400 border-yellow-400 text-black'
                        : isDark ? 'bg-zinc-800 border-white/5 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <meta.icon className="w-3 h-3" />
                    {cat}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
              >
                {currentSort.label}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`p-2 rounded-lg border ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map(cat => (
                <span key={cat} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDark ? 'bg-zinc-800 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
                  {cat}
                  <button onClick={() => toggleCategory(cat)} className="hover:text-yellow-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
              {selectedPriceRanges.map(idx => (
                <span key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDark ? 'bg-zinc-800 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
                  {PRICE_RANGES[idx].label}
                  <button onClick={() => togglePriceRange(idx)} className="hover:text-yellow-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
              {selectedRating !== null && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDark ? 'bg-zinc-800 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
                  {selectedRating}★ & up
                  <button onClick={() => setSelectedRating(null)} className="hover:text-yellow-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDark ? 'bg-zinc-800 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
                  In Stock
                  <button onClick={() => setInStockOnly(false)} className="hover:text-yellow-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {onSaleOnly && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDark ? 'bg-zinc-800 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
                  On Sale
                  <button onClick={() => setOnSaleOnly(false)} className="hover:text-yellow-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product grid / list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <Search className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className={`text-base font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No products found</h3>
              <p className="text-xs text-slate-500 mb-4">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="px-5 py-2 bg-yellow-400 text-black text-xs font-black rounded-xl hover:bg-yellow-300 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4' : 'space-y-3'}>
              {visible.map(product => (
                <ProductCard key={product._id} product={normalizeProduct(product)} isDark={isDark} viewMode={viewMode} />
              ))}
            </div>
          )}

          {visible.length < filtered.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount(c => c + 20)}
                className="px-8 py-3 bg-yellow-400 text-black text-xs font-black rounded-xl hover:bg-yellow-300 transition-colors"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setFilterOpen(false)}>
          <div
            className={`absolute right-0 top-0 h-full w-72 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'} border-l overflow-y-auto`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <h2 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Filters</h2>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Clear</button>
                )}
                <button onClick={() => setFilterOpen(false)}>
                  <X className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Category</p>
                <CategoryFilter />
              </div>
              <div>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Price Range</p>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range, idx) => (
                    <label key={idx} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input type="checkbox" checked={selectedPriceRanges.includes(idx)} onChange={() => togglePriceRange(idx)} className="w-4 h-4 rounded accent-yellow-400" />
                      <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Availability</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} className="w-4 h-4 rounded accent-yellow-400" />
                    <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={onSaleOnly} onChange={() => setOnSaleOnly(!onSaleOnly)} className="w-4 h-4 rounded accent-yellow-400" />
                    <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>On Sale</span>
                  </label>
                </div>
              </div>
            </div>
            <div className={`px-4 pb-6 pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <button onClick={() => setFilterOpen(false)} className="w-full py-3 bg-yellow-400 text-black rounded-xl text-xs font-black hover:bg-yellow-300 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
