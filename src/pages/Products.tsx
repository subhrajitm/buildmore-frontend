import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Check, Truck, ShieldCheck, Zap } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { productApi, BackendProduct } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';

interface ProductsProps {
  isDark: boolean;
}

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export const Products: React.FC<ProductsProps> = ({ isDark }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>(() => {
    const cat = searchParams.get('category');
    return cat ? [cat] : [];
  });
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'certified' | 'bulk'>('all');

  useEffect(() => {
    productApi.getCategories()
      .then(res => setCategories(res.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const category = selectedVerticals.length === 1 ? selectedVerticals[0] : undefined;
    productApi.getAll(category ? { category } : undefined)
      .then(res => setProducts(res.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedVerticals]);

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat || q) {
      if (cat) setSelectedVerticals([cat]);
      if (q) setSearch(q);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const toggleVertical = (cat: string) => {
    setSelectedVerticals(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSelectedVerticals([]);
    setSearch('');
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p => p.productName.toLowerCase().includes(q));
    }

    if (statusFilter === 'ready') result = result.filter(p => p.stock > 0);
    if (statusFilter === 'certified') result = result.filter(p => p.availability);
    if (statusFilter === 'bulk') result = result.filter(p => p.price >= 500);

    if (selectedVerticals.length > 1) {
      result = result.filter(p => selectedVerticals.includes(p.category));
    }

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
    }
    return result;
  }, [statusFilter, selectedVerticals, search, sortBy, products]);

  const visible = filtered.slice(0, visibleCount);
  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy)!;

  const STATUS_TABS = [
    { id: 'all', label: 'All Identification', icon: Search },
    { id: 'ready', label: 'Ready-to-Ship', icon: Truck },
    { id: 'certified', label: 'Available', icon: ShieldCheck },
    { id: 'bulk', label: 'High Value', icon: Zap },
  ];

  return (
    <div className="max-w-[1920px] mx-auto space-y-12 animate-fade-in pb-32">
      {/* Precision Header & Segmenter */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <Link to="/" className="hover:text-yellow-400 font-bold transition-all">Main Hub</Link>
              <ChevronDown className="w-2.5 h-2.5 -rotate-90 opacity-40" />
              <span className={isDark ? 'text-white' : 'text-slate-900'}>Supply Matrix</span>
            </nav>
            <div className="flex items-center gap-6">
              <h1 className={`text-4xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Inventory <span className="text-yellow-400 font-black">Segmenter</span>
              </h1>
              <div className={`px-2 py-0.5 rounded text-[9px] font-black bg-yellow-400/10 border border-yellow-400/20 ${isDark ? 'text-yellow-400' : 'text-slate-900'}`}>
                {filtered.length} Identifiers Located
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 h-11 px-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(12); }}
                placeholder="Search products..."
                className={`flex-1 bg-transparent text-[11px] font-bold uppercase tracking-widest outline-none placeholder:text-slate-500 ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
            </div>
            <div className="flex items-center gap-3">
              {/* High-Precision Status Toggles */}
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                {STATUS_TABS.map(tab => {
                  const isActive = statusFilter === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        isActive 
                          ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' 
                          : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-yellow-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`h-11 px-6 rounded-xl border flex items-center gap-4 transition-all ${isDark ? 'bg-zinc-900 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentSort.label}</span>
                  <ChevronDown className={`w-4 h-4 text-yellow-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200 animate-in fade-in zoom-in-95 backdrop-blur-xl'}`}>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                          sortBy === opt.value
                            ? 'bg-yellow-400 text-black'
                            : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
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
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Sidebar Mini-Matrix */}
        <aside className="w-full lg:w-52 space-y-10 flex-shrink-0 lg:sticky lg:top-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Inventory Matrix</h3>
              <div className="space-y-1.5 text-left">
                {categories.map(cat => {
                  const checked = selectedVerticals.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleVertical(cat)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all text-left ${checked ? (isDark ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-400/10' : 'bg-slate-900 border-slate-900 text-white') : (isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300')}`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Inventory Matrix Grid */}
        <div className="flex-1 space-y-10">
          {loading ? (
            <div className={`flex flex-col items-center justify-center py-32 gap-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Loading Matrix Assets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-32 rounded-[24px] border-2 border-dashed gap-6 ${isDark ? 'border-white/10 text-slate-500 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50 text-slate-400'}`}>
              <ShieldCheck className="w-12 h-12 opacity-10" />
              <div className="text-center space-y-2">
                <p className="text-sm font-black uppercase tracking-widest opacity-60">Filtered Identification: NULL</p>
                <p className="text-[10px] font-medium opacity-40 uppercase tracking-widest">Adjust matrix segments to locate required inventory</p>
              </div>
              <button onClick={clearFilters} className="text-yellow-400 text-[10px] font-black uppercase tracking-widest border border-yellow-400/20 px-8 py-3 rounded-full hover:bg-yellow-400/10 transition-colors">Reset Identification Segments</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-20">
              {visible.map(product => (
                <ProductCard key={product._id} product={normalizeProduct(product)} isDark={isDark} />
              ))}
            </div>
          )}

          {visible.length < filtered.length && (
            <div className="flex justify-center border-t border-slate-100 dark:border-white/5 pb-20 pt-10">
              <button
                onClick={() => setVisibleCount(c => c + 12)}
                className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full border border-yellow-400/30 flex items-center justify-center transition-all group-hover:border-yellow-400 group-hover:bg-yellow-400 shadow-xl shadow-yellow-400/0 group-hover:shadow-yellow-400/20">
                  <ChevronDown className="w-5 h-5 text-yellow-400 group-hover:text-black transition-colors" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-yellow-400 transition-colors">Load Matrix Deep Assets</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
