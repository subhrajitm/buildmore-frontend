import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { categoryApi, adminCategoryApi, Category, Subcategory } from '../api';
import { 
  Layers, Loader2, Plus, Pencil, Trash2, Check, X, 
  Upload, Search, RefreshCw, Image as ImageIcon,
  Tag
} from 'lucide-react';

interface AdminCategoriesProps {
  isDark: boolean;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  // Add Category
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Category
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatImage, setEditCatImage] = useState<File | null>(null);

  // Subcategories
  const [newSubcatName, setNewSubcatName] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputStyle = `w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = () => {
    setLoading(true);
    categoryApi.getAll()
      .then(r => setCategories(r.categories || []))
      .catch(() => showToast('Failed to load categories'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (!newCatName.trim()) {
      showToast('Category name is required');
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('name', newCatName);
    if (newCatDesc) fd.append('description', newCatDesc);
    if (newCatImage) fd.append('image', newCatImage);

    try {
      await adminCategoryApi.create(fd, adminToken);
      setNewCatName('');
      setNewCatDesc('');
      setNewCatImage(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowAddForm(false);
      showToast('Category created');
      load();
    } catch (err: any) {
      showToast('Create failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!adminToken) return;
    if (!editCatName.trim()) return;
    const fd = new FormData();
    fd.append('name', editCatName);
    if (editCatDesc) fd.append('description', editCatDesc);
    if (editCatImage) fd.append('image', editCatImage);

    try {
      await adminCategoryApi.update(id, fd, adminToken);
      setEditingId(null);
      setEditCatImage(null);
      showToast('Category updated');
      load();
    } catch (err: any) {
      showToast('Update failed: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!adminToken || !window.confirm('Delete this category?')) return;
    try {
      await adminCategoryApi.delete(id, adminToken);
      showToast('Category deleted');
      load();
    } catch (err: any) {
      showToast('Delete failed: ' + err.message);
    }
  };

  const handleAddSubcat = async (categoryId: string) => {
    if (!adminToken || !newSubcatName.trim()) return;
    try {
      await adminCategoryApi.addSubcategory(categoryId, { name: newSubcatName }, adminToken);
      setNewSubcatName('');
      showToast('Subcategory added');
      load();
    } catch (err: any) {
      showToast('Failed to add subcategory: ' + err.message);
    }
  };

  const handleRemoveSubcat = async (categoryId: string, subId: string) => {
    if (!adminToken || !window.confirm('Remove this subcategory?')) return;
    try {
      await adminCategoryApi.removeSubcategory(categoryId, subId, adminToken);
      showToast('Subcategory removed');
      load();
    } catch (err: any) {
      showToast('Failed to remove subcategory: ' + err.message);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subcategories?.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className={`rounded-2xl border p-4 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={load} className={`flex items-center gap-2 px-4 rounded-xl border text-sm font-bold ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'} transition-all`}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all"
            >
              {showAddForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Category</>}
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h2 className={`text-sm font-black uppercase tracking-widest mb-4 ${textClass}`}>New Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Category Name *</label>
                <input required value={newCatName} onChange={e => setNewCatName(e.target.value)} className={inputStyle} placeholder="e.g. Tiles & Flooring" />
              </div>
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Image (Optional)</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={e => setNewCatImage(e.target.files?.[0] || null)} className={`${inputStyle} p-2 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black`} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Description</label>
                <input value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className={inputStyle} placeholder="Brief description..." />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={submitting} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Create Category</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
      ) : filteredCategories.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
          <Layers className="w-16 h-16 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map(cat => (
            <div key={cat._id} className={`rounded-2xl border overflow-hidden ${cardBg} flex flex-col`}>
                  <div className={`h-40 relative flex items-center justify-center border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-slate-400 opacity-50" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button onClick={() => { setEditingId(cat._id); setEditCatName(cat.name); setEditCatDesc(cat.description || ''); setEditCatImage(null); }} className={`p-2 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all shadow-lg`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat._id)} className={`p-2 rounded-lg bg-red-500/80 backdrop-blur-md text-white hover:bg-red-500 transition-all shadow-lg`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className={`text-lg font-black tracking-tight ${textClass}`}>{cat.name}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedClass} mb-2`}>Slug: {cat.slug}</p>
                    {cat.description && <p className={`text-xs font-medium mb-4 line-clamp-2 ${mutedClass}`}>{cat.description}</p>}
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between border-t border-dashed pt-4 border-white/10">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Subcategories ({cat.subcategories?.length || 0})</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories?.map(sub => (
                          <div key={sub._id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            <Tag className="w-3 h-3 opacity-50" />
                            {sub.name}
                          </div>
                        ))}
                        {(!cat.subcategories || cat.subcategories.length === 0) && (
                          <p className={`text-xs italic ${mutedClass}`}>No subcategories</p>
                        )}
                      </div>
                    </div>
                  </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Details Modal */}
      {editingId && (() => {
        const cat = categories.find(c => c._id === editingId);
        if (!cat) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/40">
            <div className={`w-full max-w-4xl max-h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
              
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                <h2 className={`text-lg font-black uppercase tracking-wider ${textClass}`}>Manage Category</h2>
                <button onClick={() => setEditingId(null)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                
                {/* Left: Edit Category Info */}
                <div className={`flex-1 p-6 overflow-y-auto lg:border-r ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-5 ${mutedClass}`}>Category Details</h3>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Name *</label>
                      <input value={editCatName} onChange={e => setEditCatName(e.target.value)} className={inputStyle} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Description</label>
                      <textarea value={editCatDesc} onChange={e => setEditCatDesc(e.target.value)} rows={3} className={`${inputStyle} resize-none`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Update Image</label>
                      <div className="flex items-center gap-4">
                        {cat.image && !editCatImage && (
                          <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                        )}
                        <input ref={editFileRef} type="file" accept="image/*" onChange={e => setEditCatImage(e.target.files?.[0] || null)} className={`${inputStyle} p-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black flex-1`} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button onClick={() => handleUpdateCategory(cat._id)} className="w-full bg-yellow-400 text-black py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20">
                      <Check className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                </div>

                {/* Right: Subcategories */}
                <div className={`flex-1 p-6 overflow-y-auto ${isDark ? 'bg-black/20' : 'bg-slate-50/50'}`}>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-5 ${mutedClass}`}>Subcategories ({cat.subcategories?.length || 0})</h3>
                  
                  {/* Add Subcategory */}
                  <div className="flex gap-2 mb-6">
                    <input 
                      value={newSubcatName} 
                      onChange={e => setNewSubcatName(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAddSubcat(cat._id)}
                      placeholder="New subcategory name..." 
                      className={`flex-1 px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-600 focus:border-yellow-400/50' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'}`} 
                    />
                    <button onClick={() => handleAddSubcat(cat._id)} className="px-5 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-black flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {/* List */}
                  {(!cat.subcategories || cat.subcategories.length === 0) ? (
                    <div className={`flex flex-col items-center justify-center py-10 rounded-xl border border-dashed ${isDark ? 'border-white/10' : 'border-slate-300'}`}>
                      <Tag className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                      <p className={`text-xs font-medium ${mutedClass}`}>No subcategories added yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {cat.subcategories.map(sub => (
                        <div key={sub._id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${isDark ? 'bg-zinc-900 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <Tag className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span className={`text-sm font-bold ${textClass}`}>{sub.name}</span>
                          </div>
                          <button onClick={() => handleRemoveSubcat(cat._id, sub._id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
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
