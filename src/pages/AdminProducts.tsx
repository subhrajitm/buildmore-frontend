import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, BackendProduct } from '../api';
import {
  Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Check, X,
  Upload, AlertCircle, ChevronDown, Loader2, Search, Filter, Grid3X3,
  List, IndianRupee, Box, Eye, EyeOff, RefreshCw, PlusCircle, MinusCircle,
  ChevronLeft, ChevronRight, Image as ImageIcon, FileText, Tag, Layers,
} from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface AdminProductsProps {
  isDark: boolean;
}


// ── Edit Product Modal ───────────────────────────────────────────────────────────
const MAX_EDIT_IMAGES = 5;
const MAX_EDIT_NAME = 120;
const MAX_EDIT_DESC = 1000;

interface EditModalForm {
  productName: string;
  desc: string;
  category: string;
  subcategory: string;
  price: string;
  stock: string;
  materialSpecifications: string;
}

const EditProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: BackendProduct) => void;
  product: BackendProduct | null;
  categoriesList: any[];
  isDark: boolean;
  adminToken: string;
}> = ({ isOpen, onClose, onSaved, product, categoriesList, isDark, adminToken }) => {
  const [form, setForm] = useState<EditModalForm>({ productName: '', desc: '', category: '', subcategory: '', price: '', stock: '', materialSpecifications: '' });
  const [newPreviews, setNewPreviews] = useState<{ file: File; url: string }[]>([]);
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Partial<EditModalForm & { images: string }>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Initialise form when product changes
  useEffect(() => {
    if (!product) return;
    const catId = typeof product.category === 'object' && product.category ? (product.category as any)._id : (product.category ?? '');
    setForm({
      productName: product.productName ?? '',
      desc: product.desc ?? '',
      category: catId,
      subcategory: product.subcategory ?? '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      materialSpecifications: product.materialSpecifications ?? '',
    });
    setKeptImages(product.productImages ?? []);
    setNewPreviews([]);
    setErrors({});
    setSaveError('');
  }, [product?._id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Cleanup new preview URLs on unmount
  useEffect(() => () => newPreviews.forEach(p => URL.revokeObjectURL(p.url)), []);

  const addFiles = useCallback((fileList: FileList) => {
    const slots = MAX_EDIT_IMAGES - keptImages.length - newPreviews.length;
    if (slots <= 0) return;
    const toAdd = Array.from(fileList).slice(0, slots).filter(f => f.type.startsWith('image/'));
    const mapped = toAdd.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setNewPreviews(p => [...p, ...mapped]);
    setErrors(e => ({ ...e, images: undefined }));
  }, [newPreviews.length, keptImages.length]);

  const removeExistingImage = (url: string) => {
    setKeptImages(prev => prev.filter(u => u !== url));
  };

  const removeNewPreview = (idx: number) => {
    setNewPreviews(p => {
      URL.revokeObjectURL(p[idx].url);
      return p.filter((_, i) => i !== idx);
    });
  };

  const validate = (): boolean => {
    const e: Partial<EditModalForm & { images: string }> = {};
    if (!form.productName.trim()) e.productName = 'Required';
    else if (form.productName.length > MAX_EDIT_NAME) e.productName = `Max ${MAX_EDIT_NAME} chars`;
    if (!form.category) e.category = 'Required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Valid price required';
    if (form.stock !== '' && (isNaN(Number(form.stock)) || Number(form.stock) < 0)) e.stock = 'Valid stock required';
    if (form.desc.length > MAX_EDIT_DESC) e.desc = `Max ${MAX_EDIT_DESC} chars`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!product || !validate()) return;
    setSaving(true); setSaveError('');
    try {
      const fd = new FormData();
      fd.append('productName', form.productName.trim());
      fd.append('desc', form.desc);
      fd.append('categoryId', form.category);
      fd.append('subcategory', form.subcategory);
      fd.append('price', form.price);
      if (form.stock !== '') fd.append('stock', form.stock);
      fd.append('materialSpecifications', form.materialSpecifications);
      keptImages.forEach(url => fd.append('keepImages', url));
      newPreviews.forEach(p => fd.append('images', p.file));
      const res = await adminApi.updateFormData(product._id, fd, adminToken);
      onSaved(res.product);
    } catch (err: any) {
      setSaveError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  const inp = `w-full px-3 py-2.5 rounded-xl border text-sm font-bold outline-none transition-colors ${
    isDark
      ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
  }`;
  const lbl = `text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`;
  const errCls = 'text-[9px] font-bold text-red-400 mt-0.5';

  const selectedCat = categoriesList.find(c => c._id === form.category);
  const subcats: any[] = selectedCat?.subcategories ?? [];
  const priceNum = Number(form.price);
  const stockNum = Number(form.stock);
  const totalImages = keptImages.length + newPreviews.length;

  const stockLabel = form.stock === '' ? null
    : stockNum === 0 ? { text: 'Out of stock', color: 'text-red-400' }
    : stockNum <= 10 ? { text: 'Low stock', color: 'text-orange-400' }
    : { text: 'In stock', color: 'text-green-400' };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-4xl my-8 rounded-3xl border shadow-2xl overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>

        {/* Header */}
        <div className={`px-8 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div>
            <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Product</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Update information, images, and inventory</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two-panel body */}
        <div className="flex flex-col lg:flex-row gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">

          {/* LEFT — form fields */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[75vh]">

            {/* Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={lbl}><Tag className="inline w-3 h-3 mr-1" />Product Name</label>
                <span className={`text-[9px] font-bold ${form.productName.length > MAX_EDIT_NAME ? 'text-red-400' : 'text-slate-500'}`}>{form.productName.length}/{MAX_EDIT_NAME}</span>
              </div>
              <input
                value={form.productName}
                onChange={e => { setForm(f => ({ ...f, productName: e.target.value })); setErrors(er => ({ ...er, productName: undefined })); }}
                className={`${inp} ${errors.productName ? 'border-red-400/50' : ''}`}
                placeholder="E.g. TMT Steel Bar Fe500"
                maxLength={MAX_EDIT_NAME + 10}
              />
              {errors.productName && <p className={errCls}>{errors.productName}</p>}
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${lbl} mb-1 block`}><Layers className="inline w-3 h-3 mr-1" />Category</label>
                <select
                  value={form.category}
                  onChange={e => { setForm(f => ({ ...f, category: e.target.value, subcategory: '' })); setErrors(er => ({ ...er, category: undefined })); }}
                  className={`${inp} ${errors.category ? 'border-red-400/50' : ''}`}
                >
                  <option value="">Select category</option>
                  {categoriesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.category && <p className={errCls}>{errors.category}</p>}
              </div>
              <div>
                <label className={`${lbl} mb-1 block`}>Subcategory</label>
                <select
                  value={form.subcategory}
                  onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                  className={inp}
                  disabled={subcats.length === 0}
                >
                  <option value="">None</option>
                  {subcats.map((s: any) => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${lbl} mb-1 block`}><IndianRupee className="inline w-3 h-3 mr-1" />Price (₹)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.price}
                  onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErrors(er => ({ ...er, price: undefined })); }}
                  className={`${inp} ${errors.price ? 'border-red-400/50' : ''}`}
                  placeholder="0.00"
                />
                {errors.price
                  ? <p className={errCls}>{errors.price}</p>
                  : priceNum > 0 && <p className="text-[9px] font-bold text-yellow-400 mt-0.5">{formatPrice(priceNum)}</p>
                }
              </div>
              <div>
                <label className={`${lbl} mb-1 block`}><Box className="inline w-3 h-3 mr-1" />Stock (units)</label>
                <input
                  type="number" min="0"
                  value={form.stock}
                  onChange={e => { setForm(f => ({ ...f, stock: e.target.value })); setErrors(er => ({ ...er, stock: undefined })); }}
                  className={`${inp} ${errors.stock ? 'border-red-400/50' : ''}`}
                  placeholder={String(product.stock)}
                />
                {errors.stock
                  ? <p className={errCls}>{errors.stock}</p>
                  : stockLabel && <p className={`text-[9px] font-bold mt-0.5 ${stockLabel.color}`}>{stockLabel.text}</p>
                }
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={lbl}><FileText className="inline w-3 h-3 mr-1" />Description</label>
                <span className={`text-[9px] font-bold ${form.desc.length > MAX_EDIT_DESC ? 'text-red-400' : 'text-slate-500'}`}>{form.desc.length}/{MAX_EDIT_DESC}</span>
              </div>
              <textarea
                rows={3}
                value={form.desc}
                onChange={e => { setForm(f => ({ ...f, desc: e.target.value })); setErrors(er => ({ ...er, desc: undefined })); }}
                className={`${inp} resize-none ${errors.desc ? 'border-red-400/50' : ''}`}
                placeholder="Short product description..."
                maxLength={MAX_EDIT_DESC + 10}
              />
              {errors.desc && <p className={errCls}>{errors.desc}</p>}
            </div>

            {/* Material Specs */}
            <div>
              <label className={`${lbl} mb-1 block`}>Material Specifications</label>
              <textarea
                rows={3}
                value={form.materialSpecifications}
                onChange={e => setForm(f => ({ ...f, materialSpecifications: e.target.value }))}
                className={`${inp} resize-none`}
                placeholder="Technical specifications, grades, tolerances..."
              />
            </div>
          </div>

          {/* RIGHT — images + preview */}
          <div className="w-full lg:w-72 xl:w-80 p-6 space-y-4 overflow-y-auto max-h-[75vh]">

            {/* Existing images */}
            {keptImages.length > 0 && (
              <div>
                <p className={`${lbl} mb-2`}>Current Images ({keptImages.length}) — hover to remove</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {keptImages.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute bottom-0.5 left-0.5 text-[7px] font-black bg-yellow-400 text-black px-1 rounded">Main</span>}
                      <button
                        onClick={() => removeExistingImage(url)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image drop zone */}
            <div>
              <p className={`${lbl} mb-2`}>Add New Images ({newPreviews.length}/{MAX_EDIT_IMAGES - keptImages.length} slots)</p>
              {totalImages < MAX_EDIT_IMAGES && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-yellow-400 bg-yellow-400/5'
                      : isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Upload className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Drop or click</p>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
                </div>
              )}

              {/* New preview thumbnails */}
              {newPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {newPreviews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeNewPreview(i)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      <span className="absolute bottom-0.5 right-0.5 text-[7px] font-bold bg-black/60 text-white px-1 rounded">
                        {(p.file.size / 1024).toFixed(0)}KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <p className={errCls}>{errors.images}</p>}
            </div>

            {/* Live preview card */}
            <div>
              <p className={`${lbl} mb-2`}>Listing Preview</p>
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-zinc-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`h-24 flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  {newPreviews[0]
                    ? <img src={newPreviews[0].url} alt="" className="h-full w-full object-cover" />
                    : keptImages[0]
                    ? <img src={keptImages[0]} alt="" className="h-full w-full object-cover" />
                    : <ImageIcon className="w-8 h-8 text-slate-400" />}
                </div>
                <div className="p-3 space-y-0.5">
                  {selectedCat && <p className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest">{selectedCat.name}{form.subcategory ? ` / ${form.subcategory}` : ''}</p>}
                  <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{form.productName || 'Product Name'}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{priceNum > 0 ? formatPrice(priceNum) : '₹—'}</span>
                    {stockLabel && <span className={`text-[8px] font-black uppercase ${stockLabel.color}`}>{stockLabel.text}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t flex items-center justify-between gap-4 ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { ok: form.productName.trim().length > 0, label: 'Name' },
              { ok: !!form.category, label: 'Category' },
              { ok: priceNum > 0, label: 'Price' },
              { ok: totalImages > 0, label: 'Images' },
            ].map(item => (
              <span key={item.label} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${item.ok ? 'text-green-400' : 'text-slate-600'}`}>
                {item.ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}{item.label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {saveError && <p className="text-[9px] font-bold text-red-400">{saveError}</p>}
            <button onClick={onClose} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-yellow-400 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



const ITEMS_PER_PAGE = 10;

export const AdminProducts: React.FC<AdminProductsProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<BackendProduct | null>(null);
  const [stockEditing, setStockEditing] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState('');
  const [toast, setToast] = useState('');
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

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
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(stats.totalValue)}</p>
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
              <div className={`h-32 ${isDark ? 'bg-white/5' : 'bg-slate-100'} flex items-center justify-center overflow-hidden`}>
                {p.productImages?.[0]
                  ? <img src={p.productImages[0]} alt={p.productName} className="w-full h-full object-cover" />
                  : <Package className="w-12 h-12 text-slate-400" />}
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
                    <button onClick={() => { setEditingProduct(p); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><Pencil className="w-4 h-4" /></button>
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
                        <button onClick={() => { setEditingProduct(p); }} className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-500 hover:text-yellow-500'}`}><Pencil className="w-4 h-4" /></button>
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
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        onSaved={(updated) => {
          setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
          setEditingProduct(null);
          showToast('Product updated');
        }}
        product={editingProduct}
        categoriesList={categoriesList}
        isDark={isDark}
        adminToken={adminToken ?? ''}
      />
    </div>
  );
};