import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, ArrowRight, ChevronRight, FileText, Download, Zap, Check, Plus, Minus } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { useCart } from '../context/CartContext';

interface ProductDetailProps {
  isDark: boolean;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ isDark }) => {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find(p => p.id === Number(id)) || PRODUCTS[0];
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'compliance' | 'shipping'>('specs');

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
            <div className="flex items-center gap-3">
              <span className="bg-yellow-400 text-black px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm">
                In Stock: 42 Units
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.rating} ({product.reviews?.toLocaleString()} Reviews)</span>
              </div>
            </div>
            <h1 className={`text-4xl font-black tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {product.name}
            </h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">
              Professional-grade industrial component engineered for extreme environments. Optimized for high-density duty cycles and rigorous enterprise safety standards. Includes full compliance documentation and technical schemas.
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
            <button className={`px-6 rounded-xl border flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100'}`}>
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

      <section className="space-y-8">
        <div className={`flex items-center gap-4 border-b pb-4 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          {(['specs', 'compliance', 'shipping'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-black uppercase tracking-widest pb-4 border-b-2 -mb-4 transition-all ${
                activeTab === tab
                  ? isDark ? 'text-white border-yellow-400' : 'text-slate-900 border-slate-900'
                  : 'text-slate-500 border-transparent hover:text-yellow-400'
              }`}
            >
              {tab === 'specs' ? 'Technical Specs' : tab === 'compliance' ? 'Compliance' : 'Shipping Data'}
            </button>
          ))}
        </div>

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
            {[
              { label: 'Voltage Range', value: '18V - 24V DC' },
              { label: 'Duty Cycle', value: '100% @ 40°C' },
              { label: 'Ingress Protection', value: 'IP67 Certified' },
              { label: 'Weight (Unloaded)', value: '3.2 kg' },
              { label: 'Materials', value: 'Composite/Aluminum' },
              { label: 'Warranty Code', value: 'IND-S-4200' },
            ].map((spec, i) => (
              <div key={i} className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{spec.label}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
            {[
              { label: 'ISO Certification', value: 'ISO 9001:2015' },
              { label: 'Safety Standard', value: 'CE / UL Listed' },
              { label: 'RoHS Compliance', value: 'Compliant' },
              { label: 'REACH Registration', value: 'Registered' },
              { label: 'SDS Sheet', value: 'Available' },
              { label: 'Audit Trail', value: 'Full Chain of Custody' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
            {[
              { label: 'Freight Class', value: 'LTL Class 70' },
              { label: 'Package Dimensions', value: '48" × 24" × 18"' },
              { label: 'Gross Weight', value: '42 lbs' },
              { label: 'Lead Time', value: '3-5 Business Days' },
              { label: 'Origin Warehouse', value: 'London Hub SE1' },
              { label: 'Export Control', value: 'EAR99' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-100'} flex items-center justify-between`}>
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-black" />
          </div>
          <div>
            <h4 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Technical Schema Bundle</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PDF, CAD, and Compliance PDF (14.2 MB)</p>
          </div>
        </div>
        <button className={`px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-black'}`}>Download Docs</button>
      </section>
    </div>
  );
};
