import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartProps {
  isDark: boolean;
}

const LOGISTICS_FEE = 450;

export const Cart: React.FC<CartProps> = ({ isDark }) => {
  const { items, removeItem, updateQuantity, totalValue } = useCart();

  const grandTotal = totalValue + (items.length > 0 ? LOGISTICS_FEE : 0);

  if (items.length === 0) {
    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1.5px] bg-yellow-400"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Procurement Management</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Current List</h1>
        </div>
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed gap-6 ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <Package className="w-16 h-16 opacity-30" />
          <p className="text-[10px] font-black uppercase tracking-widest">Procurement list is empty</p>
          <Link
            to="/products"
            className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Procurement Management</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Current List</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map(item => (
            <div key={item.id} className={`p-6 rounded-2xl border flex items-center gap-6 transition-all ${isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-xl'}`}>
              <div className={`w-32 h-32 rounded-xl p-4 flex items-center justify-center shrink-0 ${isDark ? 'bg-[#1a1a1a]' : 'bg-slate-50'}`}>
                <img src={item.image} alt={item.name} className="max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h3 className={`text-base font-black leading-tight uppercase line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${isDark ? 'hover:bg-white/5 text-slate-500 hover:text-red-400' : 'hover:bg-slate-50 text-slate-400 hover:text-red-600'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-4 px-3 py-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-slate-500 hover:text-yellow-400 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-xs font-black w-4 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-slate-500 hover:text-yellow-400 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {item.bulkInfo ? 'Bulk Unit Rate' : 'Standard Rate'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${item.price.toFixed(2)} / unit</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className={`p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center space-y-4 ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <Plus className="w-8 h-8" />
            <Link to="/products" className="text-[10px] font-black uppercase tracking-widest hover:text-yellow-400 transition-all">
              Add more inventory items
            </Link>
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`p-8 rounded-2xl border space-y-8 sticky top-24 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
            <h2 className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Quote Summary</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Sub-Total</span>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>LTL Logistics Estimate</span>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>${LOGISTICS_FEE.toFixed(2)}</span>
              </div>
              <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 border-t pt-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className="text-yellow-400">Total Quote Value</span>
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Verified Manufacturer Pricing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Truck className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Standard Freight: 3-5 Days</span>
              </div>
            </div>

            <button className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-yellow-300 transition-all shadow-2xl flex items-center justify-center gap-3">
              Generate Final RFQ <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
