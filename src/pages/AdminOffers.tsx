import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminOfferApi, AdminOffer } from '../api';
import {
  Loader2, Plus, Pencil, Trash2, Check, X,
  RefreshCw, AlertCircle, ChevronUp, ChevronDown,
  ToggleLeft, ToggleRight, Tag, Percent,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GRADIENT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Purple → Blue',  value: 'from-purple-600 to-blue-600' },
  { label: 'Orange → Red',   value: 'from-orange-500 to-red-600' },
  { label: 'Teal → Cyan',    value: 'from-teal-500 to-cyan-600' },
  { label: 'Pink → Purple',  value: 'from-pink-500 to-purple-600' },
  { label: 'Yellow → Orange',value: 'from-yellow-400 to-orange-500' },
  { label: 'Green → Teal',   value: 'from-green-500 to-teal-600' },
  { label: 'Blue → Indigo',  value: 'from-blue-500 to-indigo-600' },
  { label: 'Rose → Pink',    value: 'from-rose-500 to-pink-600' },
];

const EMPTY_FORM = { title: '', tag: '', discount: '', desc: '', color: GRADIENT_OPTIONS[0].value };

export const AdminOffers: React.FC = () => {
  const { isDark } = useTheme();
  const { adminToken } = useAdminAuth();
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Per-row states
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputStyle = `w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'}`;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    if (!adminToken) return;
    setLoading(true);
    setLoadError('');
    adminOfferApi.getAll(adminToken)
      .then(r => setOffers((r.offers || []).sort((a, b) => a.order - b.order)))
      .catch((err: any) => setLoadError(err.message || 'Failed to load offers'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [adminToken]);

  // ── Create ──────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setCreateForm(EMPTY_FORM);
    setCreateImage(null);
    setCreateError('');
    if (createFileRef.current) createFileRef.current.value = '';
    setCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (!createForm.title.trim()) { setCreateError('Title is required.'); return; }
    if (!createForm.discount.trim()) { setCreateError('Discount text is required.'); return; }
    if (!createImage) { setCreateError('Offer image is required.'); return; }
    setCreateError('');
    setSubmitting(true);
    const fd = new FormData();
    fd.append('title', createForm.title.trim());
    fd.append('discount', createForm.discount.trim());
    fd.append('color', createForm.color);
    fd.append('image', createImage);
    if (createForm.tag.trim()) fd.append('tag', createForm.tag.trim());
    if (createForm.desc.trim()) fd.append('desc', createForm.desc.trim());
    try {
      await adminOfferApi.create(fd, adminToken);
      setCreateOpen(false);
      showToast('Offer created');
      load();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create offer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────

  const openEdit = (o: AdminOffer) => {
    setEditingOffer(o);
    setEditForm({ title: o.title, tag: o.tag || '', discount: o.discount, desc: o.desc || '', color: o.color });
    setEditImage(null);
    setEditError('');
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !editingOffer) return;
    if (!editForm.title.trim()) { setEditError('Title is required.'); return; }
    if (!editForm.discount.trim()) { setEditError('Discount text is required.'); return; }
    setEditError('');
    setEditSaving(true);
    const fd = new FormData();
    fd.append('title', editForm.title.trim());
    fd.append('discount', editForm.discount.trim());
    fd.append('color', editForm.color);
    if (editForm.tag.trim()) fd.append('tag', editForm.tag.trim());
    if (editForm.desc.trim()) fd.append('desc', editForm.desc.trim());
    if (editImage) fd.append('image', editImage);
    try {
      await adminOfferApi.update(editingOffer._id, fd, adminToken);
      setEditingOffer(null);
      showToast('Offer updated');
      load();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update offer.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (o: AdminOffer) => {
    if (!adminToken || !window.confirm(`Delete offer "${o.title}"? This cannot be undone.`)) return;
    setDeletingId(o._id);
    try {
      await adminOfferApi.delete(o._id, adminToken);
      showToast('Offer deleted');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete offer.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Toggle ──────────────────────────────────────────────────────────────────

  const handleToggle = async (o: AdminOffer) => {
    if (!adminToken) return;
    setTogglingId(o._id);
    try {
      await adminOfferApi.toggle(o._id, adminToken);
      showToast(`Offer ${o.active ? 'deactivated' : 'activated'}`);
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle offer.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Reorder ─────────────────────────────────────────────────────────────────

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!adminToken) return;
    const updated = [...offers];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= updated.length) return;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    const reordered = updated.map((o, i) => ({ ...o, order: i + 1 }));
    setOffers(reordered);
    setReordering(true);
    try {
      await adminOfferApi.reorder(reordered.map(o => ({ id: o._id, order: o.order })), adminToken);
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder offers.', 'error');
      load();
    } finally {
      setReordering(false);
    }
  };

  const activeCount = offers.filter(o => o.active).length;

  const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
    <div className="grid grid-cols-4 gap-2">
      {GRADIENT_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={`h-9 rounded-lg bg-gradient-to-tr ${opt.value} transition-all ${value === opt.value ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent scale-105' : 'opacity-70 hover:opacity-100'}`}
        />
      ))}
    </div>
  );

  const ModalForm: React.FC<{
    title: string;
    form: typeof EMPTY_FORM;
    setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
    image: File | null;
    setImage: (f: File | null) => void;
    fileRef: React.RefObject<HTMLInputElement>;
    error: string;
    saving: boolean;
    existingImage?: string;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    submitLabel: string;
  }> = ({ title, form, setForm, image, setImage, fileRef, error, saving, existingImage, onSubmit, onClose, submitLabel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/50">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <Percent className="w-4 h-4 text-yellow-400" />
            </div>
            <h2 className={`text-sm font-black uppercase tracking-wider ${textClass}`}>{title}</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputStyle} placeholder="e.g. Flash Sale Steel" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Discount *</label>
              <input value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className={inputStyle} placeholder="e.g. Up to 40% OFF" />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Tag <span className="normal-case font-medium">(optional)</span></label>
              <input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} className={inputStyle} placeholder="e.g. Flash Deal" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Description <span className="normal-case font-medium">(optional)</span></label>
              <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} className={inputStyle} placeholder="e.g. Limited time offer on all steel products" />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Background Gradient</label>
            <ColorPicker value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} />
            <p className={`text-[10px] font-mono ${mutedClass}`}>{form.color}</p>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>
              Offer Image {existingImage ? <span className="normal-case font-medium">(optional — keep current if blank)</span> : '*'}
            </label>
            <div className="flex items-center gap-3">
              {existingImage && !image && (
                <img src={existingImage} alt="current" className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
                className={`${inputStyle} p-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black file:cursor-pointer flex-1`}
              />
            </div>
            {image && <p className="text-[10px] font-bold text-yellow-400">{image.name} ({(image.size / 1024).toFixed(0)} KB)</p>}
          </div>

          {/* Live preview */}
          {(form.title || form.discount) && (
            <div className={`rounded-xl overflow-hidden relative h-20 ${isDark ? 'border border-white/10' : 'border border-slate-200'}`}>
              <div className={`absolute inset-0 bg-gradient-to-tr ${form.color} opacity-70`} />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 h-full flex flex-col justify-center px-4 text-white">
                {form.tag && <span className="text-[8px] font-black uppercase tracking-widest bg-yellow-400 text-black px-1.5 py-0.5 rounded w-fit mb-1">{form.tag}</span>}
                <p className="text-sm font-black leading-tight">{form.title || 'Title'}</p>
                <p className="text-base font-black text-yellow-300 italic">{form.discount || 'Discount'}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> {submitLabel}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest z-[60] shadow-xl ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${textClass}`}>Bumper Offers</h1>
          <p className={`text-xs font-bold mt-0.5 ${mutedClass}`}>Manage homepage Bumper Offers slider</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Add Offer
        </button>
      </div>

      {/* Stats */}
      {!loading && !loadError && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: offers.length, color: 'text-yellow-400' },
            { label: 'Active', value: activeCount, color: 'text-green-400' },
            { label: 'Inactive', value: offers.length - activeCount, color: 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${cardBg}`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${mutedClass}`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className={`rounded-2xl border p-4 flex items-center justify-between ${cardBg}`}>
        <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>
          {offers.length} offer{offers.length !== 1 ? 's' : ''} — ordered by display position
        </p>
        <button
          onClick={load}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {loadError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{loadError}</p>
          <button onClick={load} className="ml-auto text-xs font-black text-red-400 underline uppercase tracking-widest">Retry</button>
        </div>
      )}

      {/* Offer list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      ) : offers.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
          <Percent className="w-16 h-16 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">No offers yet</p>
          <button onClick={openCreate} className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all">
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer, index) => (
            <div
              key={offer._id}
              className={`rounded-2xl border overflow-hidden flex flex-col sm:flex-row transition-all ${cardBg} ${!offer.active ? 'opacity-60' : ''}`}
            >
              {/* Gradient preview + image */}
              <div className={`sm:w-48 h-32 sm:h-auto shrink-0 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-tr ${offer.color} opacity-70`} />
                <div className="absolute inset-0 bg-black/40" />
                {offer.image && (
                  <img src={offer.image} alt={offer.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                {/* Overlaid text preview */}
                <div className="relative z-10 h-full flex flex-col justify-end p-3 text-white">
                  <p className="text-xs font-black leading-tight line-clamp-1">{offer.title}</p>
                  <p className="text-sm font-black text-yellow-300 italic">{offer.discount}</p>
                </div>
                {/* Order badge */}
                <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isDark ? 'bg-black/70 text-slate-300' : 'bg-white/80 text-slate-700'}`}>
                  {offer.order}
                </div>
                {/* Active badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${offer.active ? 'bg-green-500 text-white' : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-500'}`}>
                  {offer.active ? 'Active' : 'Off'}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between gap-3 min-w-0">
                <div>
                  {offer.tag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-yellow-400/10 text-yellow-400 mb-1">
                      <Tag className="w-2.5 h-2.5" />{offer.tag}
                    </span>
                  )}
                  <p className={`text-base font-black leading-tight ${textClass}`}>{offer.title}</p>
                  <p className="text-sm font-black text-yellow-400 italic">{offer.discount}</p>
                  {offer.desc && <p className={`text-xs mt-1 line-clamp-1 ${mutedClass}`}>{offer.desc}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => handleMove(index, 'up')} disabled={index === 0 || reordering} title="Move up"
                    className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleMove(index, 'down')} disabled={index === offers.length - 1 || reordering} title="Move down"
                    className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                  <button onClick={() => handleToggle(offer)} disabled={togglingId === offer._id} title={offer.active ? 'Deactivate' : 'Activate'}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${
                      offer.active
                        ? isDark ? 'text-green-400 hover:bg-green-400/10' : 'text-green-600 hover:bg-green-50'
                        : isDark ? 'text-slate-500 hover:bg-white/5 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}>
                    {togglingId === offer._id ? <Loader2 className="w-4 h-4 animate-spin" /> : offer.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {offer.active ? 'Active' : 'Inactive'}
                  </button>

                  <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                  <button onClick={() => openEdit(offer)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button onClick={() => handleDelete(offer)} disabled={deletingId === offer._id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                    {deletingId === offer._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <ModalForm
          title="New Offer"
          form={createForm}
          setForm={setCreateForm}
          image={createImage}
          setImage={setCreateImage}
          fileRef={createFileRef}
          error={createError}
          saving={submitting}
          onSubmit={handleCreate}
          onClose={() => setCreateOpen(false)}
          submitLabel="Create Offer"
        />
      )}

      {/* Edit modal */}
      {editingOffer && (
        <ModalForm
          title="Edit Offer"
          form={editForm}
          setForm={setEditForm}
          image={editImage}
          setImage={setEditImage}
          fileRef={editFileRef}
          error={editError}
          saving={editSaving}
          existingImage={editingOffer.image}
          onSubmit={handleUpdate}
          onClose={() => setEditingOffer(null)}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
};
