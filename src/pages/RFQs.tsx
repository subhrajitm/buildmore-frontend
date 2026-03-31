import React, { useState } from 'react';
import { Plus, ArrowRight, Clock, CheckCircle, XCircle, FileText, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RFQsProps {
  isDark: boolean;
}

const MOCK_RFQS = [
  { id: 'RFQ-2025-0041', title: 'Q2 Safety Gear Bulk Order', items: 4, value: 8420.00, status: 'pending', created: '2025-03-28', deadline: '2025-04-10', supplier: 'BuildMore Direct' },
  { id: 'RFQ-2025-0038', title: 'Electrical Systems Procurement', items: 2, value: 14250.00, status: 'approved', created: '2025-03-20', deadline: '2025-04-05', supplier: 'GridMaster Co.' },
  { id: 'RFQ-2025-0035', title: 'Industrial Tool Refresh — Site A', items: 6, value: 5680.00, status: 'approved', created: '2025-03-12', deadline: '2025-03-30', supplier: 'BuildMore Direct' },
  { id: 'RFQ-2025-0031', title: 'Heavy Machinery LTL Freight Bundle', items: 1, value: 31000.00, status: 'pending', created: '2025-03-05', deadline: '2025-04-15', supplier: 'HeavySet Industrial' },
  { id: 'RFQ-2025-0028', title: 'Fastener Assortment Kits — Q1 Resupply', items: 8, value: 1240.00, status: 'rejected', created: '2025-02-18', deadline: '2025-03-01', supplier: 'Bolt & Nut Co.' },
  { id: 'RFQ-2025-0022', title: 'Site B PPE Annual Contract', items: 12, value: 22800.00, status: 'approved', created: '2025-01-30', deadline: '2025-02-28', supplier: 'BuildMore Direct' },
];

const STATUS_MAP = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
};

export const RFQs: React.FC<RFQsProps> = ({ isDark }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const statusOptions = ['All', 'pending', 'approved', 'rejected'];

  const filtered = MOCK_RFQS.filter(rfq => {
    const matchSearch = rfq.title.toLowerCase().includes(search.toLowerCase()) || rfq.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || rfq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = MOCK_RFQS.reduce((s, r) => s + r.value, 0);
  const pendingCount = MOCK_RFQS.filter(r => r.status === 'pending').length;
  const approvedCount = MOCK_RFQS.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1.5px] bg-yellow-400"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Quote Management</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>RFQ Desk</h1>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 shrink-0 mt-2"
        >
          <Plus className="w-4 h-4" /> New RFQ
        </button>
      </div>

      {/* New RFQ form */}
      {showNewForm && (
        <div className={`p-6 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${isDark ? 'bg-zinc-900 border-yellow-400/20' : 'bg-white border-yellow-400/30 shadow-xl'}`}>
          <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New RFQ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">RFQ Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Q3 Safety Gear Order"
                className={`w-full py-3 px-4 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-zinc-800 border-white/5 text-white focus:ring-1 focus:ring-yellow-400' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-400'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Requester</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className={`w-full py-3 px-4 rounded-xl border text-sm outline-none opacity-60 cursor-not-allowed ${isDark ? 'bg-zinc-800 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Tip: After creating, go to the Procurement Hub to add items and generate a quote.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowNewForm(false); setNewTitle(''); }}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
            >
              Cancel
            </button>
            <button
              disabled={!newTitle.trim()}
              onClick={() => { setShowNewForm(false); setNewTitle(''); }}
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit RFQ <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total RFQ Value', value: `$${(totalValue / 1000).toFixed(1)}K`, sub: `${MOCK_RFQS.length} requests` },
          { label: 'Pending Review', value: pendingCount, sub: 'awaiting response' },
          { label: 'Approved', value: approvedCount, sub: 'this quarter' },
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mt-1">{s.label}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search RFQs..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-56 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all capitalize ${
                statusFilter === s
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No RFQs found</p>
          </div>
        )}
        {filtered.map(rfq => {
          const s = STATUS_MAP[rfq.status as keyof typeof STATUS_MAP];
          return (
            <div
              key={rfq.id}
              className={`p-5 rounded-2xl border flex items-center gap-6 transition-all cursor-pointer ${isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-lg'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rfq.id}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.bg} ${s.color}`}>
                    <s.icon className="w-2.5 h-2.5" />
                    {s.label}
                  </span>
                </div>
                <h3 className={`text-sm font-black uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{rfq.title}</h3>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{rfq.items} item{rfq.items !== 1 ? 's' : ''}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{rfq.supplier}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Due: {rfq.deadline}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${rfq.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Quote Value</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
