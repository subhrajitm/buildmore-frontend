import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle, MapPin, CreditCard, Banknote, FileText, ArrowLeft, Loader2, Check, ChevronDown, ChevronUp, Home, Building2, Pencil, Trash2, X } from 'lucide-react';
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

export const Checkout: React.FC = () => {
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

  const [addr, setAddr] = useState({ ...EMPTY_ADDR });
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Address, '_id'>>({ ...EMPTY_ADDR });
  const [editSaving, setEditSaving] = useState(false);
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
    if (!token) { setShowNewForm(true); return; }
    userApi.getProfile(token)
      .then(res => {
        const addresses = res.user.address || [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const first = addresses[0];
          setSelectedAddressId(first._id);
          setAddr({ building: first.building || '', area: first.area, landmark: first.landmark || '', city: first.city, state: first.state, pincode: first.pincode, country: first.country, alternatephone: first.alternatephone || '' });
        } else {
          setShowNewForm(true);
        }
      })
      .catch(() => { setAddrFetchWarn('Could not load saved addresses.'); setShowNewForm(true); });
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
      
      if (saveAddress && user?._id) {
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

  const startEdit = (a: Address) => {
    setEditingAddressId(a._id);
    setEditForm({ building: a.building || '', area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pincode: a.pincode, country: a.country, alternatephone: a.alternatephone || '' });
  };

  const cancelEdit = () => { setEditingAddressId(null); };

  const saveEdit = async (id: string) => {
    if (!token) return;
    setEditSaving(true);
    try {
      const res = await userApi.updateAddress(id, editForm, token);
      const updated = res.address;
      setSavedAddresses(updated);
      if (selectedAddressId === id) {
        setAddr({ ...editForm });
      }
      setEditingAddressId(null);
    } catch {
      // silently ignore — user can retry
    } finally {
      setEditSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!token) return;
    try {
      const res = await userApi.deleteAddress(id, token);
      const updated = res.address;
      setSavedAddresses(updated);
      if (selectedAddressId === id) {
        if (updated.length > 0) {
          const first = updated[0];
          setSelectedAddressId(first._id);
          setAddr({ building: first.building || '', area: first.area, landmark: first.landmark || '', city: first.city, state: first.state, pincode: first.pincode, country: first.country, alternatephone: first.alternatephone || '' });
        } else {
          setSelectedAddressId(null);
          setAddr({ ...EMPTY_ADDR });
          setShowNewForm(true);
        }
      }
    } catch { /* ignore */ }
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
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
            {/* Section Header */}
            <div className={`flex items-center gap-2 px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <MapPin className="w-4 h-4 text-yellow-500" />
              <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Shipping Address</h2>
            </div>

            <div className="p-5 space-y-4">
              {addrFetchWarn && (
                <p className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-lg">{addrFetchWarn}</p>
              )}

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Saved Addresses
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedAddresses.map(a => {
                      const isSelected = selectedAddressId === a._id;
                      const isEditing = editingAddressId === a._id;

                      return (
                        <div
                          key={a._id}
                          className={`rounded-xl border transition-all ${
                            isSelected && !isEditing
                              ? 'border-yellow-400 bg-yellow-400/5'
                              : isEditing
                              ? isDark ? 'border-yellow-400/50 bg-zinc-800' : 'border-yellow-300 bg-yellow-50'
                              : isDark
                              ? 'border-white/10'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* View mode */}
                          {!isEditing ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAddressId(a._id);
                                setAddr({ building: a.building || '', area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pincode: a.pincode, country: a.country, alternatephone: a.alternatephone || '' });
                                setShowNewForm(false);
                              }}
                              className="relative w-full text-left p-3"
                            >
                              {/* Selected indicator */}
                              <div className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                isSelected ? 'bg-yellow-400' : isDark ? 'bg-white/10' : 'bg-slate-100'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-black" />}
                              </div>

                              <div className="flex items-start gap-2 pr-6">
                                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                                  <Home className="w-3 h-3 text-yellow-500" />
                                </div>
                                <div>
                                  <p className={`text-xs font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {[a.building, a.area].filter(Boolean).join(', ') || a.area}
                                  </p>
                                  {a.landmark && (
                                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                      Near {a.landmark}
                                    </p>
                                  )}
                                  <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {a.city}, {a.state} — {a.pincode}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ) : null}

                          {/* Edit / Delete action row (shown when not editing) */}
                          {!isEditing && (
                            <div className={`flex items-center gap-1 px-3 pb-2`}>
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); startEdit(a); }}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                  isDark ? 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-slate-400 hover:text-yellow-600 hover:bg-yellow-50'
                                }`}
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); deleteAddress(a._id); }}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                  isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          )}

                          {/* Inline Edit Form */}
                          {isEditing && (
                            <div className="p-3 space-y-2">
                              <div className={`flex items-center justify-between mb-1`}>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                  Edit Address
                                </span>
                                <button type="button" onClick={cancelEdit} className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}>
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {([
                                  { key: 'building', placeholder: 'Building / Flat' },
                                  { key: 'area',     placeholder: 'Area / Street *' },
                                  { key: 'landmark', placeholder: 'Landmark' },
                                  { key: 'city',     placeholder: 'City *' },
                                  { key: 'state',    placeholder: 'State *' },
                                  { key: 'pincode',  placeholder: 'Pincode *' },
                                ] as const).map(f => (
                                  <input
                                    key={f.key}
                                    value={(editForm as any)[f.key] || ''}
                                    onChange={e => setEditForm(v => ({ ...v, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder}
                                    className={`w-full px-3 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all ${field}`}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(a._id)}
                                  disabled={editSaving}
                                  className="flex-1 py-1.5 bg-yellow-400 text-black text-xs font-black rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                                >
                                  {editSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className={`flex-1 py-1.5 text-xs font-black rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:border-white/20' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Address Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !showNewForm;
                  setShowNewForm(next);
                  if (next) {
                    setSelectedAddressId(null);
                    setAddr({ ...EMPTY_ADDR });
                  } else if (savedAddresses.length > 0) {
                    const first = savedAddresses[0];
                    setSelectedAddressId(first._id);
                    setAddr({ building: first.building || '', area: first.area, landmark: first.landmark || '', city: first.city, state: first.state, pincode: first.pincode, country: first.country, alternatephone: first.alternatephone || '' });
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  showNewForm
                    ? 'border-yellow-400 bg-yellow-400/5'
                    : isDark
                    ? 'border-white/10 hover:border-white/20'
                    : 'border-slate-200 hover:border-yellow-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${showNewForm ? 'bg-yellow-400/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <Building2 className={`w-3.5 h-3.5 ${showNewForm ? 'text-yellow-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-xs font-semibold ${showNewForm ? (isDark ? 'text-yellow-400' : 'text-yellow-600') : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {savedAddresses.length > 0 ? 'Add New Address' : 'Enter Delivery Address'}
                  </span>
                </div>
                {savedAddresses.length > 0 && (
                  showNewForm
                    ? <ChevronUp className="w-4 h-4 text-yellow-500" />
                    : <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                )}
              </button>

              {/* New Address Form */}
              {showNewForm && (
                <div className={`rounded-xl border p-4 space-y-3 ${isDark ? 'bg-zinc-800/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: 'building', label: 'Building / Flat', placeholder: '12A, Tower Block' },
                      { key: 'area',     label: 'Area / Street *', placeholder: 'MG Road' },
                      { key: 'landmark', label: 'Landmark',        placeholder: 'Near City Mall' },
                      { key: 'city',     label: 'City *',          placeholder: 'Mumbai' },
                      { key: 'state',    label: 'State *',         placeholder: 'Maharashtra' },
                      { key: 'pincode',  label: 'Pincode *',       placeholder: '400001' },
                    ] as const).map(f => (
                      <div key={f.key}>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {f.label}
                        </label>
                        <input
                          value={(addr as any)[f.key] || ''}
                          onChange={e => setAddr(a => ({ ...a, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className={`w-full px-3 py-2 rounded-lg border text-xs font-medium outline-none transition-all ${field}`}
                        />
                      </div>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <div
                      onClick={() => setSaveAddress(v => !v)}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                        saveAddress ? 'bg-yellow-400 border-yellow-400' : isDark ? 'border-white/20' : 'border-slate-300'
                      }`}
                    >
                      {saveAddress && <Check className="w-2.5 h-2.5 text-black" />}
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Save this address for future orders
                    </span>
                  </label>
                </div>
              )}
            </div>
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
                disabled
                title="Coming soon"
                className={`flex-1 py-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-40 ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}
              >
                <CreditCard className="w-4 h-4" /> Online Payment
                <span className="text-[9px] font-bold uppercase tracking-wider ml-1">(Soon)</span>
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
              {applicableFees.map(fee => (
                <div key={fee.id} className="flex justify-between text-xs">
                  <span className="text-slate-500">{fee.name}</span>
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>{formatPrice(fee.amount)}</span>
                </div>
              ))}
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