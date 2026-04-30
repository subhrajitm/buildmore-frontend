import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, categoryApi, Category } from '../api';
import {
  Check, X, Upload, AlertCircle, Loader2, ArrowLeft,
  Package, IndianRupee, Tag, Layers, Image as ImageIcon,
  FileText, Hash, BoxSelect,
} from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { useTheme } from '../context/ThemeContext';

const EMPTY_FORM = {
  productName: '', desc: '', category: '', subcategory: '',
  price: '', stock: '', materialSpecifications: '',
};

const MAX_IMAGES = 5;
const MAX_NAME = 120;
const MAX_DESC = 1000;

export const AddProduct: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM & { images: string }>>({});
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.categories || [])).catch(() => {});
  }, []);

  // Cleanup object URLs on unmount
  React.useEffect(() => () => previews.forEach(p => URL.revokeObjectURL(p.url)), []);

  const inp = `w-full px-3 py-2.5 rounded-xl border text-sm font-bold outline-none transition-colors ${
    isDark
      ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
  }`;
  const lbl = `text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`;
  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';

  const selectedCat = categories.find(c => c._id === form.category);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    setPreviews(prev => {
      const slots = MAX_IMAGES - prev.length;
      if (slots <= 0) return prev;
      const added = incoming.slice(0, slots).map(f => ({ file: f, url: URL.createObjectURL(f) }));
      return [...prev, ...added];
    });
    setErrors(e => ({ ...e, images: undefined }));
  }, []);

  const removeImage = (idx: number) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.productName.trim()) e.productName = 'Required';
    else if (form.productName.length > MAX_NAME) e.productName = `Max ${MAX_NAME} chars`;
    if (!form.category) e.category = 'Required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Must be > 0';
    if (!form.stock || Number(form.stock) < 0) e.stock = 'Cannot be negative';
    if (!form.desc.trim()) e.desc = 'Required';
    if (previews.length === 0) e.images = 'At least one image required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !adminToken) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('productName', form.productName.trim());
      fd.append('desc', form.desc.trim());
      fd.append('categoryId', form.category);
      if (form.subcategory) fd.append('subcategory', form.subcategory);
      fd.append('price', form.price);
      fd.append('stock', form.stock);
      if (form.materialSpecifications.trim()) fd.append('materialSpecifications', form.materialSpecifications.trim());
      previews.forEach(p => fd.append('images', p.file));
      await adminApi.add(fd, adminToken);
      navigate('/admin/products');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to add product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (id: keyof typeof EMPTY_FORM) =>
    errors[id] ? `${inp} border-red-500/60 focus:border-red-500` : inp;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className={`p-2 rounded-xl border transition-all ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className={`text-lg font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Add New Product</h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Fill all required fields and upload at least one image</p>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleAdd}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* ── Left: Core fields ── */}
          <div className={`xl:col-span-2 rounded-2xl border p-5 space-y-4 ${card}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Product Details</p>

            {/* Name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={lbl}>Product Name *</label>
                <span className={`text-[9px] font-bold ${form.productName.length > MAX_NAME ? 'text-red-400' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  {form.productName.length}/{MAX_NAME}
                </span>
              </div>
              <input
                value={form.productName}
                onChange={e => { setForm(f => ({ ...f, productName: e.target.value })); setErrors(er => ({ ...er, productName: undefined })); }}
                className={field('productName')}
                placeholder="e.g. Rockwool Thermal Insulation Board 50mm"
              />
              {errors.productName && <p className="text-[9px] font-bold text-red-400">{errors.productName}</p>}
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={lbl}>Category *</label>
                <select
                  value={form.category}
                  onChange={e => { setForm(f => ({ ...f, category: e.target.value, subcategory: '' })); setErrors(er => ({ ...er, category: undefined })); }}
                  className={field('category')}
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.category && <p className="text-[9px] font-bold text-red-400">{errors.category}</p>}
                {selectedCat && (
                  <p className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    {selectedCat.subcategories.length} subcategory{selectedCat.subcategories.length !== 1 ? 'ies' : ''}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className={lbl}>Subcategory <span className="normal-case font-medium">(optional)</span></label>
                <select
                  value={form.subcategory}
                  onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                  className={`${inp} ${!form.category ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={!form.category}
                >
                  <option value="">None</option>
                  {selectedCat?.subcategories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={lbl}>Price (₹) *</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.price}
                  onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErrors(er => ({ ...er, price: undefined })); }}
                  className={field('price')}
                  placeholder="0.00"
                />
                {errors.price
                  ? <p className="text-[9px] font-bold text-red-400">{errors.price}</p>
                  : form.price && Number(form.price) > 0
                    ? <p className={`text-[9px] font-bold text-yellow-400`}>{formatPrice(Number(form.price))}</p>
                    : null
                }
              </div>
              <div className="space-y-1">
                <label className={lbl}>Stock Quantity *</label>
                <input
                  type="number" min="0"
                  value={form.stock}
                  onChange={e => { setForm(f => ({ ...f, stock: e.target.value })); setErrors(er => ({ ...er, stock: undefined })); }}
                  className={field('stock')}
                  placeholder="0"
                />
                {errors.stock
                  ? <p className="text-[9px] font-bold text-red-400">{errors.stock}</p>
                  : form.stock !== ''
                    ? <p className={`text-[9px] font-bold ${Number(form.stock) === 0 ? 'text-red-400' : Number(form.stock) <= 10 ? 'text-orange-400' : 'text-green-400'}`}>
                        {Number(form.stock) === 0 ? 'Out of stock' : Number(form.stock) <= 10 ? 'Low stock' : 'In stock'}
                      </p>
                    : null
                }
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={lbl}>Description *</label>
                <span className={`text-[9px] font-bold ${form.desc.length > MAX_DESC ? 'text-red-400' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  {form.desc.length}/{MAX_DESC}
                </span>
              </div>
              <textarea
                rows={4}
                value={form.desc}
                onChange={e => { setForm(f => ({ ...f, desc: e.target.value })); setErrors(er => ({ ...er, desc: undefined })); }}
                className={`${field('desc')} resize-none`}
                placeholder="Describe features, use cases, certifications, dimensions..."
              />
              {errors.desc && <p className="text-[9px] font-bold text-red-400">{errors.desc}</p>}
            </div>

            {/* Material specs */}
            <div className="space-y-1">
              <label className={lbl}>Material Specifications <span className="normal-case font-medium">(optional)</span></label>
              <input
                value={form.materialSpecifications}
                onChange={e => setForm(f => ({ ...f, materialSpecifications: e.target.value }))}
                className={inp}
                placeholder="e.g. Stainless Steel Grade 304, IP67 Rated, ISO 9001 Certified"
              />
              <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Separate multiple specs with commas</p>
            </div>
          </div>

          {/* ── Right: Images + Preview ── */}
          <div className="space-y-4">

            {/* Image upload */}
            <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
              <div className="flex items-center justify-between">
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Product Images *</p>
                <span className={`text-[9px] font-black ${previews.length >= MAX_IMAGES ? 'text-orange-400' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  {previews.length}/{MAX_IMAGES}
                </span>
              </div>

              {/* Drop zone */}
              {previews.length < MAX_IMAGES && (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    dragOver
                      ? 'border-yellow-400 bg-yellow-400/5'
                      : errors.images
                        ? 'border-red-500/40 hover:border-red-500/60'
                        : isDark ? 'border-white/10 hover:border-yellow-400/40' : 'border-slate-200 hover:border-yellow-400/60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragOver ? 'bg-yellow-400/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <Upload className={`w-5 h-5 ${dragOver ? 'text-yellow-400' : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-xs font-bold text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {dragOver ? 'Drop to upload' : 'Click or drag & drop'}
                  </p>
                  <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>JPG · PNG · WEBP · max 5 MB each</p>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />
                </div>
              )}
              {errors.images && <p className="text-[9px] font-bold text-red-400">{errors.images}</p>}

              {/* Thumbnails */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((p, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                      <img src={p.url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      {/* Primary badge */}
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[8px] font-black uppercase tracking-widest bg-yellow-400 text-black px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      )}
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {/* File size */}
                      <div className="absolute top-1 left-1 text-[7px] font-black bg-black/60 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {(p.file.size / 1024).toFixed(0)}KB
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {previews.length > 0 && (
                <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  First image is used as the main listing photo. Hover to remove.
                </p>
              )}
            </div>

            {/* Live preview card */}
            <div className={`rounded-2xl border p-4 space-y-3 ${card}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Listing Preview</p>

              <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                {/* Preview image */}
                <div className={`aspect-video flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  {previews[0]
                    ? <img src={previews[0].url} alt="preview" className="w-full h-full object-cover" />
                    : <ImageIcon className="w-8 h-8 text-slate-400 opacity-30" />
                  }
                </div>
                {/* Preview info */}
                <div className="p-3 space-y-1">
                  {(form.category || form.subcategory) && (
                    <p className="text-[8px] font-black uppercase tracking-widest text-yellow-500">
                      {selectedCat?.name}{form.subcategory ? ` › ${form.subcategory}` : ''}
                    </p>
                  )}
                  <p className={`text-xs font-black leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {form.productName || <span className="opacity-30">Product name…</span>}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className={`text-sm font-black ${form.price ? 'text-yellow-400' : 'text-slate-500 opacity-30'}`}>
                      {form.price && Number(form.price) > 0 ? formatPrice(Number(form.price)) : '₹0.00'}
                    </p>
                    <p className={`text-[9px] font-black uppercase ${
                      !form.stock ? 'text-slate-500 opacity-30'
                      : Number(form.stock) === 0 ? 'text-red-400'
                      : Number(form.stock) <= 10 ? 'text-orange-400'
                      : 'text-green-400'
                    }`}>
                      {form.stock !== '' ? (Number(form.stock) === 0 ? 'Out of stock' : `${form.stock} in stock`) : 'Stock…'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit row */}
        <div className={`flex items-center gap-3 mt-4 p-4 rounded-2xl border ${card}`}>
          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Check className="w-4 h-4" /> Publish Product</>}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
          >
            Cancel
          </button>
          <div className="ml-auto flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
            {[
              { icon: Package, label: form.productName ? form.productName.slice(0, 20) + (form.productName.length > 20 ? '…' : '') : 'No name', ok: !!form.productName.trim() },
              { icon: IndianRupee, label: form.price && Number(form.price) > 0 ? formatPrice(Number(form.price)) : 'No price', ok: !!form.price && Number(form.price) > 0 },
              { icon: Layers, label: selectedCat?.name || 'No category', ok: !!form.category },
              { icon: ImageIcon, label: `${previews.length} image${previews.length !== 1 ? 's' : ''}`, ok: previews.length > 0 },
            ].map(({ icon: Icon, label, ok }) => (
              <div key={label} className={`hidden lg:flex items-center gap-1.5 ${ok ? 'text-green-400' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};