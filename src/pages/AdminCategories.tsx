import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { categoryApi, adminCategoryApi, Category } from '../api';
import {
  Layers, Loader2, Plus, Pencil, Trash2, Check, X,
  Search, RefreshCw, Image as ImageIcon, Tag, AlertCircle,
  Hash, Copy, CheckCheck,
} from 'lucide-react';

/** Converts a category name to a URL slug for preview */
const toSlug = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

interface AdminCategoriesProps {
  isDark: boolean;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatImage, setEditCatImage] = useState<File | null>(null);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Subcategories
  const [newSubcatName, setNewSubcatName] = useState('');
  const [subcatError, setSubcatError] = useState('');
  const [subcatAdding, setSubcatAdding] = useState(false);

  // Slug copy feedback
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const copySlug = (slug: string) => {
    navigator.clipboard?.writeText(slug).catch(() => {});
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputStyle = `w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'}`;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    setLoading(true);
    setLoadError('');
    categoryApi.getAll()
      .then(r => setCategories(r.categories || []))
      .catch((err: any) => setLoadError(err.message || 'Failed to load categories'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setNewCatName('');
    setNewCatDesc('');
    setNewCatImage(null);
    setCreateError('');
    if (fileRef.current) fileRef.current.value = '';
    setCreateOpen(true);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setCreateError('Category name is required.');
      return;
    }
    if (trimmedName.length < 2) {
      setCreateError('Category name must be at least 2 characters.');
      return;
    }
    if (trimmedName.length > 100) {
      setCreateError('Category name must be 100 characters or fewer.');
      return;
    }
    const duplicate = categories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() || c.slug === toSlug(trimmedName)
    );
    if (duplicate) {
      setCreateError(`A category named "${duplicate.name}" already exists (slug: ${duplicate.slug}).`);
      return;
    }
    setCreateError('');
    setSubmitting(true);
    const fd = new FormData();
    fd.append('name', trimmedName);
    if (newCatDesc.trim()) fd.append('description', newCatDesc.trim());
    if (newCatImage) fd.append('image', newCatImage);
    try {
      await adminCategoryApi.create(fd, adminToken);
      setCreateOpen(false);
      showToast('Category created successfully');
      load();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
    setEditCatImage(null);
    setEditError('');
    setNewSubcatName('');
    setSubcatError('');
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleUpdateCategory = async (id: string) => {
    if (!adminToken) return;
    const trimmedEdit = editCatName.trim();
    if (!trimmedEdit) {
      setEditError('Category name cannot be empty.');
      return;
    }
    if (trimmedEdit.length < 2) {
      setEditError('Category name must be at least 2 characters.');
      return;
    }
    if (trimmedEdit.length > 100) {
      setEditError('Category name must be 100 characters or fewer.');
      return;
    }
    const duplicate = categories.find(
      c => c._id !== id && (c.name.toLowerCase() === trimmedEdit.toLowerCase() || c.slug === toSlug(trimmedEdit))
    );
    if (duplicate) {
      setEditError(`A category named "${duplicate.name}" already exists (slug: ${duplicate.slug}).`);
      return;
    }
    setEditError('');
    setEditSaving(true);
    const fd = new FormData();
    fd.append('name', trimmedEdit);
    if (editCatDesc.trim()) fd.append('description', editCatDesc.trim());
    if (editCatImage) fd.append('image', editCatImage);
    try {
      await adminCategoryApi.update(id, fd, adminToken);
      setEditingId(null);
      showToast('Category updated');
      load();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update category. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!adminToken || !window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await adminCategoryApi.delete(id, adminToken);
      showToast('Category deleted');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSubcat = async (categoryId: string) => {
    if (!adminToken) return;
    const trimmedSubcat = newSubcatName.trim();
    if (!trimmedSubcat) {
      setSubcatError('Subcategory name is required.');
      return;
    }
    if (trimmedSubcat.length < 2) {
      setSubcatError('Subcategory name must be at least 2 characters.');
      return;
    }
    if (trimmedSubcat.length > 80) {
      setSubcatError('Subcategory name must be 80 characters or fewer.');
      return;
    }
    const cat = categories.find(c => c._id === categoryId);
    const dupSubcat = cat?.subcategories?.find(
      s => s.name.toLowerCase() === trimmedSubcat.toLowerCase() || s.slug === toSlug(trimmedSubcat)
    );
    if (dupSubcat) {
      setSubcatError(`"${dupSubcat.name}" already exists in this category.`);
      return;
    }
    setSubcatError('');
    setSubcatAdding(true);
    try {
      await adminCategoryApi.addSubcategory(categoryId, { name: trimmedSubcat }, adminToken);
      setNewSubcatName('');
      showToast('Subcategory added');
      load();
    } catch (err: any) {
      setSubcatError(err.message || 'Failed to add subcategory.');
    } finally {
      setSubcatAdding(false);
    }
  };

  const handleRemoveSubcat = async (categoryId: string, subId: string, subName: string) => {
    if (!adminToken || !window.confirm(`Remove subcategory "${subName}"?`)) return;
    try {
      await adminCategoryApi.removeSubcategory(categoryId, subId, adminToken);
      showToast('Subcategory removed');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove subcategory.', 'error');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subcategories?.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSubcats = categories.reduce((s, c) => s + (c.subcategories?.length || 0), 0);
  const withImage = categories.filter(c => !!c.image).length;
  const withoutImage = categories.length - withImage;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest z-[60] shadow-xl ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          {toast.msg}
        </div>
      )}

      {/* Stats summary */}
      {!loading && !loadError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Categories', value: categories.length, color: 'text-yellow-400', bg: isDark ? 'bg-yellow-400/10' : 'bg-yellow-50' },
            { label: 'Total Subcategories', value: totalSubcats, color: 'text-blue-400', bg: isDark ? 'bg-blue-400/10' : 'bg-blue-50' },
            { label: 'With Image', value: withImage, color: 'text-green-400', bg: isDark ? 'bg-green-400/10' : 'bg-green-50' },
            { label: 'No Image', value: withoutImage, color: 'text-slate-400', bg: isDark ? 'bg-white/5' : 'bg-slate-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${cardBg}`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${mutedClass}`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className={`rounded-2xl border p-4 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories or subcategories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            {searchQuery && (
              <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${mutedClass}`}>
                {filteredCategories.length} of {categories.length}
              </span>
            )}
            <button
              onClick={load}
              title="Refresh"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'} transition-all`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Load error */}
      {loadError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{loadError}</p>
          <button onClick={load} className="ml-auto text-xs font-black text-red-400 underline uppercase tracking-widest">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
      ) : filteredCategories.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
          <Layers className="w-16 h-16 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
            {searchQuery ? `No categories match "${searchQuery}"` : 'No categories yet'}
          </p>
          {!searchQuery && (
            <button onClick={openCreate} className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all">
              Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map(cat => {
            const subcatCount = cat.subcategories?.length || 0;
            return (
              <div key={cat._id} className={`rounded-2xl border overflow-hidden ${cardBg} flex flex-col group`}>
                {/* Image area */}
                <div className={`h-44 relative flex items-center justify-center border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-10 h-10 text-slate-400 opacity-40" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 opacity-60">No Image</span>
                    </div>
                  )}
                  {/* Subcategory count badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow ${subcatCount > 0 ? 'bg-yellow-400 text-black' : isDark ? 'bg-black/60 text-slate-400' : 'bg-white/80 text-slate-500'}`}>
                      <Tag className="w-2.5 h-2.5" />
                      {subcatCount} sub{subcatCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all shadow-lg"
                      title="Edit category"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      disabled={deletingId === cat._id}
                      className="p-2 rounded-lg bg-red-500/80 backdrop-blur-md text-white hover:bg-red-500 transition-all shadow-lg disabled:opacity-50"
                      title="Delete category"
                    >
                      {deletingId === cat._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className={`text-base font-black tracking-tight leading-tight ${textClass}`}>{cat.name}</h3>
                    {/* Slug chip */}
                    <button
                      onClick={() => copySlug(cat.slug)}
                      title="Copy slug"
                      className={`mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-colors ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-yellow-400' : 'bg-slate-100 text-slate-500 hover:bg-yellow-50 hover:text-yellow-600'}`}
                    >
                      {copiedSlug === cat.slug ? <CheckCheck className="w-3 h-3 text-green-400" /> : <Hash className="w-3 h-3" />}
                      {cat.slug}
                    </button>
                  </div>

                  <p className={`text-xs leading-relaxed line-clamp-2 ${cat.description ? mutedClass : `italic opacity-40 ${mutedClass}`}`}>
                    {cat.description || 'No description provided.'}
                  </p>

                  {/* Subcategory pills */}
                  <div className={`pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    {subcatCount === 0 ? (
                      <p className={`text-[10px] italic ${mutedClass} opacity-60`}>No subcategories — click Edit to add some</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.slice(0, 6).map(sub => (
                          <span
                            key={sub._id}
                            title={`Slug: ${sub.slug}`}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                          >
                            <Tag className="w-2.5 h-2.5 opacity-50" />
                            {sub.name}
                          </span>
                        ))}
                        {subcatCount > 6 && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                            +{subcatCount - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Category Modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/50">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-yellow-400" />
                </div>
                <h2 className={`text-sm font-black uppercase tracking-wider ${textClass}`}>New Category</h2>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCategory} className="p-6 space-y-5">
              {createError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-400">{createError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Category Name *</label>
                <input
                  required
                  value={newCatName}
                  onChange={e => { setNewCatName(e.target.value); if (createError) setCreateError(''); }}
                  className={inputStyle}
                  placeholder="e.g. Tiles & Flooring"
                  autoFocus
                />
                {newCatName.trim() && (() => {
                  const slug = toSlug(newCatName);
                  const dupe = categories.find(c => c.name.toLowerCase() === newCatName.trim().toLowerCase() || c.slug === slug);
                  return (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md w-fit text-[9px] font-mono font-bold ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        <Hash className="w-3 h-3" />
                        Slug: <span className={dupe ? 'text-red-400' : 'text-yellow-400'}>{slug}</span>
                      </div>
                      {dupe && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md w-fit text-[9px] font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Conflicts with existing category "{dupe.name}"
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Description <span className="normal-case font-medium">(optional)</span></label>
                <textarea
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  rows={3}
                  className={`${inputStyle} resize-none`}
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Category Image <span className="normal-case font-medium">(optional)</span></label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={e => setNewCatImage(e.target.files?.[0] || null)}
                  className={`${inputStyle} p-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black file:cursor-pointer`}
                />
                {newCatImage && (
                  <p className="text-[10px] font-bold text-yellow-400 mt-1">
                    Selected: {newCatImage.name} ({(newCatImage.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-yellow-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Check className="w-4 h-4" /> Create Category</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit / Manage Category Modal ── */}
      {editingId && (() => {
        const cat = categories.find(c => c._id === editingId);
        if (!cat) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/50">
            <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>

              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className={`text-sm font-black uppercase tracking-wider ${textClass}`}>Manage Category</h2>
                    <p className={`text-[10px] font-bold ${mutedClass}`}>{cat.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

                {/* Left: Edit Details */}
                <div className={`flex-1 p-6 overflow-y-auto lg:border-r ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-[10px] font-black uppercase tracking-widest mb-5 ${mutedClass}`}>Category Details</h3>

                  {editError && (
                    <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-red-400">{editError}</p>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Name *</label>
                      <input
                        value={editCatName}
                        onChange={e => { setEditCatName(e.target.value); if (editError) setEditError(''); }}
                        className={inputStyle}
                      />
                      {editCatName.trim() && editCatName.trim() !== cat.name && (
                        <div className={`flex items-center gap-1.5 mt-1 px-2 py-1 rounded-md w-fit text-[9px] font-mono font-bold ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          <Hash className="w-3 h-3" />
                          New slug: <span className="text-yellow-400">{toSlug(editCatName)}</span>
                        </div>
                      )}
                      {editCatName.trim() === cat.name && (
                        <div className={`flex items-center gap-1.5 mt-1 px-2 py-1 rounded-md w-fit text-[9px] font-mono font-bold ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          <Hash className="w-3 h-3" />
                          Current slug: <span className={mutedClass}>{cat.slug}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Description</label>
                      <textarea
                        value={editCatDesc}
                        onChange={e => setEditCatDesc(e.target.value)}
                        rows={3}
                        className={`${inputStyle} resize-none`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Update Image</label>
                      <div className="flex items-center gap-4">
                        {cat.image && !editCatImage && (
                          <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                        )}
                        <input
                          ref={editFileRef}
                          type="file"
                          accept="image/*"
                          onChange={e => setEditCatImage(e.target.files?.[0] || null)}
                          className={`${inputStyle} p-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black file:cursor-pointer flex-1`}
                        />
                      </div>
                      {editCatImage && (
                        <p className="text-[10px] font-bold text-yellow-400">
                          New: {editCatImage.name} ({(editCatImage.size / 1024).toFixed(0)} KB)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => handleUpdateCategory(cat._id)}
                      disabled={editSaving}
                      className="w-full bg-yellow-400 text-black py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 disabled:opacity-50"
                    >
                      {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                </div>

                {/* Right: Subcategories */}
                <div className={`flex-1 p-6 overflow-y-auto ${isDark ? 'bg-black/20' : 'bg-slate-50/50'}`}>
                  <h3 className={`text-[10px] font-black uppercase tracking-widest mb-5 ${mutedClass}`}>
                    Subcategories ({cat.subcategories?.length || 0})
                  </h3>

                  {/* Add subcategory */}
                  <div className="space-y-2 mb-5">
                    <div className="flex gap-2">
                      <input
                        value={newSubcatName}
                        onChange={e => { setNewSubcatName(e.target.value); if (subcatError) setSubcatError(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubcat(cat._id); } }}
                        placeholder="New subcategory name..."
                        className={`flex-1 px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-600 focus:border-yellow-400/50' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'}`}
                      />
                      <button
                        onClick={() => handleAddSubcat(cat._id)}
                        disabled={subcatAdding}
                        className="px-5 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-black flex items-center gap-2 disabled:opacity-50 shrink-0"
                      >
                        {subcatAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                      </button>
                    </div>
                    {!subcatError && newSubcatName.trim() && (() => {
                      const dupe = cat.subcategories?.find(
                        s => s.name.toLowerCase() === newSubcatName.trim().toLowerCase() || s.slug === toSlug(newSubcatName)
                      );
                      return dupe ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <p className="text-[10px] font-bold text-orange-400">"{dupe.name}" already exists in this category</p>
                        </div>
                      ) : null;
                    })()}
                    {subcatError && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <p className="text-[10px] font-bold text-red-400">{subcatError}</p>
                      </div>
                    )}
                  </div>

                  {(!cat.subcategories || cat.subcategories.length === 0) ? (
                    <div className={`flex flex-col items-center justify-center py-10 rounded-xl border border-dashed ${isDark ? 'border-white/10' : 'border-slate-300'}`}>
                      <Tag className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                      <p className={`text-xs font-medium ${mutedClass}`}>No subcategories added yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {cat.subcategories.map((sub, idx) => (
                        <div
                          key={sub._id}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${isDark ? 'bg-zinc-900 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-[9px] font-black w-5 text-center shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>{idx + 1}</span>
                            <div className="min-w-0">
                              <p className={`text-sm font-bold leading-tight ${textClass}`}>{sub.name}</p>
                              <p className={`text-[9px] font-mono truncate ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{sub.slug}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSubcat(cat._id, sub._id, sub.name)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
                            title="Remove subcategory"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
