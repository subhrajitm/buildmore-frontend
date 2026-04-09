import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Package, CheckCircle, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, userApi, Address } from '../api';

interface CartProps {
  isDark: boolean;
}

const LOGISTICS_FEE = 450;

const EMPTY_ADDR: Omit<Address, '_id'> = {
  area: '', city: '', state: '', pincode: '', country: 'India',
  building: '', landmark: '', alternatephone: '',
};

export const Cart: React.FC<CartProps> = ({ isDark }) => {
  const { items, removeItem, updateQuantity, totalValue, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const grandTotal = totalValue + (items.length > 0 ? LOGISTICS_FEE : 0);

  const [showAddress, setShowAddress] = useState(false);
  const [addr, setAddr] = useState({ ...EMPTY_ADDR });
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addrFetchWarn, setAddrFetchWarn] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) return;
    userApi.getProfile(token)
      .then(res => setSavedAddresses(res.user.address || []))
      .catch(() => setAddrFetchWarn('Could not load saved addresses. Enter manually.'));
  }, [token]);

  const handlePlaceOrder = async () => {
    if (!showAddress) { setShowAddress(true); return; }

    if (!addr.area || !addr.city || !addr.state || !addr.pincode || !addr.country) {
      setError('Please fill all required address fields.'); return;
    }

    setError('');
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({ product: String(i.id), quantity: i.quantity }));
      const res = await orderApi.create({ items: orderItems, shippingAddress: addr }, token!);
      setSuccess(`Order ${res.order.orderNumber} placed successfully!`);
      clearCart();
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const field = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in text-center px-6">
        <div className="w-24 h-24 rounded-full bg-green-400/10 flex items-center justify-center mb-8">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className={`text-4xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{success}</h1>
        <p className="text-slate-500 mb-4">Redirecting to your profile…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in text-center px-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
          <Package className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        </div>
        <h1 className={`text-4xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Your cart is empty</h1>
        <p className="text-slate-500 mb-10 max-w-sm">Browse our catalog to get started.</p>
        <Link to="/products" className="bg-yellow-400 text-black px-10 py-4 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-all shadow-xl hover:scale-105 active:scale-95">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className={`flex items-end justify-between border-b pb-8 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Shopping Cart</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Review your items and proceed to checkout.</p>
        </div>
        <span className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-slate-600'}`}>
          {items.length} {items.length === 1 ? 'Item' : 'Items'} Selected
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className={`p-5 rounded-2xl border flex items-center gap-6 transition-all group ${isDark ? 'bg-zinc-900/50 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:shadow-xl'}`}>
              <div className={`w-24 h-24 rounded-xl p-3 flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <img src={item.image} alt={item.name} className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between h-24">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-sm font-bold leading-tight line-clamp-1 mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">SKU: BM-PRD-{String(item.id).slice(-4)}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className={`flex items-center gap-3 px-2 py-1.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 text-slate-500 hover:text-yellow-400 transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className={`text-xs font-bold w-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-500 hover:text-yellow-400 transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${item.price.toFixed(2)} / unit</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link to="/products" className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${isDark ? 'border-white/5 text-slate-500 hover:border-yellow-400/30 hover:text-yellow-400' : 'border-slate-100 text-slate-400 hover:border-yellow-400/40 hover:text-yellow-400'}`}>
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold">Add more items to your order</span>
          </Link>

          {/* Shipping Address Form */}
          {showAddress && (
            <div className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-zinc-900 border-yellow-400/20' : 'bg-white border-yellow-400/30 shadow-xl'}`}>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Shipping Address</h3>
              </div>

              {addrFetchWarn && (
                <p className="text-[10px] font-bold text-yellow-500 bg-yellow-400/10 border border-yellow-400/20 px-3 py-2 rounded-lg">{addrFetchWarn}</p>
              )}

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Saved Addresses</p>
                  <div className="flex flex-col gap-2">
                    {savedAddresses.map(a => (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setAddr({ building: a.building || '', area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pincode: a.pincode, country: a.country, alternatephone: a.alternatephone || '' })}
                        className={`text-left p-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:border-yellow-400/40 text-slate-300' : 'bg-slate-50 border-slate-200 hover:border-yellow-400 text-slate-700'}`}
                      >
                        <p className="text-xs font-bold">{[a.building, a.area].filter(Boolean).join(', ')}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.city}, {a.state} — {a.pincode}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold">or fill in below</p>
                </div>
              )}

              {error && <p className="text-xs text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { key: 'building', label: 'Building / House No.', required: false, placeholder: '12A, Tower Block' },
                  { key: 'area', label: 'Area / Street *', required: true, placeholder: 'MG Road' },
                  { key: 'landmark', label: 'Landmark', required: false, placeholder: 'Near Central Park' },
                  { key: 'city', label: 'City *', required: true, placeholder: 'Mumbai' },
                  { key: 'state', label: 'State *', required: true, placeholder: 'Maharashtra' },
                  { key: 'pincode', label: 'Pincode *', required: true, placeholder: '400001' },
                  { key: 'country', label: 'Country *', required: true, placeholder: 'India' },
                  { key: 'alternatephone', label: 'Alternate Phone', required: false, placeholder: '+91 98765 43210' },
                ] as const).map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{f.label}</label>
                    <input
                      required={f.required}
                      value={(addr as any)[f.key] || ''}
                      onChange={e => setAddr(a => ({ ...a, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${field}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-24">
          <div className={`p-8 rounded-3xl border flex flex-col gap-8 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50'}`}>
            <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Items Total</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 font-medium">Flat Logistics Fee</span>
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">LTL · Standard delivery 3–5 days</span>
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${LOGISTICS_FEE.toFixed(2)}</span>
              </div>
              <div className={`flex items-center justify-between pt-5 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Grand Total</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-yellow-500">${grandTotal.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Estimates included</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl space-y-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-slate-500">Secure Checkout Guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500">Flat logistics fee covers LTL freight nationwide</span>
              </div>
            </div>

            {error && !showAddress && <p className="text-xs text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-yellow-400 text-black py-4 rounded-xl font-black text-sm transition-all shadow-xl hover:bg-yellow-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {placing
                ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Placing Order…</>
                : showAddress
                  ? <>Confirm Order <ArrowRight className="w-5 h-5" /></>
                  : <>Enter Shipping Address <ArrowRight className="w-5 h-5" /></>
              }
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
