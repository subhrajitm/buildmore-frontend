import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, BackendProduct } from '../api';
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Check, X, Upload, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';

interface AdminProductsProps {
  isDark: boolean;
}

const EMPTY_FORM = {
  productName: '', desc: '', category: '', price: '', stock: '', materialSpecifications: '',
};

export const AdminProducts: React.FC<AdminProductsProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BackendProduct>>({});
  const [stockEditing, setStockEditing] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const input = `px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-colors ${
    isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
  }`;
  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = () => {
    if (!adminToken) return;
    setLoading(true);
    adminApi.getAll(adminToken).then(r => setProducts(r.products || [])).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, [adminToken]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) { setError('At least one product image is required'); return; }
    if (!adminToken) return;
    setSubmitting(true); setError('');
    const fd = new FormData();
    fd.append('productName', form.productName); fd.append('desc', form.desc);
    fd.append('category', form.category); fd.append('price', form.price);
    fd.append('stock', form.stock); fd.append('materialSpecifications', form.materialSpecifications);
    Array.from(files as FileList).forEach((f: File) => fd.append('images', f));
    try {
      await adminApi.add(fd, adminToken);
      setForm({ ...EMPTY_FORM }); setFiles(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowAddForm(false); showToast('Product added'); load();
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id: string) => {
    if (!adminToken) return;
    try { await adminApi.update(id, editForm, adminToken); setEditingId(null); showToast('Updated'); load(); }
    catch (err: any) { showToast('Update failed: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?') || !adminToken) return;
    try { await adminApi.delete(id, adminToken); showToast('Deleted'); load(); }
    catch (err: any) { showToast('Delete failed: ' + err.message); }
  };

  const handleStockUpdate = async (id: string) => {
    if (!adminToken) return;
    const n = Number(stockValue);
    if (isNaN(n) || n < 0) { showToast('Invalid stock value'); return; }
    try { await adminApi.updateStock(id, n, adminToken); setStockEditing(null); showToast('Stock updated'); load(); }
    catch (err: any) { showToast('Stock update failed: ' + err.message); }
  };

  const handleToggleAvailability = async (id: string) => {
    if (!adminToken) return;
    try { await adminApi.toggleAvailability(id, adminToken); showToast('Availability toggled'); load(); }
    catch (err: any) { showToast('Toggle failed: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest z-50">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{products.length} Products in Catalog</p>
        <button
          onClick={() => { setShowAddForm(v => !v); setError(''); }}
          className="flex items-center gap-3 bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all"
        >
          {showAddForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Product</>}
        </button>
      </div>

      {showAddForm && (
        <div className={`rounded-2xl border p-8 space-y-6 ${card}`}>
          <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>New Product</h2>
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400 font-bold">{error}</p>
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Product Name *</label>
                <input required value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} className={input} placeholder="BuildMore X-Series..." />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Category *</label>
                <input required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={input} placeholder="Industrial Tools" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Price (USD) *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={input} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stock *</label>
                <input required type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={input} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Description *</label>
              <textarea required rows={3} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} className={`w-full ${input} resize-none`} placeholder="Professional-grade..." />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Material Specifications</label>
              <input value={form.materialSpecifications} onChange={e => setForm(f => ({ ...f, materialSpecifications: e.target.value }))} className={input} placeholder="Composite/Aluminum, IP67..." />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Product Images * (up to 5)</label>
              <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors ${isDark ? 'border-white/10 hover:border-yellow-400/40' : 'border-slate-200 hover:border-yellow-400/60'}`} onClick={() => fileRef.current?.click()}>
                <Upload className="w-6 h-6 text-slate-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{files && files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload images'}</p>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setFiles(e.target.files)} />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={submitting} className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Product</>}
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setError(''); setForm({ ...EMPTY_FORM }); }} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
      ) : products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
          <Package className="w-10 h-10 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">No products in catalog</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b text-[9px] font-black uppercase tracking-widest ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                  <th className="text-left px-6 py-4">Product</th>
                  <th className="text-left px-4 py-4">Category</th>
                  <th className="text-right px-4 py-4">Price</th>
                  <th className="text-right px-4 py-4">Stock</th>
                  <th className="text-center px-4 py-4">Available</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {products.map(p => (
                  <tr key={p._id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    {editingId === p._id ? (
                      <>
                        <td className="px-6 py-4" colSpan={4}>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input value={editForm.productName ?? p.productName} onChange={e => setEditForm(f => ({ ...f, productName: e.target.value }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Name" />
                            <input value={editForm.category ?? p.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Category" />
                            <input type="number" value={editForm.price ?? p.price} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Price" />
                            <input value={editForm.materialSpecifications ?? p.materialSpecifications ?? ''} onChange={e => setEditForm(f => ({ ...f, materialSpecifications: e.target.value }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Material specs" />
                          </div>
                        </td>
                        <td className="text-center px-4 py-4" />
                        <td className="text-right px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdate(p._id)} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-1.5"><Check className="w-3 h-3" /> Save</button>
                            <button onClick={() => { setEditingId(null); setEditForm({}); }} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600'}`}><X className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                              <Package className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className={`text-xs font-black leading-tight max-w-[200px] truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.productName}</p>
                              {p.desc && <p className="text-[9px] text-slate-500 font-medium truncate max-w-[200px]">{p.desc}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{p.category}</span></td>
                        <td className="px-4 py-4 text-right"><span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${p.price.toFixed(2)}</span></td>
                        <td className="px-4 py-4 text-right">
                          {stockEditing === p._id ? (
                            <div className="flex items-center justify-end gap-2">
                              <input type="number" min="0" value={stockValue} onChange={e => setStockValue(e.target.value)} className={`w-20 px-2 py-1 rounded-lg border text-xs font-bold outline-none text-right ${input}`} autoFocus />
                              <button onClick={() => handleStockUpdate(p._id)} className="text-yellow-400 hover:text-yellow-300"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setStockEditing(null)} className="text-slate-500 hover:text-slate-300"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setStockEditing(p._id); setStockValue(String(p.stock)); }} className={`text-xs font-black hover:text-yellow-400 transition-colors flex items-center gap-1 ml-auto ${p.stock === 0 ? 'text-red-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                              {p.stock} <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => handleToggleAvailability(p._id)} title={p.availability ? 'Click to disable' : 'Click to enable'}>
                            {p.availability ? <ToggleRight className="w-6 h-6 text-yellow-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingId(p._id); setEditForm({}); }} className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-500 hover:text-yellow-500'}`}><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(p._id)} className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};