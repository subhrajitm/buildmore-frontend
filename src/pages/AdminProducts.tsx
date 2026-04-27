import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, BackendProduct } from '../api';
import { 
  Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Check, X, 
  Upload, AlertCircle, ChevronDown, Loader2, Search, Filter, Grid3X3, 
  List, IndianRupee, Box, Eye, EyeOff, RefreshCw, PlusCircle, MinusCircle
} from 'lucide-react';
import { formatPrice, formatINR } from '../utils/currency';

interface AdminProductsProps {
  isDark: boolean;
}

const EMPTY_FORM = {
  productName: '', desc: '', category: '', price: '', stock: '', materialSpecifications: '',
};



export const AdminProducts: React.FC<AdminProductsProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BackendProduct>>({});
  const [stockEditing, setStockEditing] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const input = `w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${
    isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
  }`;
  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const bgClass = isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = () => {
    if (!adminToken) return;
    setLoading(true);
    adminApi.getAll(adminToken).then(r => setProducts(r.products || [])).catch(() => setError('Failed to load')).finally(() => setLoading(false));
    import('../api').then(({ categoryApi }) => {
      categoryApi.getAll().then(r => setCategoriesList(r.categories || [])).catch(() => {});
    });
  };
  useEffect(load, [adminToken]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesAvailability = filterAvailability === 'all' || 
                               (filterAvailability === 'available' && p.availability) ||
                               (filterAvailability === 'unavailable' && !p.availability);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const stats = {
    total: products.length,
    available: products.filter(p => p.availability).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) { setError('At least one product image is required'); return; }
    if (!adminToken) return;
    setSubmitting(true); setError('');
    const fd = new FormData();
    fd.append('productName', form.productName); fd.append('desc', form.desc);
    fd.append('categoryId', form.category); fd.append('price', form.price);
    if (form.subcategory) fd.append('subcategory', form.subcategory);
    fd.append('stock', form.stock); fd.append('materialSpecifications', form.materialSpecifications);
    Array.from(files as FileList).forEach((f: File) => fd.append('images', f));
    try {
      await adminApi.add(fd, adminToken);
      setForm({ ...EMPTY_FORM }); setFiles(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowAddForm(false); showToast('Product added successfully'); load();
    } catch (err: any) { setError(err.message || 'Failed to add product'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id: string) => {
    if (!adminToken) return;
    try { 
      const updateData = { ...editForm };
      if (updateData.category) {
        // Find the categoryId for the selected category name, or if it's already an ID, use it.
        const cat = categoriesList.find(c => c.name === updateData.category || c._id === updateData.category);
        if (cat) {
          updateData.categoryId = cat._id;
          delete updateData.category;
        }
      }
      await adminApi.update(id, updateData, adminToken); 
      setEditingId(null); 
      showToast('Product updated'); 
      load(); 
    }
    catch (err: any) { showToast('Update failed: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.') || !adminToken) return;
    try { await adminApi.delete(id, adminToken); showToast('Product deleted'); load(); }
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
    try { await adminApi.toggleAvailability(id, adminToken); showToast('Availability updated'); load(); }
    catch (err: any) { showToast('Toggle failed: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${card}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.total}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Total Products</p>
        </div>
        <div className={`p-5 rounded-2xl border ${card}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.available}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Available</p>
        </div>
        <div className={`p-5 rounded-2xl border ${card}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Box className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.outOfStock}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Out of Stock</p>
        </div>
        <div className={`p-5 rounded-2xl border ${card}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatINR(stats.totalValue)}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Total Value</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`rounded-2xl border p-4 ${card}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className={`px-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="">All Categories</option>
              {categoriesList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
            <select
              value={filterAvailability}
              onChange={e => setFilterAvailability(e.target.value as any)}
              className={`px-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <div className="flex rounded-xl border overflow-hidden">
              <button onClick={() => setViewMode('list')} className={`p-3 ${viewMode === 'list' ? 'bg-yellow-400 text-black' : isDark ? 'bg-zinc-900 text-slate-400' : 'bg-white text-slate-500'}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-3 ${viewMode === 'grid' ? 'bg-yellow-400 text-black' : isDark ? 'bg-zinc-900 text-slate-400' : 'bg-white text-slate-500'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => navigate('/admin/products/add')}
              className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-300 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className={`text-sm font-bold ${mutedClass}`}>
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <button onClick={load} className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Products List/Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <Package className="w-16 h-16 text-slate-300" />
          <p className={`text-sm font-black uppercase tracking-widest ${mutedClass}`}>No products found</p>
          <p className={`text-xs ${mutedClass}`}>Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <div key={p._id} className={`rounded-2xl border overflow-hidden ${card} hover:border-yellow-400/30 transition-all`}>
              <div className={`h-32 ${isDark ? 'bg-white/5' : 'bg-slate-100'} flex items-center justify-center`}>
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.productName}</p>
                    <p className={`text-[10px] font-bold uppercase ${mutedClass}`}>{p.category}</p>
                  </div>
                  <button onClick={() => handleToggleAvailability(p._id)} className={`p-1.5 rounded-lg ${p.availability ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {p.availability ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(p.price)}</p>
                    <p className={`text-[10px] font-bold ${p.stock === 0 ? 'text-red-400' : mutedClass}`}>{p.stock} in stock</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(p._id); setEditForm({ productName: p.productName, category: typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category, subcategory: p.subcategory ?? '', price: p.price, materialSpecifications: p.materialSpecifications ?? '' }); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p._id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                  <th className="text-left px-6 py-4">Product</th>
                  <th className="text-left px-4 py-4">Category</th>
                  <th className="text-right px-4 py-4">Price</th>
                  <th className="text-right px-4 py-4">Stock</th>
                  <th className="text-center px-4 py-4">Status</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredProducts.map(p => (
                  <tr key={p._id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    {editingId === p._id ? (
                      <>
                        <td className="px-6 py-4" colSpan={4}>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input value={editForm.productName ?? p.productName} onChange={e => setEditForm(f => ({ ...f, productName: e.target.value }))} className={`px-3 py-2 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200'}`} placeholder="Name" />
                            <select value={editForm.category ?? (typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category)} onChange={e => setEditForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} className={`px-3 py-2 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200'}`}>
                              {categoriesList.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                            <select value={editForm.subcategory ?? p.subcategory ?? ''} onChange={e => setEditForm(f => ({ ...f, subcategory: e.target.value }))} className={`px-3 py-2 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200'}`}>
                              <option value="">No Subcategory</option>
                              {(categoriesList.find(c => c._id === (editForm.category ?? (typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category)) || c.name === (editForm.category ?? (typeof p.category === 'object' && p.category ? (p.category as any).name : p.category)))?.subcategories || []).map((sub: any) => (
                                <option key={sub._id} value={sub.name}>{sub.name}</option>
                              ))}
                            </select>
                            <input type="number" value={editForm.price ?? p.price} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} className={`px-3 py-2 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200'}`} placeholder="Price" />
                            <input value={editForm.materialSpecifications ?? p.materialSpecifications ?? ''} onChange={e => setEditForm(f => ({ ...f, materialSpecifications: e.target.value }))} className={`px-3 py-2 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200'}`} placeholder="Specs" />
                          </div>
                        </td>
                        <td className="text-right px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdate(p._id)} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-1.5"><Check className="w-3 h-3" /> Save</button>
                            <button onClick={() => { setEditingId(null); setEditForm({}); }} className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600'}`}><X className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.productName}</p>
                              {p.desc && <p className={`text-[10px] font-medium truncate max-w-[250px] ${mutedClass}`}>{p.desc}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{typeof p.category === 'object' && p.category ? (p.category as any).name : p.category}</span>
                            {p.subcategory && <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-lg ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>{p.subcategory}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(p.price)}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {stockEditing === p._id ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex items-center gap-1">
                                <button onClick={() => setStockValue(String(Math.max(0, Number(stockValue) - 1)))} className={`p-1 rounded ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}><MinusCircle className="w-4 h-4" /></button>
                                <input type="number" min="0" value={stockValue} onChange={e => setStockValue(e.target.value)} className={`w-16 px-2 py-1 rounded-lg border text-sm font-bold text-center ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200'}`} autoFocus />
                                <button onClick={() => setStockValue(String(Number(stockValue) + 1))} className={`p-1 rounded ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}><PlusCircle className="w-4 h-4" /></button>
                              </div>
                              <button onClick={() => handleStockUpdate(p._id)} className="text-green-500 hover:text-green-400"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setStockEditing(null)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setStockEditing(p._id); setStockValue(String(p.stock)); }} className={`text-sm font-black hover:text-yellow-400 transition-colors flex items-center gap-1 ${p.stock === 0 ? 'text-red-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                              {p.stock} units
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => handleToggleAvailability(p._id)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${p.availability ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {p.availability ? <><Eye className="w-3 h-3" /> Available</> : <><EyeOff className="w-3 h-3" /> Unavailable</>}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingId(p._id); setEditForm({ productName: p.productName, category: typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category, subcategory: p.subcategory ?? '', price: p.price, materialSpecifications: p.materialSpecifications ?? '' }); }} className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-500 hover:text-yellow-500'}`}><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(p._id)} className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}><Trash2 className="w-4 h-4" /></button>
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