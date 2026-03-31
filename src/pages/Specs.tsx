import React, { useState } from 'react';
import { Search, Download, FileText, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

interface SpecsProps {
  isDark: boolean;
}

const SPEC_SHEETS = PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  revision: `Rev ${p.id}.${p.id * 2}`,
  updated: `2025-0${p.id}-15`,
  formats: ['PDF', 'CAD', p.isTechnical ? 'STEP' : 'DXF'],
  specs: [
    { label: 'Voltage Range', value: '18V – 24V DC' },
    { label: 'IP Rating', value: `IP${60 + p.id}` },
    { label: 'Weight', value: `${(2 + p.id * 0.4).toFixed(1)} kg` },
    { label: 'Material', value: p.id % 2 === 0 ? 'Polycarbonate/Steel' : 'Composite/Aluminum' },
    { label: 'Duty Cycle', value: `${85 + p.id}% @ 40°C` },
    { label: 'Warranty', value: `IND-S-${4200 + p.id * 10}` },
  ],
  image: p.image,
}));

export const Specs: React.FC<SpecsProps> = ({ isDark }) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(SPEC_SHEETS.map(s => s.category)))];

  const filtered = SPEC_SHEETS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Technical Documentation</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Spec Sheets</h1>
      </div>

      {/* Stats bar */}
      <div className={`p-5 rounded-2xl border flex items-center gap-8 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
        {[
          { label: 'Total Spec Sheets', value: SPEC_SHEETS.length },
          { label: 'Categories', value: categories.length - 1 },
          { label: 'Last Updated', value: '2025-04-01' },
        ].map((stat, i) => (
          <div key={i} className={`flex items-center gap-4 ${i < 2 ? `pr-8 border-r ${isDark ? 'border-white/10' : 'border-slate-200'}` : ''}`}>
            <div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-yellow-400">
          <Zap className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">All Sheets Verified</span>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search spec sheets..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-56 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Spec sheet list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No spec sheets found</p>
          </div>
        )}
        {filtered.map(sheet => (
          <div
            key={sheet.id}
            className={`rounded-2xl border overflow-hidden transition-all ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <div
              className="p-5 flex items-center gap-5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === sheet.id ? null : sheet.id)}
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <img src={sheet.image} alt={sheet.name} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sheet.category}</span>
                  <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">{sheet.revision}</span>
                </div>
                <h3 className={`text-sm font-black uppercase leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{sheet.name}</h3>
                <p className="text-[9px] text-slate-500 font-bold mt-1">Updated: {sheet.updated}</p>
              </div>
              <div className="flex items-center gap-2">
                {sheet.formats.map(fmt => (
                  <span key={fmt} className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{fmt}</span>
                ))}
              </div>
              <button className={`p-2 rounded-lg transition-colors mr-1 ${isDark ? 'hover:bg-white/10 text-slate-500 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-400 hover:text-yellow-500'}`}>
                <Download className="w-4 h-4" />
              </button>
              <div className={`transition-transform ${expandedId === sheet.id ? 'rotate-90' : ''}`}>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {expandedId === sheet.id && (
              <div className={`px-5 pb-5 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                  {sheet.specs.map((spec, i) => (
                    <div key={i} className={`flex items-center justify-between py-2.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{spec.label}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
