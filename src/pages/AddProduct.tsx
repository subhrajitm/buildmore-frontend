import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../api';
import { getCategoryMeta } from '../utils/categoryMeta';
import {
  Plus, Check, X,
  Upload, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react';

interface AddProductProps {
  isDark: boolean;
}

const EMPTY_FORM = {
  productName: '', desc: '', category: '', subcategory: '', price: '', stock: '', materialSpecifications: '',
};

const CATEGORIES = [
  // Civil & Interiors
  'Cement & Concrete',
  'Tiles & Flooring',
  'Paints & Finishes',
  'Construction Chemicals',
  'Plywood, Laminates & Boards',
  'Doors & Windows',
  // Furniture & Architectural Hardware
  'Hardware & Fittings',
  'Kitchen & Wardrobe Solutions',
  'Tools & Equipment',
  // Electrical
  'Electrical',
  'Lighting & Fans',
  'Electrical Infrastructure',
  // Plumbing, Sanitary & Bath
  'Plumbing',
  'Sanitary & Bath',
];

export const AddProduct: React.FC<AddProductProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const { adminToken } = useAdminAuth();
  
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const input = `w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-colors ${
    isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'
  }`;
  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) { setError('At least one product image is required'); return; }
    if (!adminToken) return;
    setSubmitting(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('productName', form.productName);
      fd.append('desc', form.desc);
      fd.append('category', form.category);
      if (form.subcategory) fd.append('subcategory', form.subcategory);
      fd.append('price', form.price);
      fd.append('stock', form.stock);
      fd.append('materialSpecifications', form.materialSpecifications);
      Array.from(files as FileList).forEach((f: File) => fd.append('images', f));

      await adminApi.add(fd, adminToken);
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/admin/products')}
          className={`flex items-center gap-2 text-sm font-bold mb-6 ${mutedClass} hover:text-yellow-400 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>

        <div className={`rounded-2xl border p-8 ${card}`}>
          <h2 className={`text-2xl font-black uppercase tracking-wider mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Add New Product
          </h2>
          
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-bold">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Name *</label>
                <input required value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} className={input} placeholder="BuildMore X-Series Industrial Tool" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} className={input}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subcategory</label>
                <select value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className={input} disabled={!form.category}>
                  <option value="">Select Subcategory</option>
                  {form.category && getCategoryMeta(form.category).subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Price (INR) *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={input} placeholder="0.00" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stock Quantity *</label>
                <input required type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={input} placeholder="0" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Description *</label>
              <textarea required rows={4} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} className={`${input} resize-none`} placeholder="Describe the product features, specifications, and use cases..." />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Material Specifications</label>
              <input value={form.materialSpecifications} onChange={e => setForm(f => ({ ...f, materialSpecifications: e.target.value }))} className={input} placeholder="e.g., Stainless Steel, IP67 Rated, ISO Certified" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Images * (up to 5 images)</label>
              <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-4 cursor-pointer transition-colors ${isDark ? 'border-white/10 hover:border-yellow-400/40' : 'border-slate-200 hover:border-yellow-400/60'}`} onClick={() => fileRef.current?.click()}>
                <Upload className="w-10 h-10 text-slate-400" />
                <p className="text-base font-bold text-slate-500">{files && files.length > 0 ? `${files.length} image(s) selected - Click to change` : 'Click to upload product images'}</p>
                <p className={`text-sm ${mutedClass}`}>Supported: JPG, PNG, WEBP (Max 5MB each)</p>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setFiles(e.target.files)} />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={submitting} className="bg-yellow-400 text-black px-10 py-4 rounded-xl font-black text-base uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center gap-3">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving Product...</> : <><Check className="w-5 h-5" /> Add to Catalog</>}
              </button>
              <button type="button" onClick={() => navigate('/admin/products')} className={`px-10 py-4 rounded-xl font-black text-base uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};