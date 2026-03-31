import React, { useState } from 'react';
import { ShieldCheck, Download, CheckCircle, AlertCircle, Clock, Search, FileText } from 'lucide-react';

interface ComplianceProps {
  isDark: boolean;
}

const DOCS = [
  { id: 'ISO-9001', name: 'ISO 9001:2015 Quality Management', type: 'Certification', status: 'active', expires: '2026-08-14', size: '2.4 MB' },
  { id: 'CE-MARK', name: 'CE Declaration of Conformity — Industrial Tools', type: 'Declaration', status: 'active', expires: '2027-01-01', size: '1.1 MB' },
  { id: 'REACH-001', name: 'REACH Substance Registration Report', type: 'Regulatory', status: 'active', expires: '2025-12-31', size: '5.8 MB' },
  { id: 'SDS-COAT', name: 'Safety Data Sheet — BuildMore Epoxy Coatings', type: 'SDS', status: 'active', expires: '2026-03-20', size: '0.8 MB' },
  { id: 'ROHS-V3', name: 'RoHS III Compliance Statement — Electrical Systems', type: 'Declaration', status: 'expiring', expires: '2025-04-10', size: '0.5 MB' },
  { id: 'UL-LISTED', name: 'UL Listing Certificate — Load Centers', type: 'Certification', status: 'active', expires: '2027-06-30', size: '3.2 MB' },
  { id: 'OSHA-PPE', name: 'OSHA PPE Compliance Audit Report Q1 2025', type: 'Audit', status: 'review', expires: '2025-06-01', size: '7.1 MB' },
  { id: 'ISO-14001', name: 'ISO 14001:2015 Environmental Management', type: 'Certification', status: 'active', expires: '2026-11-15', size: '1.9 MB' },
];

const STATUS_CONFIG = {
  active: { label: 'Active', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  expiring: { label: 'Expiring Soon', icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  review: { label: 'Under Review', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
};

export const Compliance: React.FC<ComplianceProps> = ({ isDark }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const types = ['All', ...Array.from(new Set(DOCS.map(d => d.type)))];

  const filtered = DOCS.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.id.toLowerCase().includes(search.toLowerCase());
    const matchType = activeFilter === 'All' || doc.type === activeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    active: DOCS.filter(d => d.status === 'active').length,
    expiring: DOCS.filter(d => d.status === 'expiring').length,
    review: DOCS.filter(d => d.status === 'review').length,
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Regulatory Management</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Compliance Hub</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Certs', value: stats.active, color: 'text-green-400', icon: CheckCircle },
          { label: 'Expiring Soon', value: stats.expiring, color: 'text-yellow-400', icon: AlertCircle },
          { label: 'Under Review', value: stats.review, color: 'text-blue-400', icon: Clock },
        ].map(stat => (
          <div key={stat.label} className={`p-6 rounded-2xl border flex items-center gap-5 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-56 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeFilter === type
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Document Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className={`grid grid-cols-12 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <span className="col-span-1">ID</span>
          <span className="col-span-4">Document</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Expires</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No documents found</p>
          </div>
        ) : (
          filtered.map((doc, i) => {
            const s = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG];
            return (
              <div
                key={doc.id}
                className={`grid grid-cols-12 px-6 py-4 items-center border-b transition-colors ${
                  isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
                } ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
              >
                <span className="col-span-1 text-[9px] font-black text-slate-500 uppercase">{doc.id}</span>
                <div className="col-span-4 pr-4">
                  <p className={`text-[11px] font-black uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">{doc.size}</p>
                </div>
                <span className={`col-span-2 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doc.type}</span>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.bg} ${s.color}`}>
                    <s.icon className="w-2.5 h-2.5" />
                    {s.label}
                  </span>
                </div>
                <span className={`col-span-2 text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doc.expires}</span>
                <div className="col-span-1 flex justify-end">
                  <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-500 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-400 hover:text-yellow-500'}`}>
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
