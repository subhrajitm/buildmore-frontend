import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminBannerApi, AdminBanner } from '../api';
import {
  Image as ImageIcon, Loader2, Plus, Pencil, Trash2, Check, X,
  RefreshCw, AlertCircle, ChevronUp, ChevronDown, ToggleLeft, ToggleRight,
  Eye, EyeOff,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const AdminBanners: React.FC = () => {
  const { isDark } = useTheme();
  const { adminToken } = useAdminAuth();
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ headline: '', headlineAccent: '', tag: '', sub: '', cta: '', ctaTo: '' });
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [editForm, setEditForm] = useState({ headline: '', headlineAccent: '', tag: '', sub: '', cta: '', ctaTo: '' });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Per-row action states
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
    adminBannerApi.getAll(adminToken)
      .then(r => setBanners((r.banners || []).sort((a, b) => a.order - b.order)))
      .catch((err: any) => setLoadError(err.message || 'Failed to load banners'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [adminToken]);

  // ── Create ──────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setCreateForm({ headline: '', headlineAccent: '', tag: '', sub: '', cta: '', ctaTo: '' });
    setCreateImage(null);
    setCreateError('');
    if (createFileRef.current) createFileRef.current.value = '';
    setCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (!createForm.headline.trim()) { setCreateError('Headline is required.'); return; }
    if (!createForm.cta.trim()) { setCreateError('CTA label is required.'); return; }
    if (!createForm.ctaTo.trim()) { setCreateError('CTA link is required.'); return; }
    if (!createImage) { setCreateError('Banner image is required.'); return; }
    setCreateError('');
    setSubmitting(true);
    const fd = new FormData();
    fd.append('headline', createForm.headline.trim());
    if (createForm.headlineAccent.trim()) fd.append('headlineAccent', createForm.headlineAccent.trim());
    if (createForm.tag.trim()) fd.append('tag', createForm.tag.trim());
    if (createForm.sub.trim()) fd.append('sub', createForm.sub.trim());
    fd.append('cta', createForm.cta.trim());
    fd.append('ctaTo', createForm.ctaTo.trim());
    fd.append('image', createImage);
    try {
      await adminBannerApi.create(fd, adminToken);
      setCreateOpen(false);
      showToast('Banner created');
      load();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create banner.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────

  const openEdit = (b: AdminBanner) => {
    setEditingBanner(b);
    setEditForm({
      headline: b.headline,
      headlineAccent: b.headlineAccent || '',
      tag: b.tag || '',
      sub: b.sub || '',
      cta: b.cta,
      ctaTo: b.ctaTo,
    });
    setEditImage(null);
    setEditError('');
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !editingBanner) return;
    if (!editForm.headline.trim()) { setEditError('Headline is required.'); return; }
    if (!editForm.cta.trim()) { setEditError('CTA label is required.'); return; }
    if (!editForm.ctaTo.trim()) { setEditError('CTA link is required.'); return; }
    setEditError('');
    setEditSaving(true);
    const fd = new FormData();
    fd.append('headline', editForm.headline.trim());
    if (editForm.headlineAccent.trim()) fd.append('headlineAccent', editForm.headlineAccent.trim());
    if (editForm.tag.trim()) fd.append('tag', editForm.tag.trim());
    if (editForm.sub.trim()) fd.append('sub', editForm.sub.trim());
    fd.append('cta', editForm.cta.trim());
    fd.append('ctaTo', editForm.ctaTo.trim());
    if (editImage) fd.append('image', editImage);
    try {
      await adminBannerApi.update(editingBanner._id, fd, adminToken);
      setEditingBanner(null);
      showToast('Banner updated');
      load();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update banner.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (b: AdminBanner) => {
    if (!adminToken || !window.confirm(`Delete banner "${b.headline}"? This cannot be undone.`)) return;
    setDeletingId(b._id);
    try {
      await adminBannerApi.delete(b._id, adminToken);
      showToast('Banner deleted');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete banner.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Toggle ──────────────────────────────────────────────────────────────────

  const handleToggle = async (b: AdminBanner) => {
    if (!adminToken) return;
    setTogglingId(b._id);
    try {
      await adminBannerApi.toggle(b._id, adminToken);
      showToast(`Banner ${b.active ? 'deactivated' : 'activated'}`);
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle banner.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Reorder ─────────────────────────────────────────────────────────────────

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!adminToken) return;
    const newBanners = [...banners];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newBanners.length) return;
    [newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]];
    const updated = newBanners.map((b, i) => ({ ...b, order: i + 1 }));
    setBanners(updated);
    setReordering(true);
    try {
      await adminBannerApi.reorder(updated.map(b => ({ id: b._id, order: b.order })), adminToken);
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder banners.', 'error');
      load();
    } finally {
      setReordering(false);
    }
  };

  const activeCount = banners.filter(b => b.active).length;

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
          <h1 className={`text-2xl font-black tracking-tight ${textClass}`}>Banners</h1>
          <p className={`text-xs font-bold mt-0.5 ${mutedClass}`}>Manage homepage hero banners</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Stats */}
      {!loading && !loadError && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: banners.length, color: 'text-yellow-400' },
            { label: 'Active', value: activeCount, color: 'text-green-400' },
            { label: 'Inactive', value: banners.length - activeCount, color: 'text-slate-400' },
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
          {banners.length} banner{banners.length !== 1 ? 's' : ''} — ordered by display position
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

      {/* Banner List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      ) : banners.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
          <ImageIcon className="w-16 h-16 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">No banners yet</p>
          <button onClick={openCreate} className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all">
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`rounded-2xl border overflow-hidden flex flex-col sm:flex-row gap-0 transition-all ${cardBg} ${!banner.active ? 'opacity-60' : ''}`}
            >
              {/* Image */}
              <div className={`sm:w-48 h-32 sm:h-auto shrink-0 relative flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                {banner.image ? (
                  <img src={banner.image} alt={banner.headline} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400 opacity-30" />
                )}
                {/* Order badge */}
                <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isDark ? 'bg-black/70 text-slate-300' : 'bg-white/80 text-slate-700'}`}>
                  {banner.order}
                </div>
                {/* Active badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${banner.active ? 'bg-green-500 text-white' : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-500'}`}>
                  {banner.active ? 'Active' : 'Off'}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between gap-3 min-w-0">
                <div>
                  {banner.tag && (
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-yellow-400/10 text-yellow-400 mb-1">{banner.tag}</span>
                  )}
                  <p className={`text-base font-black leading-tight ${textClass}`}>
                    {banner.headline}
                    {banner.headlineAccent && <span className="text-yellow-400"> {banner.headlineAccent}</span>}
                  </p>
                  {banner.sub && <p className={`text-xs mt-1 line-clamp-1 ${mutedClass}`}>{banner.sub}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{banner.cta}</span>
                    <span className={`text-[10px] font-mono truncate max-w-[180px] ${mutedClass}`}>{banner.ctaTo}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Reorder */}
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0 || reordering}
                    title="Move up"
                    className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === banners.length - 1 || reordering}
                    title="Move down"
                    className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(banner)}
                    disabled={togglingId === banner._id}
                    title={banner.active ? 'Deactivate' : 'Activate'}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${
                      banner.active
                        ? isDark ? 'text-green-400 hover:bg-green-400/10' : 'text-green-600 hover:bg-green-50'
                        : isDark ? 'text-slate-500 hover:bg-white/5 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    {togglingId === banner._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : banner.active ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    {banner.active ? 'Active' : 'Inactive'}
                  </button>

                  <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(banner)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(banner)}
                    disabled={deletingId === banner._id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === banner._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/50">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-yellow-400" />
                </div>
                <h2 className={`text-sm font-black uppercase tracking-wider ${textClass}`}>New Banner</h2>
              </div>
              <button onClick={() => setCreateOpen(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {createError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-400">{createError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Headline *</label>
                  <input value={createForm.headline} onChange={e => setCreateForm(f => ({ ...f, headline: e.target.value }))} className={inputStyle} placeholder="e.g. Build Smarter" autoFocus />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Headline Accent <span className="normal-case font-medium">(optional, shown in yellow)</span></label>
                  <input value={createForm.headlineAccent} onChange={e => setCreateForm(f => ({ ...f, headlineAccent: e.target.value }))} className={inputStyle} placeholder="e.g. With Us" />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Tag <span className="normal-case font-medium">(optional)</span></label>
                  <input value={createForm.tag} onChange={e => setCreateForm(f => ({ ...f, tag: e.target.value }))} className={inputStyle} placeholder="e.g. New" />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>CTA Label *</label>
                  <input value={createForm.cta} onChange={e => setCreateForm(f => ({ ...f, cta: e.target.value }))} className={inputStyle} placeholder="e.g. Shop Now" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Sub-headline <span className="normal-case font-medium">(optional)</span></label>
                  <input value={createForm.sub} onChange={e => setCreateForm(f => ({ ...f, sub: e.target.value }))} className={inputStyle} placeholder="e.g. Quality materials delivered fast" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>CTA Link *</label>
                  <input value={createForm.ctaTo} onChange={e => setCreateForm(f => ({ ...f, ctaTo: e.target.value }))} className={inputStyle} placeholder="e.g. /products" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Banner Image *</label>
                <input
                  ref={createFileRef}
                  type="file"
                  accept="image/*"
                  onChange={e => setCreateImage(e.target.files?.[0] || null)}
                  className={`${inputStyle} p-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black file:cursor-pointer`}
                />
                {createImage && <p className="text-[10px] font-bold text-yellow-400">{createImage.name} ({(createImage.size / 1024).toFixed(0)} KB)</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreateOpen(false)} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Check className="w-4 h-4" /> Create Banner</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/50">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h2 className={`text-sm font-black uppercase tracking-wider ${textClass}`}>Edit Banner</h2>
                  <p className={`text-[10px] font-bold ${mutedClass}`}>{editingBanner.headline}</p>
                </div>
              </div>
              <button onClick={() => setEditingBanner(null)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {editError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-400">{editError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Headline *</label>
                  <input value={editForm.headline} onChange={e => setEditForm(f => ({ ...f, headline: e.target.value }))} className={inputStyle} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Headline Accent <span className="normal-case font-medium">(optional)</span></label>
                  <input value={editForm.headlineAccent} onChange={e => setEditForm(f => ({ ...f, headlineAccent: e.target.value }))} className={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Tag <span className="normal-case font-medium">(optional)</span></label>
                  <input value={editForm.tag} onChange={e => setEditForm(f => ({ ...f, tag: e.target.value }))} className={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>CTA Label *</label>
                  <input value={editForm.cta} onChange={e => setEditForm(f => ({ ...f, cta: e.target.value }))} className={inputStyle} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Sub-headline <span className="normal-case font-medium">(optional)</span></label>
                  <input value={editForm.sub} onChange={e => setEditForm(f => ({ ...f, sub: e.target.value }))} className={inputStyle} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>CTA Link *</label>
                  <input value={editForm.ctaTo} onChange={e => setEditForm(f => ({ ...f, ctaTo: e.target.value }))} className={inputStyle} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Replace Image <span className="normal-case font-medium">(optional)</span></label>
                <div className="flex items-center gap-3">
                  {editingBanner.image && !editImage && (
                    <img src={editingBanner.image} alt={editingBanner.headline} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                  )}
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    onChange={e => setEditImage(e.target.files?.[0] || null)}
                    className={`${inputStyle} p-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black file:cursor-pointer flex-1`}
                  />
                </div>
                {editImage && <p className="text-[10px] font-bold text-yellow-400">New: {editImage.name} ({(editImage.size / 1024).toFixed(0)} KB)</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingBanner(null)} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button type="submit" disabled={editSaving} className="flex-1 bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
