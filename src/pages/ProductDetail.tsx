import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, ChevronRight, FileText, Download, Zap, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { productApi, specsApi, BackendProduct, SpecSheet } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';
import { useCart } from '../context/CartContext';

interface ProductDetailProps {
  isDark: boolean;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ isDark }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [raw, setRaw] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'compliance' | 'shipping'>('specs');
  const [specSheets, setSpecSheets] = useState<SpecSheet[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.getById(id)
      .then(res => setRaw(res.product))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
    specsApi.getByProduct(id)
      .then(res => setSpecSheets(res.specs || []))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-48">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !raw) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-4">
        <AlertCircle className="w-10 h-10 text-slate-500" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-500">{error || 'Product not found'}</p>
        <Link to="/products" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest border border-yellow-400/20 px-8 py-3 rounded-full hover:bg-yellow-400/10 transition-colors">Back to Catalog</Link>
      </div>
    );
  }

  const product = normalizeProduct(raw);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <Link to="/" className="hover:text-yellow-400">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-yellow-400">Catalog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className={isDark ? 'text-white' : 'text-slate-900'}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className={`aspect-square rounded-2xl flex items-center justify-center p-12 border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {product.availability ? (
                <span className="bg-yellow-400 text-black px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm">
                  In Stock: {raw.stock} Units
                </span>
              ) : (
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm">
                  Unavailable
                </span>
              )}
              {raw.stock === 0 && product.availability && (
                <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm">
                  Out of Stock
                </span>
              )}
            </div>
            <h1 className={`text-4xl font-black tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {product.name}
            </h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">
              {raw.desc || 'Professional-grade industrial component engineered for extreme environments. Optimized for high-density duty cycles and rigorous enterprise safety standards.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-baseline gap-4">
              <span className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-slate-500 line-through font-bold">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {product.bulkInfo && (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-yellow-50 border-yellow-100'}`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Bulk Tier Pricing</p>
                  <p className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.bulkInfo}</p>
                </div>
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Qty:</span>
            <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-slate-500 hover:text-yellow-400 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className={`text-sm font-black w-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="text-slate-500 hover:text-yellow-400 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              className={`flex-1 py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 ${
                added
                  ? 'bg-green-400 text-black'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
            >
              {added ? <><Check className="w-4 h-4" /> Added to List</> : <>Add to Procurement List <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              onClick={() => navigate('/rfqs')}
              title="Request a Quote"
              className={`px-6 rounded-xl border flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100'}`}
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>

          <div className={`grid grid-cols-2 gap-4 pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expedited LTL Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">2-Year Cert Warranty</span>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-12 py-10">
        <div className={`flex items-center gap-8 border-b pb-0 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          {(['specs', 'compliance', 'shipping'] as const).map(tab => {
            const label = tab === 'specs' ? 'TECHNICAL SPECS' : tab === 'compliance' ? 'COMPLIANCE' : 'SHIPPING DATA';
            const words = label.split(' ');
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`group relative text-[11px] font-black uppercase tracking-widest pb-4 transition-all flex items-center gap-1.5`}
              >
                <span className={`px-1.5 py-0.5 transition-colors ${
                  activeTab === tab 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-slate-500 group-hover:text-yellow-400'
                }`}>
                  {words[0]}
                </span>
                <span className={`${
                  activeTab === tab 
                    ? isDark ? 'text-white' : 'text-slate-900' 
                    : 'text-slate-500 group-hover:text-yellow-400'
                }`}>
                  {words.slice(1).join(' ')}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-400" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'compliance' ? (
          <div className={`flex flex-col items-center justify-center py-16 gap-5 rounded-2xl border-2 border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
            <ShieldCheck className="w-10 h-10 opacity-30" />
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest">Platform Compliance Documentation</p>
              <p className="text-[9px] font-bold opacity-60">ISO, CE, RoHS and full audit records are managed at the platform level.</p>
            </div>
            <Link to="/compliance" className="text-yellow-400 text-[9px] font-black uppercase tracking-widest border border-yellow-400/20 px-6 py-2.5 rounded-full hover:bg-yellow-400/10 transition-colors">
              View Compliance Docs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20">
            {(activeTab === 'specs' ? [
                ...(raw.materialSpecifications ? [{ label: 'Material Specifications', value: raw.materialSpecifications }] : []),
                { label: 'Category', value: raw.category },
                { label: 'Stock', value: `${raw.stock} Units` },
                { label: 'Availability', value: raw.availability ? 'Available' : 'Unavailable' },
                ...(raw.desc ? [{ label: 'Description', value: raw.desc }] : []),
              ] : [
                { label: 'Freight Class', value: raw.category ? `LTL — ${raw.category}` : 'LTL Freight' },
                { label: 'Lead Time', value: raw.stock > 0 ? '3–5 Business Days' : 'On Backorder' },
                { label: 'Export Control', value: 'EAR99' },
              ]).map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-6 border-b transition-all duration-300 ${isDark ? 'border-white/[0.03] hover:border-white/10' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{item.label}</span>
                <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {specSheets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-[1.5px] bg-yellow-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Technical Downloads</span>
          </div>
          <div className="space-y-3">
            {specSheets.map(sheet => (
              <div key={sheet._id} className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{sheet.title}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      {sheet.fileType}{sheet.version ? ` · v${sheet.version}` : ''}{sheet.fileSize ? ` · ${sheet.fileSize}` : ''}
                    </p>
                  </div>
                </div>
                {sheet.fileUrl ? (
                  <a
                    href={sheet.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-black'}`}
                  >
                    Download
                  </a>
                ) : (
                  <span className="px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-500 border border-slate-500/20">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
