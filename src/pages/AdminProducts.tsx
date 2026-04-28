import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, BackendProduct } from '../api';
import {
  Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Check, X,
  Upload, AlertCircle, ChevronDown, Loader2, Search, Filter, Grid3X3,
  List, IndianRupee, Box, Eye, EyeOff, RefreshCw, PlusCircle, MinusCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { formatPrice, formatINR } from '../utils/currency';

interface AdminProductsProps {
  isDark: boolean;
}


// ── Edit Product Modal ───────────────────────────────────────────────────────────
const EditProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string) => void;
  editForm: any;
  setEditForm: any;
  categoriesList: any[];
  isDark: boolean;
  productId: string | null;
  products: any[];
}> = ({ isOpen, onClose, onSave, editForm, setEditForm, categoriesList, isDark, productId, products }) => {
  if (!isOpen || !productId) return null;

  const product = products.find(p => p._id === productId);
  if (!product) return null;

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${
    isDark ? 'bg-zinc-950 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
  }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="px-8 py-6 border-b border-dashed flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Product</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Update product information and inventory</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Product Name</label>
              <input value={editForm.productName ?? product.productName} onChange={e => setEditForm((f: any) => ({ ...f, productName: e.target.value }))} className={inputClass} placeholder="Enter product name" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
              <select value={editForm.category ?? (typeof product.category === 'object' && product.category ? (product.category as any)._id : product.category)} onChange={e => setEditForm((f: any) => ({ ...f, category: e.target.value, subcategory: '' }))} className={inputClass}>
                {categoriesList.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subcategory</label>
              <select value={editForm.subcategory ?? product.subcategory ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, subcategory: e.target.value }))} className={inputClass}>
                <option value="">No Subcategory</option>
                {(categoriesList.find(c => c._id === (editForm.category ?? (typeof product.category === 'object' && product.category ? (product.category as any)._id : product.category)) || c.name === (editForm.category ?? (typeof product.category === 'object' && product.category ? (product.category as any).name : product.category)))?.subcategories || []).map((sub: any) => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Price (₹)</label>
              <input type="number" value={editForm.price ?? product.price} onChange={e => setEditForm((f: any) => ({ ...f, price: Number(e.target.value) }))} className={inputClass} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Material Specifications</label>
            <textarea value={editForm.materialSpecifications ?? product.materialSpecifications ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, materialSpecifications: e.target.value }))} className={`${inputClass} min-h-[100px] resize-none`} placeholder="Enter technical specifications..." />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-dashed bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-end gap-3">
          <button onClick={onClose} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
          <button onClick={() => onSave(productId)} className="px-8 py-3 bg-yellow-400 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 transition-all flex items-center gap-2">
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};



const EMPTY_FORM = {
  productName: '', desc: '', category: '', price: '', stock: '', materialSpecifications: '',
};

const ITEMS_PER_PAGE = 10;

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
  
  const [currentPage, setCurrentPage] = useState(1);
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
    const pCatName = typeof p.category === 'object' && p.category ? (p.category as any).name : p.category;
    const matchesCategory = !filterCategory || pCatName === filterCategory;
    const matchesAvailability = filterAvailability === 'all' ||
                               (filterAvailability === 'available' && p.availability) ||
                               (filterAvailability === 'unavailable' && !p.availability);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleFilterChange = (fn: () => void) => { fn(); setCurrentPage(1); };

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
              onChange={e => handleFilterChange(() => setSearchQuery(e.target.value))}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={e => handleFilterChange(() => setFilterCategory(e.target.value))}
              className={`px-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="">All Categories</option>
              {categoriesList.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
            <select
              value={filterAvailability}
              onChange={e => handleFilterChange(() => setFilterAvailability(e.target.value as any))}
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
          Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)}–{Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
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
          {paginatedProducts.map(p => (
            <div key={p._id} className={`rounded-2xl border overflow-hidden ${card} hover:border-yellow-400/30 transition-all`}>
              <div className={`h-32 ${isDark ? 'bg-white/5' : 'bg-slate-100'} flex items-center justify-center`}>
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.productName}</p>
                    <p className={`text-[10px] font-bold uppercase ${mutedClass}`}>
                      {typeof p.category === 'object' && p.category ? (p.category as any).name : p.category}
                    </p>
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
                {paginatedProducts.map(p => (
                  <tr key={p._id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
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
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                          {typeof p.category === 'object' && p.category ? (p.category as any).name : p.category}
                        </span>
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
                        {p.availability ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingId(p._id); setEditForm({ productName: p.productName, category: typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category, subcategory: p.subcategory ?? '', price: p.price, materialSpecifications: p.materialSpecifications ?? '' }); }} className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-500 hover:text-yellow-500'}`}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-xs font-bold ${mutedClass}`}>
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
              .reduce<(number | '...')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className={`px-2 py-2 text-xs font-bold ${mutedClass}`}>…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n as number)}
                    className={`min-w-[36px] h-9 rounded-lg text-xs font-black transition-colors ${
                      safePage === n
                        ? 'bg-yellow-400 text-black'
                        : isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editingId !== null}
        onClose={() => { setEditingId(null); setEditForm({}); }}
        onSave={handleUpdate}
        editForm={editForm}
        setEditForm={setEditForm}
        categoriesList={categoriesList}
        isDark={isDark}
        productId={editingId}
        products={products}
      />
    </div>
  );
};