import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Package, CheckCircle, MapPin, X, CreditCard, Banknote, Save, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, userApi, Address, feesApi, Fee } from '../api';
import { formatPrice } from '../utils/currency';
import { useTheme } from '../context/ThemeContext';
import { getApplicableFees } from '../utils/fees';

const EMPTY_ADDR: Omit<Address, '_id'> = {
  area: '', city: '', state: '', pincode: '', country: 'India',
  building: '', landmark: '', alternatephone: '',
};

export const Cart: React.FC = () => {
  const { isDark } = useTheme();
  const { items, removeItem, updateQuantity, totalValue, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [fees, setFees] = useState<Fee[]>([]);

  useEffect(() => {
    feesApi.getEnabled().then(r => setFees(r.fees)).catch(() => {});
  }, []);

  const applicableFees = getApplicableFees(fees, items.length, totalValue);
  const grandTotal = totalValue + applicableFees.reduce((s, f) => s + f.amount, 0);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addr, setAddr] = useState({ ...EMPTY_ADDR });
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addrFetchWarn, setAddrFetchWarn] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('COD');
  const [saveAddress, setSaveAddress] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const field = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  useEffect(() => {
    if (!token) return;
    userApi.getProfile(token)
      .then(res => {
        setSavedAddresses(res.user.address || []);
        if (res.user.address?.length > 0) {
          const defaultAddr = res.user.address[0];
          setAddr({ building: defaultAddr.building || '', area: defaultAddr.area, landmark: defaultAddr.landmark || '', city: defaultAddr.city, state: defaultAddr.state, pincode: defaultAddr.pincode, country: defaultAddr.country, alternatephone: defaultAddr.alternatephone || '' });
        }
      })
      .catch(() => setAddrFetchWarn('Could not load saved addresses. Enter manually.'));
  }, [token]);

  const handlePlaceOrder = async () => {
    setShowAddressModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!addr.area || !addr.city || !addr.state || !addr.pincode || !addr.country) {
      setError('Please fill all required address fields.'); return;
    }

    setError('');
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({ product: String(i.id), quantity: i.quantity }));
      const res = await orderApi.create({ 
        items: orderItems, 
        shippingAddress: addr, 
        paymentMethod,
        notes: orderNotes.trim() || undefined,
      }, token!);
      
      if (saveAddress && user?.id) {
        try {
          await userApi.addAddress({ ...addr, _id: '' }, token!);
        } catch { /* ignore save errors */ }
      }
      
      setSuccess(`Order ${res.order.orderNumber} placed successfully!`);
      clearCart();
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
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
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
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
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className={`flex items-end justify-between border-b pb-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div>
          <Link to="/products" className={`text-xs font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'} flex items-center gap-1 mb-2 hover:underline`}>
            <ArrowLeft className="w-3 h-3" /> Continue Shopping
          </Link>
          <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Shopping Cart</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Review your items and proceed to checkout.</p>
        </div>
        <span className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-slate-600'}`}>
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Cart Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${isDark ? 'bg-zinc-900/50 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:shadow-lg'}`}>
              <div className={`w-20 h-20 rounded-lg p-2 flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">SKU: BM-PRD-{String(item.id).slice(-4)}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className={`p-1.5 rounded-lg transition-colors shrink-0 ${isDark ? 'hover:bg-red-500/10 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 text-slate-500 hover:text-yellow-400 transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className={`text-xs font-bold w-5 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-500 hover:text-yellow-400 transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-[9px] text-slate-500 font-medium">{formatPrice(item.price)} / unit</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link to="/products" className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${isDark ? 'border-white/5 text-slate-500 hover:border-yellow-400/30 hover:text-yellow-400' : 'border-slate-100 text-slate-400 hover:border-yellow-400/40 hover:text-yellow-500'}`}>
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">Add more items</span>
          </Link>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:sticky lg:top-24">
          <div className={`p-5 rounded-xl border flex flex-col gap-5 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Items Total</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(totalValue)}</span>
              </div>
              {applicableFees.map(fee => (
                <div key={fee.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{fee.name}</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(fee.amount)}</span>
                </div>
              ))}
              <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Grand Total</span>
                <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(grandTotal)}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-wider ${mutedClass} mb-2`}>Payment Method</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'COD'
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : isDark ? 'border-white/10 text-slate-400 hover:border-yellow-400/40' : 'border-slate-200 text-slate-600 hover:border-yellow-400'
                  }`}
                >
                  <Banknote className="w-4 h-4" /> COD
                </button>
                <button
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : isDark ? 'border-white/10 text-slate-400 hover:border-yellow-400/40' : 'border-slate-200 text-slate-600 hover:border-yellow-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Online
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-medium bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-yellow-400 text-black py-3.5 rounded-lg font-bold text-sm transition-all hover:bg-yellow-300 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span> <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              <span>Secure checkout</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !placing && setShowAddressModal(false)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`sticky top-0 px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-white/10 bg-zinc-900' : 'border-slate-100 bg-white'}`}>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Shipping Address</h2>
                <p className={`text-xs ${mutedClass}`}>Enter delivery details</p>
              </div>
              <button onClick={() => setShowAddressModal(false)} disabled={placing} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {addrFetchWarn && (
                <p className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-lg">{addrFetchWarn}</p>
              )}

              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Saved Addresses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedAddresses.map(a => (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setAddr({ building: a.building || '', area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pincode: a.pincode, country: a.country, alternatephone: a.alternatephone || '' })}
                        className={`text-left p-3 rounded-lg border transition-all text-left ${
                          addr.area === a.area && addr.pincode === a.pincode
                            ? 'border-yellow-400 bg-yellow-400/5'
                            : isDark ? 'border-white/10 hover:border-white/20 text-slate-300' : 'border-slate-200 hover:border-yellow-400 text-slate-700'
                        }`}
                      >
                        <p className="text-xs font-medium">{[a.building, a.area].filter(Boolean).join(', ')}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.city}, {a.state} — {a.pincode}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">Or enter a new address below</p>
                </div>
              )}

              {error && <p className="text-xs text-red-400 font-medium bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'building', label: 'Building / House No.', placeholder: '12A, Tower Block' },
                  { key: 'area', label: 'Area / Street *', placeholder: 'MG Road' },
                  { key: 'landmark', label: 'Landmark', placeholder: 'Near Central Park' },
                  { key: 'city', label: 'City *', placeholder: 'Mumbai' },
                  { key: 'state', label: 'State *', placeholder: 'Maharashtra' },
                  { key: 'pincode', label: 'Pincode *', placeholder: '400001' },
                  { key: 'country', label: 'Country *', placeholder: 'India' },
                  { key: 'alternatephone', label: 'Alternate Phone', placeholder: '+91 98765 43210' },
                ] as const).map(f => (
                  <div key={f.key} className={f.key === 'building' || f.key === 'landmark' || f.key === 'alternatephone' ? '' : 'sm:col-span-1'}>
                    <label className="text-[10px] font-medium text-slate-500 mb-1.5 block">{f.label}</label>
                    <input
                      value={(addr as any)[f.key] || ''}
                      onChange={e => setAddr(a => ({ ...a, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={`w-full px-3 py-2.5 rounded-lg border text-xs font-medium outline-none transition-colors ${field}`}
                    />
                  </div>
                ))}
              </div>

              {/* Save Address */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-yellow-400 focus:ring-yellow-400" />
                <span className="text-xs font-medium text-slate-500">Save this address for future orders</span>
              </label>

              {/* Order Notes */}
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1.5 block">Order Notes (optional)</label>
                <textarea
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Special delivery instructions..."
                  rows={2}
                  className={`w-full px-3 py-2.5 rounded-lg border text-xs font-medium outline-none transition-colors resize-none ${field}`}
                />
              </div>
            </div>

            <div className={`px-6 py-4 flex items-center justify-end gap-3 border-t ${isDark ? 'border-white/10 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <button onClick={() => setShowAddressModal(false)} disabled={placing} className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={placing}
                className="px-6 py-2.5 bg-yellow-400 text-black rounded-lg font-bold text-sm hover:bg-yellow-300 flex items-center gap-2 disabled:opacity-60"
              >
                {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><span>Confirm Order</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mutedClass = 'text-slate-500';