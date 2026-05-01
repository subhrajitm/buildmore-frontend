import React, { useState, useEffect } from 'react';
import { Package, TrendingDown, TrendingUp, AlertTriangle, Search, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { productApi, BackendProduct } from '../api';
import { useTheme } from '../context/ThemeContext';

type SortField = 'name' | 'stock' | 'price';
type SortDir = 'asc' | 'desc';

export const Inventory: React.FC = () => {
  const { isDark } = useTheme();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    productApi.getAll()
      .then(res => setProducts(res.products))
      .catch(() => setError('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const LOW_STOCK_THRESHOLD = 20;

  const filtered = products
    .filter(p => {
      const sku = `BM-${p._id.slice(-5).toUpperCase()}`;
      const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase()) ||
        sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.productName.localeCompare(b.productName);
      else if (sortField === 'stock') cmp = a.stock - b.stock;
      else if (sortField === 'price') cmp = a.price - b.price;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-yellow-400" /> : <ChevronDown className="w-3 h-3 text-yellow-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Warehouse Management</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventory</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Stock Units', value: totalStock.toLocaleString(), icon: Package, color: 'text-yellow-400' },
          { label: 'Low Stock Alerts', value: lowStock, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Inventory Value', value: `₹${(totalValue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-green-400' },
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-2xl border flex items-center gap-5 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU or name..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-56 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                categoryFilter === cat
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className={`grid grid-cols-12 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <span className="col-span-1">SKU</span>
          <button className="col-span-4 flex items-center gap-1 text-left" onClick={() => toggleSort('name')}>
            Product <SortIcon field="name" />
          </button>
          <span className="col-span-2">Category</span>
          <button className="col-span-2 flex items-center gap-1" onClick={() => toggleSort('stock')}>
            Stock <SortIcon field="stock" />
          </button>
          <span className="col-span-1">Status</span>
          <button className="col-span-2 flex items-center gap-1 justify-end" onClick={() => toggleSort('price')}>
            Unit Price <SortIcon field="price" />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Package className="w-10 h-10 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No products found</p>
          </div>
        ) : (
          filtered.map((item, i) => {
            const sku = `BM-${item._id.slice(-5).toUpperCase()}`;
            const isLow = item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD;
            const isCritical = item.stock === 0;
            const img = item.productImages?.[0];
            return (
              <div
                key={item._id}
                className={`grid grid-cols-12 px-6 py-4 items-center border-b transition-colors ${
                  isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
                } ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
              >
                <span className="col-span-1 text-[9px] font-black text-slate-500 uppercase">{sku}</span>
                <div className="col-span-4 pr-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    {img
                      ? <img src={img} alt={item.productName} className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-normal" referrerPolicy="no-referrer" />
                      : <Package className="w-4 h-4 text-slate-500" />
                    }
                  </div>
                  <p className={`text-[11px] font-black uppercase leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</p>
                </div>
                <span className={`col-span-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.category}</span>
                <div className="col-span-2">
                  <span className={`text-base font-black ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.stock}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold ml-1 uppercase">units</span>
                </div>
                <div className="col-span-1">
                  {isCritical ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-red-400/10 border border-red-400/20 text-red-400">
                      <AlertTriangle className="w-2.5 h-2.5" /> Out
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
                      <TrendingDown className="w-2.5 h-2.5" /> Low
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-green-400/10 border border-green-400/20 text-green-400">
                      OK
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-right">
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{item.price.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
