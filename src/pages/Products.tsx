import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/mockData';

interface ProductsProps {
  isDark: boolean;
}

const VERTICALS = CATEGORIES.map(c => c.name);
const TIERS = ['Standard Export', 'Bulk Distribution', 'LTL Freight Only', 'Custom Fab'];
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export const Products: React.FC<ProductsProps> = ({ isDark }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>(() => {
    const cat = searchParams.get('category');
    return cat ? [cat] : [];
  });
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Sync category from URL param when it changes (e.g. clicking category cards)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedVerticals([cat]);
      setSearchParams({}, { replace: true }); // clear param after applying
    }
  }, [searchParams]);

  const toggleVertical = (cat: string) => {
    setSelectedVerticals(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleTier = (tier: string) => {
    setSelectedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedVerticals([]);
    setSelectedTiers([]);
    setSortBy('featured');
  };

  const hasFilters = search || selectedVerticals.length > 0 || selectedTiers.length > 0;

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    if (selectedVerticals.length > 0) {
      result = result.filter(p => selectedVerticals.includes(p.category));
    }

    if (selectedTiers.length > 0) {
      result = result.filter(p => selectedTiers.includes(p.tier));
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [search, selectedVerticals, selectedTiers, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy)!;

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
          {/* Search */}
          <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
            <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className={`pl-9 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-48 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="pr-3 text-slate-500 hover:text-yellow-400">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              {currentSort.label} <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div className={`absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-xl z-10 overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-100'}`}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      sortBy === opt.value
                        ? 'text-yellow-400'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-400/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400/10 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 space-y-8">
          <div className="space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Verticals</h3>
            <div className="space-y-2">
              {VERTICALS.map(cat => {
                const checked = selectedVerticals.includes(cat);
                return (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleVertical(cat)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      checked
                        ? 'bg-yellow-400 border-yellow-400'
                        : isDark ? 'border-white/10 bg-white/5 group-hover:border-yellow-400' : 'border-slate-200 bg-slate-50 group-hover:border-slate-900'
                    }`}>
                      {checked && <div className="w-2 h-2 bg-black rounded-sm"></div>}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      checked ? 'text-yellow-400' : isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
                    }`}>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Procurement Tier</h3>
            <div className="space-y-2">
              {TIERS.map(tier => {
                const checked = selectedTiers.includes(tier);
                return (
                  <label key={tier} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleTier(tier)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      checked
                        ? 'bg-yellow-400 border-yellow-400'
                        : isDark ? 'border-white/10 bg-white/5 group-hover:border-yellow-400' : 'border-slate-200 bg-slate-50 group-hover:border-slate-900'
                    }`}>
                      {checked && <div className="w-2 h-2 bg-black rounded-sm"></div>}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      checked ? 'text-yellow-400' : isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
                    }`}>{tier}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-8">
          <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {filtered.length} {filtered.length === 1 ? 'Result' : 'Results'}
            {hasFilters && ' (filtered)'}
          </div>

          {filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              <Filter className="w-12 h-12 opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-widest">No products match your filters</p>
              <button onClick={clearFilters} className="text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:underline">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visible.map(product => (
                <ProductCard key={product.id} product={product} isDark={isDark} />
              ))}
            </div>
          )}

          {visible.length < filtered.length && (
            <div className="flex justify-center pt-10">
              <button
                onClick={() => setVisibleCount(c => c + 8)}
                className="bg-yellow-400 text-black px-12 py-4 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-all shadow-xl flex items-center gap-3"
              >
                Load More Inventory <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
