import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, XCircle, FileText, Search, ChevronDown, ChevronUp, Send, Loader2, AlertCircle, Package, Pencil, Check, TrendingUp, Zap, Tag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rfqApi, RFQ } from '../api';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/currency';

const STATUS_MAP: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string; leftBorder: string }> = {
  DRAFT:        { label: 'Draft',        icon: FileText,    color: 'text-slate-400',  bg: 'bg-slate-400/10 border-slate-400/20',   leftBorder: 'border-l-slate-400/50' },
  SUBMITTED:    { label: 'Submitted',    icon: Clock,       color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',     leftBorder: 'border-l-blue-400' },
  UNDER_REVIEW: { label: 'Under Review', icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', leftBorder: 'border-l-yellow-400' },
  QUOTED:       { label: 'Quoted',       icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', leftBorder: 'border-l-purple-400' },
  ACCEPTED:     { label: 'Accepted',     icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',   leftBorder: 'border-l-green-500' },
  REJECTED:     { label: 'Rejected',     icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       leftBorder: 'border-l-red-400' },
  EXPIRED:      { label: 'Expired',      icon: XCircle,     color: 'text-slate-500',  bg: 'bg-slate-500/10 border-slate-500/20',   leftBorder: 'border-l-slate-500/50' },
};

const PIPELINE_STEPS = ['Draft', 'Submitted', 'Review', 'Quoted', 'Done'];
const STATUS_STEP: Record<string, number> = {
  DRAFT: 0, SUBMITTED: 1, UNDER_REVIEW: 2, QUOTED: 3, ACCEPTED: 4, REJECTED: 4, EXPIRED: 4,
};

const STATUS_OPTIONS = ['All', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

export const RFQs: React.FC = () => {
  const { isDark } = useTheme();
  const { token, user } = useAuth();
  const location = useLocation();

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // New RFQ form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Expanded RFQ for adding items
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add item form per RFQ
  const [addItemForm, setAddItemForm] = useState<{ productName: string; quantity: string; targetPrice: string; notes: string }>({
    productName: '', quantity: '1', targetPrice: '', notes: '',
  });
  const [addingItem, setAddingItem] = useState(false);
  const [addItemError, setAddItemError] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Accept/Reject state
  const [responding, setResponding] = useState<string | null>(null);

  // Inline item edit
  const [editingItem, setEditingItem] = useState<{ rfqId: string; itemId: string } | null>(null);
  const [editItemForm, setEditItemForm] = useState({ quantity: '1', targetPrice: '', notes: '' });
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    if (!token) return;
    rfqApi.getAll(token)
      .then(res => setRfqs(res.rfqs))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Pre-populate from ProductDetail navigation state
  useEffect(() => {
    const state = location.state as { productName?: string; productId?: string } | null;
    if (state?.productName) {
      setShowNewForm(true);
      setAddItemForm(prev => ({ ...prev, productName: state.productName! }));
    }
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNewForm) {
        setShowNewForm(false);
        setNewNotes('');
        setNewExpiry('');
        setCreateError('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showNewForm]);

  const handleCreateRFQ = async () => {
    if (!token) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await rfqApi.create({ notes: newNotes || undefined, expiresAt: newExpiry || undefined }, token);
      setRfqs(prev => [res.rfq, ...prev]);
      setShowNewForm(false);
      setNewNotes('');
      setNewExpiry('');
      setExpandedId(res.rfq._id);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create RFQ');
    } finally {
      setCreating(false);
    }
  };

  const handleAddItem = async (rfqId: string) => {
    if (!token || !addItemForm.productName.trim()) return;
    setAddingItem(true);
    setAddItemError('');
    try {
      const res = await rfqApi.addItem(rfqId, {
        productName: addItemForm.productName.trim(),
        quantity: Number(addItemForm.quantity) || 1,
        targetPrice: addItemForm.targetPrice ? Number(addItemForm.targetPrice) : undefined,
        notes: addItemForm.notes || undefined,
      }, token);
      setRfqs(prev => prev.map(r => r._id === rfqId ? res.rfq : r));
      setAddItemForm({ productName: '', quantity: '1', targetPrice: '', notes: '' });
    } catch (err: any) {
      setAddItemError(err.message || 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (rfqId: string, itemId: string) => {
    if (!token) return;
    try {
      const res = await rfqApi.removeItem(rfqId, itemId, token);
      setRfqs(prev => prev.map(r => r._id === rfqId ? res.rfq : r));
    } catch {
      // silent fail — item stays in list
    }
  };

  const startEditItem = (rfqId: string, itemId: string, quantity: number, targetPrice?: number, notes?: string) => {
    setEditingItem({ rfqId, itemId });
    setEditItemForm({ quantity: String(quantity), targetPrice: targetPrice != null ? String(targetPrice) : '', notes: notes || '' });
  };

  const handleUpdateItem = async () => {
    if (!token || !editingItem) return;
    setSavingItem(true);
    try {
      const res = await rfqApi.updateItem(editingItem.rfqId, editingItem.itemId, {
        quantity: Number(editItemForm.quantity) || 1,
        targetPrice: editItemForm.targetPrice ? Number(editItemForm.targetPrice) : null,
        notes: editItemForm.notes || undefined,
      }, token);
      setRfqs(prev => prev.map(r => r._id === editingItem.rfqId ? res.rfq : r));
      setEditingItem(null);
    } catch (err: any) {
      // keep editing open so user can retry
    } finally {
      setSavingItem(false);
    }
  };

  const handleRespond = async (rfqId: string, action: 'ACCEPT' | 'REJECT') => {
    if (!token) return;
    setResponding(rfqId);
    try {
      const res = await rfqApi.respond(rfqId, action, token);
      setRfqs(prev => prev.map(r => r._id === rfqId ? res.rfq : r));
    } catch (err: any) {
      // keep current state
    } finally {
      setResponding(null);
    }
  };

  const handleSubmit = async (rfqId: string) => {
    if (!token) return;
    setSubmitting(rfqId);
    setSubmitError('');
    try {
      const res = await rfqApi.submit(rfqId, token);
      setRfqs(prev => prev.map(r => r._id === rfqId ? res.rfq : r));
      setExpandedId(null);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit RFQ');
    } finally {
      setSubmitting(null);
    }
  };

  const filtered = rfqs.filter(rfq => {
    const matchSearch = rfq.rfqNumber.toLowerCase().includes(search.toLowerCase()) ||
      (rfq.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || rfq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = rfqs.reduce((s, r) => s + r.totalEstimatedValue, 0);
  const pendingCount = rfqs.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status)).length;
  const acceptedCount = rfqs.filter(r => r.status === 'ACCEPTED').length;

  const inp = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  const quotedCount = rfqs.filter(r => r.status === 'QUOTED').length;

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1.5px] bg-yellow-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Procurement</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            RFQ Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-md">
            Request for Quotation — submit your material requirements and receive competitive pricing from our procurement team.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-yellow-400 text-black px-4 sm:px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 shrink-0 mt-2 shadow-lg shadow-yellow-400/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New RFQ</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{error}</p>
        </div>
      )}

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total RFQs',     value: rfqs.length,    sub: 'all time',           icon: FileText,    accent: 'text-slate-400' },
          { label: 'Pending Review', value: pendingCount,   sub: 'awaiting response',  icon: Clock,       accent: 'text-blue-400'  },
          { label: 'Action Needed',  value: quotedCount,    sub: 'quotes to review',   icon: Zap,         accent: 'text-yellow-400'},
          { label: 'Est. Value',     value: formatPrice(totalValue), sub: 'total pipeline', icon: TrendingUp, accent: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 sm:p-5 rounded-2xl border ${cardBg} flex items-center gap-3 sm:gap-4`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <stat.icon className={`w-4 h-4 ${stat.accent}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xl sm:text-2xl font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${stat.accent}`}>{stat.label}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── New RFQ modal ─────────────────────────────────────────────── */}
      {showNewForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) { setShowNewForm(false); setNewNotes(''); setNewExpiry(''); setCreateError(''); } }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal card */}
          <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-zinc-900 border-yellow-400/20' : 'bg-white border-yellow-400/30'}`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? 'border-yellow-400/10 bg-yellow-400/5' : 'border-yellow-100 bg-yellow-50/70'}`}>
              <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-black" />
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New RFQ</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Fill in details, then add items and submit for pricing.</p>
              </div>
              <button
                onClick={() => { setShowNewForm(false); setNewNotes(''); setNewExpiry(''); setCreateError(''); }}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-xs font-bold text-red-400">{createError}</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description / Notes</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="e.g. Q3 Safety Gear Procurement — Site A, Hyderabad"
                    className={`w-full py-3 px-4 rounded-xl border text-sm outline-none transition-all ${inp}`}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Requester</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      readOnly
                      className={`w-full py-3 px-4 rounded-xl border text-sm outline-none opacity-60 cursor-not-allowed ${isDark ? 'bg-zinc-800 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry <span className="normal-case font-medium">(optional)</span></label>
                    <input
                      type="date"
                      value={newExpiry}
                      onChange={e => setNewExpiry(e.target.value)}
                      className={`w-full py-3 px-4 rounded-xl border text-sm outline-none transition-all ${inp}`}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                After creating, you can add items to the draft and then submit it for competitive pricing from our team.
              </p>
            </div>

            {/* Footer */}
            <div className={`px-5 py-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/60'}`}>
              <button
                onClick={() => { setShowNewForm(false); setNewNotes(''); setNewExpiry(''); setCreateError(''); }}
                className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRFQ}
                disabled={creating}
                className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Draft</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search + filter ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className={`relative flex items-center border rounded-xl w-full sm:w-auto ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by number or notes..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-full sm:w-64 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {s === 'UNDER_REVIEW' ? 'Review' : s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── RFQ list ──────────────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* Empty state */}
        {rfqs.length === 0 && (
          <div className={`rounded-2xl border p-8 sm:p-12 text-center ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className={`text-base font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No RFQs yet</h3>
            <p className="text-xs text-slate-500 mb-8 max-w-xs mx-auto">Create your first request for quotation to get competitive pricing from our procurement team.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
              {[
                { step: '1', title: 'Create Draft', desc: 'Start a new RFQ and add your material requirements with target prices.' },
                { step: '2', title: 'Submit Request', desc: 'Submit the RFQ to our team. They will review and prepare competitive quotes.' },
                { step: '3', title: 'Accept Quote',  desc: 'Review the quoted prices, accept or reject, and proceed to procurement.' },
              ].map(s => (
                <div key={s.step} className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-[10px] text-black mb-3">{s.step}</div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-8 bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First RFQ
            </button>
          </div>
        )}

        {/* No results after filter */}
        {rfqs.length > 0 && filtered.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <Search className="w-8 h-8 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No RFQs match your filter</p>
            <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {filtered.map(rfq => {
          const s = STATUS_MAP[rfq.status] ?? STATUS_MAP['DRAFT'];
          const isExpanded = expandedId === rfq._id;
          const isDraft = rfq.status === 'DRAFT';
          const isTerminal = ['REJECTED', 'EXPIRED'].includes(rfq.status);
          const currentStep = STATUS_STEP[rfq.status] ?? 0;

          return (
            <div
              key={rfq._id}
              className={`rounded-2xl border-l-4 border border-t border-r border-b overflow-hidden transition-all ${
                isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-lg'
              } ${s.leftBorder}`}
            >
              {/* ── Card header row ── */}
              <div
                className="p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : rfq._id)}
              >
                {/* Status icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rfq.rfqNumber}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.bg} ${s.color}`}>
                      <s.icon className="w-2.5 h-2.5" />
                      {s.label}
                    </span>
                    {rfq.status === 'QUOTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border bg-purple-400/10 border-purple-400/20 text-purple-400">
                        <Zap className="w-2.5 h-2.5" /> Action needed
                      </span>
                    )}
                  </div>
                  <h3 className={`text-sm font-black leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {rfq.notes || <span className="italic font-medium text-slate-500">No description</span>}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-[9px] text-slate-500 font-bold">{rfq.items.length} item{rfq.items.length !== 1 ? 's' : ''}</span>
                    <span className="text-[9px] text-slate-500 font-bold">{new Date(rfq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {rfq.expiresAt && <span className="text-[9px] text-slate-500 font-bold">Expires {new Date(rfq.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>

                {/* Value + inline quick actions + chevron */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                  <div className="hidden sm:block text-right">
                    <p className={`text-base font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(rfq.totalEstimatedValue)}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Est. Value</p>
                  </div>
                  {/* Quick action: submit (DRAFT with items) */}
                  {isDraft && rfq.items.length > 0 && (
                    <button
                      onClick={() => handleSubmit(rfq._id)}
                      disabled={submitting === rfq._id}
                      className="hidden sm:flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50 transition-all"
                    >
                      {submitting === rfq._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Submit
                    </button>
                  )}
                  {/* Quick action: accept/reject (QUOTED) */}
                  {rfq.status === 'QUOTED' && (
                    <div className="hidden sm:flex items-center gap-1.5">
                      <button
                        onClick={() => handleRespond(rfq._id, 'ACCEPT')}
                        disabled={responding === rfq._id}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-green-400 disabled:opacity-50 transition-all"
                      >
                        {responding === rfq._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(rfq._id, 'REJECT')}
                        disabled={responding === rfq._id}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest disabled:opacity-50 transition-all ${isDark ? 'bg-white/5 text-red-400 hover:bg-red-400/10' : 'bg-slate-100 text-red-500 hover:bg-red-50'}`}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  <div onClick={() => setExpandedId(isExpanded ? null : rfq._id)} className="cursor-pointer p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>
              </div>

              {/* ── Expanded detail ── */}
              {isExpanded && (
                <div className={`border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>

                  {/* Pipeline stepper */}
                  <div className={`px-5 py-4 border-b flex items-center gap-1 overflow-x-auto ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/70'}`}>
                    {PIPELINE_STEPS.map((stepLabel, idx) => {
                      const isDone = idx < currentStep;
                      const isCurrent = idx === currentStep;
                      const isRejectedDone = isTerminal && idx === 4;
                      return (
                        <React.Fragment key={stepLabel}>
                          <div className={`flex items-center gap-1.5 shrink-0 ${isDone || isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ${
                              isDone
                                ? 'bg-yellow-400 text-black'
                                : isCurrent
                                  ? isTerminal
                                    ? 'bg-red-400/20 text-red-400 ring-1 ring-red-400/40'
                                    : 'bg-yellow-400/20 text-yellow-400 ring-1 ring-yellow-400/40'
                                  : isDark ? 'bg-white/5 text-slate-600' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                              isDone || isCurrent ? (isDark ? 'text-slate-300' : 'text-slate-700') : 'text-slate-500'
                            }`}>{isRejectedDone ? (rfq.status === 'REJECTED' ? 'Rejected' : 'Expired') : stepLabel}</span>
                          </div>
                          {idx < PIPELINE_STEPS.length - 1 && (
                            <div className={`h-[1.5px] w-6 sm:w-10 shrink-0 rounded-full ${idx < currentStep ? 'bg-yellow-400' : isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="p-5 space-y-5">

                    {/* Admin notes callout */}
                    {rfq.adminNotes && (
                      <div className={`flex gap-3 px-4 py-3.5 rounded-xl border ${isDark ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-yellow-50 border-yellow-200'}`}>
                        <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-1">Message from Procurement Team</p>
                          <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{rfq.adminNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Quote received — accept/reject (mobile + full panel for all) */}
                    {rfq.status === 'QUOTED' && (
                      <div className={`p-4 rounded-xl border ${isDark ? 'bg-purple-400/5 border-purple-400/20' : 'bg-purple-50 border-purple-200'}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-3">Quote Received — Your Response Required</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleRespond(rfq._id, 'ACCEPT')}
                            disabled={responding === rfq._id}
                            className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-green-400 disabled:opacity-50 transition-all"
                          >
                            {responding === rfq._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Accept Quote
                          </button>
                          <button
                            onClick={() => handleRespond(rfq._id, 'REJECT')}
                            disabled={responding === rfq._id}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest disabled:opacity-50 transition-all ${isDark ? 'bg-white/5 text-red-400 hover:bg-red-400/10' : 'bg-white text-red-500 hover:bg-red-50 border border-red-200'}`}
                          >
                            Reject Quote
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Items table */}
                    {rfq.items.length > 0 ? (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
                          Items ({rfq.items.length})
                        </p>
                        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                          {/* Table header */}
                          <div className={`hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 ${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-slate-50 border-b border-slate-100'}`}>
                            <span>Product</span>
                            <span className="text-right">Qty</span>
                            <span className="text-right">Target</span>
                            <span className="text-right">Quoted</span>
                            <span className="text-right">Delta</span>
                            {isDraft && <span />}
                          </div>
                          {rfq.items.map((item, itemIdx) => {
                            const isEditingThis = editingItem?.rfqId === rfq._id && editingItem?.itemId === item._id;
                            const delta = item.quotedPrice != null && item.targetPrice != null && item.targetPrice > 0
                              ? ((item.quotedPrice - item.targetPrice) / item.targetPrice * 100)
                              : null;
                            return (
                              <div
                                key={item._id}
                                className={`${itemIdx > 0 ? `border-t ${isDark ? 'border-white/5' : 'border-slate-100'}` : ''}`}
                              >
                                {isEditingThis ? (
                                  <div className={`p-4 space-y-3 ${isDark ? 'bg-yellow-400/5' : 'bg-yellow-50/60'}`}>
                                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Quantity</label>
                                        <input type="number" min="1" value={editItemForm.quantity} onChange={e => setEditItemForm(f => ({ ...f, quantity: e.target.value }))} className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none ${inp}`} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target Price (₹)</label>
                                        <input type="number" min="0" value={editItemForm.targetPrice} onChange={e => setEditItemForm(f => ({ ...f, targetPrice: e.target.value }))} placeholder="Optional" className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none ${inp}`} />
                                      </div>
                                      <div className="space-y-1 col-span-2 sm:col-span-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Notes</label>
                                        <input value={editItemForm.notes} onChange={e => setEditItemForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none ${inp}`} />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={handleUpdateItem} disabled={savingItem} className="flex items-center gap-1.5 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50">
                                        {savingItem ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                      </button>
                                      <button onClick={() => setEditingItem(null)} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="px-4 py-3">
                                    {/* Mobile layout */}
                                    <div className="sm:hidden space-y-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</p>
                                        {isDraft && (
                                          <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => startEditItem(rfq._id, item._id, item.quantity, item.targetPrice, item.notes)} className="text-[9px] font-black text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-0.5">
                                              <Pencil className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleRemoveItem(rfq._id, item._id)} className="text-[9px] font-black text-red-400 hover:text-red-300 transition-colors">×</button>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                        <span className="text-[9px] text-slate-500 font-bold">Qty: {item.quantity}</span>
                                        {item.targetPrice != null && <span className="text-[9px] text-slate-500 font-bold">Target: {formatPrice(item.targetPrice)}</span>}
                                        {item.quotedPrice != null && <span className="text-[9px] text-purple-400 font-black">Quoted: {formatPrice(item.quotedPrice)}</span>}
                                        {delta != null && (
                                          <span className={`text-[9px] font-black ${delta <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                                          </span>
                                        )}
                                      </div>
                                      {item.notes && <p className="text-[9px] text-slate-500 italic">{item.notes}</p>}
                                    </div>
                                    {/* Desktop table row */}
                                    <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center">
                                      <div>
                                        <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</p>
                                        {item.notes && <p className="text-[9px] text-slate-500 italic mt-0.5">{item.notes}</p>}
                                      </div>
                                      <span className={`text-xs font-bold text-right tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.quantity}</span>
                                      <span className={`text-xs font-bold text-right tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {item.targetPrice != null ? formatPrice(item.targetPrice) : <span className="text-slate-600">—</span>}
                                      </span>
                                      <span className={`text-xs font-black text-right tabular-nums ${item.quotedPrice != null ? 'text-purple-400' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                        {item.quotedPrice != null ? formatPrice(item.quotedPrice) : '—'}
                                      </span>
                                      <div className="text-right">
                                        {delta != null ? (
                                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${delta <= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                                          </span>
                                        ) : <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>—</span>}
                                      </div>
                                      {isDraft && (
                                        <div className="flex items-center gap-2 justify-end">
                                          <button onClick={() => startEditItem(rfq._id, item._id, item.quantity, item.targetPrice, item.notes)} className="text-[9px] font-black text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1">
                                            <Pencil className="w-3 h-3" /> Edit
                                          </button>
                                          <button onClick={() => handleRemoveItem(rfq._id, item._id)} className="text-[9px] font-black text-red-400 hover:text-red-300 transition-colors">Remove</button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-3 px-4 py-5 rounded-xl border-2 border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                        <Package className="w-5 h-5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No items yet</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Add items below to describe your procurement needs.</p>
                        </div>
                      </div>
                    )}

                    {/* Add item form — DRAFT only */}
                    {isDraft && (
                      <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-zinc-800/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Tag className="w-3 h-3" /> Add Item
                        </p>
                        {addItemError && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <p className="text-[10px] font-bold text-red-400">{addItemError}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Product / Material Name *</label>
                            <input
                              value={addItemForm.productName}
                              onChange={e => setAddItemForm(f => ({ ...f, productName: e.target.value }))}
                              placeholder="e.g. TMT Steel Bars Fe-500"
                              className={`w-full px-3 py-2.5 rounded-lg border text-xs font-bold outline-none transition-colors ${inp}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={addItemForm.quantity}
                              onChange={e => setAddItemForm(f => ({ ...f, quantity: e.target.value }))}
                              className={`w-full px-3 py-2.5 rounded-lg border text-xs font-bold outline-none transition-colors ${inp}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target Price (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={addItemForm.targetPrice}
                              onChange={e => setAddItemForm(f => ({ ...f, targetPrice: e.target.value }))}
                              placeholder="Optional"
                              className={`w-full px-3 py-2.5 rounded-lg border text-xs font-bold outline-none transition-colors ${inp}`}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddItem(rfq._id)}
                          disabled={addingItem || !addItemForm.productName.trim()}
                          className="bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingItem ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          Add Item
                        </button>
                      </div>
                    )}

                    {/* Submit button — DRAFT with items (mobile: always show; desktop already in header row) */}
                    {isDraft && rfq.items.length > 0 && (
                      <div className="flex flex-col items-stretch sm:items-end gap-2 pt-1">
                        {submitting !== rfq._id && submitError && expandedId === rfq._id && (
                          <p className="text-[10px] font-bold text-red-400">{submitError}</p>
                        )}
                        <button
                          onClick={() => handleSubmit(rfq._id)}
                          disabled={submitting === rfq._id}
                          className="sm:hidden bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting === rfq._id ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit RFQ for Pricing</>}
                        </button>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">
                          Ready? Use the <span className="text-yellow-400">Submit</span> button above to send for pricing.
                        </p>
                      </div>
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
