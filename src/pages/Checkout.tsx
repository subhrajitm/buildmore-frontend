import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Package, CheckCircle, MapPin, X, CreditCard, Banknote, Save, FileText, ArrowLeft, Loader2, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, userApi, Address } from '../api';
import { formatPrice } from '../utils/currency';

interface CheckoutProps {
  isDark: boolean;
}

const LOGISTICS_FEE = 450;

const EMPTY_ADDR: Omit<Address, '_id'> = {
  area: '', city: '', state: '', pincode: '', country: 'India',
  building: '', landmark: '', alternatephone: '',
};

export const Checkout: React.FC<CheckoutProps> = ({ isDark }) => {
  const { items, removeItem, updateQuantity, totalValue, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const grandTotal = totalValue + (items.length > 0 ? LOGISTICS_FEE : 0);

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

  useEffect(() => {
    if (items.length === 0 && !success) {
      navigate('/cart');
    }
  }, [items, navigate, success]);

  const handlePlaceOrder = async () => {
    if (!addr.area || !addr.city || !addr.state || !addr.pincode || !addr.country) {
      setError('Please fill in shipping address'); return;
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
      setTimeout(() => navigate('/profile'), 2500);
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
        <h1 className={`text-3xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Placed!</h1>
        <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{success}</p>
        <p className="text-slate-500 mt-2">Redirecting to your profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-6 mb-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div>
          <Link to="/cart" className={`text-xs font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'} flex items-center gap-1 mb-2 hover:underline`}>
            <ArrowLeft className="w-3 h-3" /> Back to Cart
          </Link>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Checkout</h1>
          <p className="text-sm text-slate-500 mt-1">Complete your order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Address */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-yellow-500" />
              <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Shipping Address</h2>
            </div>

            {addrFetchWarn && (
              <p className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-lg mb-3">{addrFetchWarn}</p>
            )}

            {savedAddresses.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2">Saved Addresses</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAddresses.map(a => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => setAddr({ building: a.building || '', area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pincode: a.pincode, country: a.country, alternatephone: a.alternatephone || '' })}
                      className={`text-left p-3 rounded-lg border text-left ${
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
              </div>
            )}

            <p className="text-[10px] font-medium text-slate-500 mb-2">Or enter new address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'building', label: 'Building', placeholder: '12A, Tower Block' },
                { key: 'area', label: 'Area *', placeholder: 'MG Road' },
                { key: 'city', label: 'City *', placeholder: 'Mumbai' },
                { key: 'state', label: 'State *', placeholder: 'Maharashtra' },
                { key: 'pincode', label: 'Pincode *', placeholder: '400001' },
              ] as const).map(f => (
                <div key={f.key} className={f.key === 'building' ? '' : ''}>
                  <input
                    value={(addr as any)[f.key] || ''}
                    onChange={e => setAddr(a => ({ ...a, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-medium outline-none ${field}`}
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-xs text-slate-500">Save address for future orders</span>
            </label>
          </div>

          {/* Payment Method */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-yellow-500" />
              <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Payment Method</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentMethod('COD')}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'COD'
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : isDark ? 'border-white/10 text-slate-400 hover:border-yellow-400/40' : 'border-slate-200 text-slate-600 hover:border-yellow-400'
                }`}
              >
                <Banknote className="w-4 h-4" /> Cash on Delivery
              </button>
              <button
                onClick={() => setPaymentMethod('ONLINE')}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : isDark ? 'border-white/10 text-slate-400 hover:border-yellow-400/40' : 'border-slate-200 text-slate-600 hover:border-yellow-400'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Online Payment
              </button>
            </div>
          </div>

          {/* Order Notes */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-yellow-500" />
              <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Notes (optional)</h2>
            </div>
            <textarea
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              placeholder="Special delivery instructions..."
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium outline-none resize-none ${field}`}
            />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-24">
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
            <h2 className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <img src={item.image} alt="" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                    <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Items Total</span>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>{formatPrice(totalValue)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Logistics</span>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>{formatPrice(LOGISTICS_FEE)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Total</span>
                <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium bg-red-400/10 px-3 py-2 rounded-lg mt-3">{error}</p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-yellow-400 text-black py-3.5 rounded-lg font-bold text-sm mt-4 hover:bg-yellow-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><span>Place Order</span> <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="flex items-center gap-2 justify-center mt-3 text-[10px] text-slate-500">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};