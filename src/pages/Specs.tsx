import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, ChevronRight, Zap, Loader2, AlertCircle } from 'lucide-react';
import { specsApi, SpecSheet } from '../api';

interface SpecsProps {
  isDark: boolean;
}

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF:   'text-red-400 bg-red-400/10',
  CAD:   'text-blue-400 bg-blue-400/10',
  XLSX:  'text-green-400 bg-green-400/10',
  DWG:   'text-purple-400 bg-purple-400/10',
  OTHER: 'text-slate-400 bg-slate-400/10',
};

export const Specs: React.FC<SpecsProps> = ({ isDark }) => {
  const [specs, setSpecs] = useState<SpecSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFileType, setActiveFileType] = useState('All');

  useEffect(() => {
    specsApi.getAll()
      .then(res => setSpecs(res.specs))
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(specs.map(s => s.product?.category).filter(Boolean) as string[]))];
  const fileTypes = ['All', ...Array.from(new Set(specs.map(s => s.fileType)))];

  const filtered = specs.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.product?.productName || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || s.product?.category === activeCategory;
    const matchType = activeFileType === 'All' || s.fileType === activeFileType;
    return matchSearch && matchCat && matchType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Technical Documentation</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Spec Sheets</h1>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{fetchError}</p>
        </div>
      )}

      {/* Stats bar */}
      <div className={`p-5 rounded-2xl border flex items-center gap-8 flex-wrap ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
        {[
          { label: 'Total Spec Sheets', value: specs.length },
          { label: 'Categories', value: categories.length - 1 },
          { label: 'File Types', value: fileTypes.length - 1 },
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
          <span className="text-[9px] font-black uppercase tracking-widest">Verified Sheets</span>
        </div>
      </div>

      {/* Search + Category + FileType Filter */}
      <div className="space-y-3">
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-1">File Type:</span>
          {fileTypes.map(ft => (
            <button
              key={ft}
              onClick={() => setActiveFileType(ft)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeFileType === ft
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {ft}
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
        {filtered.map(sheet => {
          const isExpanded = expandedId === sheet._id;
          const ftColor = FILE_TYPE_COLORS[sheet.fileType] ?? FILE_TYPE_COLORS['OTHER'];
          return (
            <div
              key={sheet._id}
              className={`rounded-2xl border overflow-hidden transition-all ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              <div
                className="p-5 flex items-center gap-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : sheet._id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {sheet.product?.category && (
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sheet.product.category}</span>
                    )}
                    <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">v{sheet.version}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ftColor}`}>{sheet.fileType}</span>
                  </div>
                  <h3 className={`text-sm font-black uppercase leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{sheet.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    {sheet.product?.productName && (
                      <p className="text-[9px] text-slate-500 font-bold">{sheet.product.productName}</p>
                    )}
                    {sheet.uploadedBy?.name && (
                      <p className="text-[9px] text-slate-500 font-bold">By: {sheet.uploadedBy.name}</p>
                    )}
                    <p className="text-[9px] text-slate-500 font-bold">Added: {new Date(sheet.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sheet.fileUrl && (
                    <a
                      href={sheet.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-500 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-400 hover:text-yellow-500'}`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <div className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className={`px-5 pb-5 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="pt-4 space-y-3">
                    {sheet.description && (
                      <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{sheet.description}</p>
                    )}
                    {sheet.product && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-0">
                        {[
                          { label: 'Product', value: sheet.product.productName },
                          { label: 'Category', value: sheet.product.category },
                          { label: 'Version', value: `v${sheet.version}` },
                          { label: 'File Size', value: sheet.fileSize },
                          { label: 'File Type', value: sheet.fileType },
                          ...(sheet.product.materialSpecifications
                            ? [{ label: 'Material Specs', value: sheet.product.materialSpecifications }]
                            : []),
                        ].filter(r => r.value).map((item, i) => (
                          <div key={i} className={`flex items-center justify-between py-2.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!sheet.description && !sheet.product && (
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No additional details available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
