import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, Clock, CheckCircle, XCircle, FileText, Search, ChevronDown, ChevronUp, Send, Loader2, AlertCircle, Package, Pencil, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rfqApi, RFQ } from '../api';
import { useLocation } from 'react-router-dom';

interface RFQsProps {
  isDark: boolean;
}

const STATUS_MAP: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  DRAFT:        { label: 'Draft',        icon: FileText,    color: 'text-slate-400',  bg: 'bg-slate-400/10 border-slate-400/20' },
  SUBMITTED:    { label: 'Submitted',    icon: Clock,       color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
  UNDER_REVIEW: { label: 'Under Review', icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  QUOTED:       { label: 'Quoted',       icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  ACCEPTED:     { label: 'Accepted',     icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
  REJECTED:     { label: 'Rejected',     icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
  EXPIRED:      { label: 'Expired',      icon: XCircle,     color: 'text-slate-500',  bg: 'bg-slate-500/10 border-slate-500/20' },
};

const STATUS_OPTIONS = ['All', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

export const RFQs: React.FC<RFQsProps> = ({ isDark }) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 transition-all duration-500">
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

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{error}</p>
        </div>
      )}

      {/* New RFQ form */}
      {showNewForm && (
        <div className={`p-6 rounded-2xl border space-y-4 transition-all duration-300 ${isDark ? 'bg-zinc-900 border-yellow-400/20' : 'bg-white border-yellow-400/30 shadow-xl'}`}>
          <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New RFQ</h3>
          {createError && <p className="text-xs text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-lg">{createError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notes / Description</label>
              <input
                type="text"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="e.g. Q3 Safety Gear Procurement — Site A"
                className={`w-full py-3 px-4 rounded-xl border text-sm outline-none transition-all ${inp}`}
              />
            </div>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry Date (optional)</label>
              <input
                type="date"
                value={newExpiry}
                onChange={e => setNewExpiry(e.target.value)}
                className={`w-full py-3 px-4 rounded-xl border text-sm outline-none transition-all ${inp}`}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            After creating, add items and submit for a quote from our team.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowNewForm(false); setNewNotes(''); setNewExpiry(''); setCreateError(''); }}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRFQ}
              disabled={creating}
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Draft</>}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total RFQ Value', value: `$${(totalValue / 1000).toFixed(1)}K`, sub: `${rfqs.length} requests` },
          { label: 'Pending Review', value: pendingCount, sub: 'awaiting response' },
          { label: 'Accepted', value: acceptedCount, sub: 'all time' },
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
        <div className="flex flex-wrap items-center gap-2">
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

      {/* RFQ list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No RFQs found</p>
          </div>
        )}
        {filtered.map(rfq => {
          const s = STATUS_MAP[rfq.status] ?? STATUS_MAP['DRAFT'];
          const isExpanded = expandedId === rfq._id;
          const isDraft = rfq.status === 'DRAFT';

          return (
            <div key={rfq._id} className={`rounded-2xl border transition-all ${isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-lg'}`}>
              {/* Row */}
              <div
                className="p-5 flex items-center gap-6 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : rfq._id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rfq.rfqNumber}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.bg} ${s.color}`}>
                      <s.icon className="w-2.5 h-2.5" />
                      {s.label}
                    </span>
                  </div>
                  <h3 className={`text-sm font-black uppercase leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {rfq.notes || 'No description'}
                  </h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{rfq.items.length} item{rfq.items.length !== 1 ? 's' : ''}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Created: {new Date(rfq.createdAt).toLocaleDateString()}</span>
                    {rfq.expiresAt && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Expires: {new Date(rfq.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${rfq.totalEstimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Est. Value</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
              </div>

              {/* Expanded section */}
              {isExpanded && (
                <div className={`border-t px-5 pb-5 pt-4 space-y-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  {/* Items list */}
                  {rfq.items.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Items</p>
                      {rfq.items.map(item => {
                        const isEditingThis = editingItem?.rfqId === rfq._id && editingItem?.itemId === item._id;
                        return (
                          <div key={item._id} className={`px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                            {isEditingThis ? (
                              <div className="space-y-2">
                                <p className={`text-xs font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</p>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Qty</label>
                                    <input type="number" min="1" value={editItemForm.quantity} onChange={e => setEditItemForm(f => ({ ...f, quantity: e.target.value }))} className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold outline-none ${inp}`} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target ($)</label>
                                    <input type="number" min="0" value={editItemForm.targetPrice} onChange={e => setEditItemForm(f => ({ ...f, targetPrice: e.target.value }))} placeholder="—" className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold outline-none ${inp}`} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Notes</label>
                                    <input value={editItemForm.notes} onChange={e => setEditItemForm(f => ({ ...f, notes: e.target.value }))} placeholder="—" className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold outline-none ${inp}`} />
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button onClick={handleUpdateItem} disabled={savingItem} className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50">
                                    {savingItem ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                  </button>
                                  <button onClick={() => setEditingItem(null)} className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase">Qty: {item.quantity}</span>
                                    {item.targetPrice != null && <span className="text-[9px] text-slate-500 font-bold uppercase">Target: ${item.targetPrice}</span>}
                                    {item.quotedPrice != null && <span className="text-[9px] text-yellow-400 font-bold uppercase">Quoted: ${item.quotedPrice}</span>}
                                    {item.notes && <span className="text-[9px] text-slate-500 italic">{item.notes}</span>}
                                  </div>
                                </div>
                                {isDraft && (
                                  <div className="flex items-center gap-3">
                                    <button onClick={() => startEditItem(rfq._id, item._id, item.quantity, item.targetPrice, item.notes)} className="text-[9px] font-black uppercase text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1">
                                      <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                    <button onClick={() => handleRemoveItem(rfq._id, item._id)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-300 transition-colors">
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-3">
                      <Package className="w-4 h-4 text-slate-500" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No items yet — add items below</p>
                    </div>
                  )}

                  {/* Add item form — only for DRAFT */}
                  {isDraft && (
                    <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-zinc-800 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Add Item</p>
                      {addItemError && <p className="text-xs text-red-400 font-bold">{addItemError}</p>}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Product Name *</label>
                          <input
                            value={addItemForm.productName}
                            onChange={e => setAddItemForm(f => ({ ...f, productName: e.target.value }))}
                            placeholder="e.g. Safety Helmet"
                            className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none transition-colors ${inp}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={addItemForm.quantity}
                            onChange={e => setAddItemForm(f => ({ ...f, quantity: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none transition-colors ${inp}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target Price ($)</label>
                          <input
                            type="number"
                            min="0"
                            value={addItemForm.targetPrice}
                            onChange={e => setAddItemForm(f => ({ ...f, targetPrice: e.target.value }))}
                            placeholder="Optional"
                            className={`w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none transition-colors ${inp}`}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddItem(rfq._id)}
                        disabled={addingItem || !addItemForm.productName.trim()}
                        className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingItem ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add Item
                      </button>
                    </div>
                  )}

                  {/* Admin notes */}
                  {rfq.adminNotes && (
                    <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-yellow-400/5 border border-yellow-400/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-1">Admin Notes</p>
                      <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{rfq.adminNotes}</p>
                    </div>
                  )}

                  {/* Submit button — only for DRAFT with items */}
                  {isDraft && rfq.items.length > 0 && (
                    <div className="flex flex-col items-end gap-2 pt-2">
                      {submitting !== rfq._id && submitError && expandedId === rfq._id && (
                        <p className="text-[10px] font-bold text-red-400">{submitError}</p>
                      )}
                      <button
                        onClick={() => handleSubmit(rfq._id)}
                        disabled={submitting === rfq._id}
                        className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting === rfq._id
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                          : <><Send className="w-4 h-4" /> Submit RFQ</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
