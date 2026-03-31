import React, { useState } from 'react';
import { Package, TrendingDown, TrendingUp, AlertTriangle, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

interface InventoryProps {
  isDark: boolean;
}

const INVENTORY = PRODUCTS.map((p, i) => ({
  ...p,
  sku: `BM-${String(p.id).padStart(5, '0')}`,
  stock: [42, 8, 156, 23, 5, 88, 3, 210][i] ?? 42,
  reorderPoint: 20,
  warehouse: ['London SE1', 'Manchester NW1', 'London SE1', 'Birmingham B1', 'London SE1', 'Manchester NW1', 'Leeds LS1', 'London SE1'][i] ?? 'London SE1',
  lastRestocked: [`2025-03-10`, `2025-03-22`, `2025-02-28`, `2025-03-15`, `2025-03-29`, `2025-03-05`, `2025-03-18`, `2025-02-20`][i] ?? '2025-03-01',
}));

type SortField = 'name' | 'stock' | 'price';
type SortDir = 'asc' | 'desc';

export const Inventory: React.FC<InventoryProps> = ({ isDark }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [warehouseFilter, setWarehouseFilter] = useState('All');

  const warehouses = ['All', ...Array.from(new Set(INVENTORY.map(i => i.warehouse)))];

  const filtered = INVENTORY
    .filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
      const matchWarehouse = warehouseFilter === 'All' || item.warehouse === warehouseFilter;
      return matchSearch && matchWarehouse;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'stock') cmp = a.stock - b.stock;
      else if (sortField === 'price') cmp = a.price - b.price;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const totalStock = INVENTORY.reduce((s, i) => s + i.stock, 0);
  const lowStock = INVENTORY.filter(i => i.stock <= i.reorderPoint).length;
  const totalValue = INVENTORY.reduce((s, i) => s + i.price * i.stock, 0);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-yellow-400" /> : <ChevronDown className="w-3 h-3 text-yellow-400" />;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Warehouse Management</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventory</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Stock Units', value: totalStock.toLocaleString(), icon: Package, color: 'text-yellow-400', trend: null },
          { label: 'Low Stock Alerts', value: lowStock, icon: AlertTriangle, color: 'text-red-400', trend: 'down' },
          { label: 'Inventory Value', value: `$${(totalValue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-green-400', trend: 'up' },
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

      {/* Search + warehouse filter */}
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
          {warehouses.map(wh => (
            <button
              key={wh}
              onClick={() => setWarehouseFilter(wh)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                warehouseFilter === wh
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {wh}
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
          <span className="col-span-2">Warehouse</span>
          <button className="col-span-2 flex items-center gap-1" onClick={() => toggleSort('stock')}>
            Stock <SortIcon field="stock" />
          </button>
          <span className="col-span-1">Status</span>
          <button className="col-span-2 flex items-center gap-1 justify-end" onClick={() => toggleSort('price')}>
            Unit Price <SortIcon field="price" />
          </button>
        </div>

        {filtered.map((item, i) => {
          const isLow = item.stock <= item.reorderPoint;
          const isCritical = item.stock <= 5;
          return (
            <div
              key={item.id}
              className={`grid grid-cols-12 px-6 py-4 items-center border-b transition-colors ${
                isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
              } ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
            >
              <span className="col-span-1 text-[9px] font-black text-slate-500 uppercase">{item.sku}</span>
              <div className="col-span-4 pr-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                </div>
                <p className={`text-[11px] font-black uppercase leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
              </div>
              <span className={`col-span-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.warehouse}</span>
              <div className="col-span-2">
                <span className={`text-base font-black ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                  {item.stock}
                </span>
                <span className="text-[9px] text-slate-500 font-bold ml-1 uppercase">units</span>
              </div>
              <div className="col-span-1">
                {isCritical ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-red-400/10 border border-red-400/20 text-red-400">
                    <AlertTriangle className="w-2.5 h-2.5" /> Critical
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
                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${item.price.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
