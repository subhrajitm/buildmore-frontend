import React, { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, BarChart, Plus, Pencil, Trash2, Check, LogOut, Mail, Phone, Calendar, TrendingUp, Truck, Clock, RefreshCw, X, Loader2, FileText, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi, orderApi, shipmentApi, UserProfile, Order, Address } from '../api';
import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../utils/currency';
import { useTheme } from '../context/ThemeContext';

const EMPTY_ADDR = { building: '', area: '', landmark: '', city: '', state: '', pincode: '', country: 'India', alternatephone: '' };

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING:    'text-yellow-400 bg-yellow-400/10',
  CONFIRMED:  'text-blue-400 bg-blue-400/10',
  PROCESSING: 'text-blue-400 bg-blue-400/10',
  SHIPPED:    'text-purple-400 bg-purple-400/10',
  DELIVERED:  'text-green-400 bg-green-400/10',
  CANCELLED:  'text-red-400 bg-red-400/10',
};

const ORDER_BORDER: Record<string, string> = {
  PENDING:    'border-l-yellow-400',
  CONFIRMED:  'border-l-blue-400',
  PROCESSING: 'border-l-blue-400',
  SHIPPED:    'border-l-purple-400',
  DELIVERED:  'border-l-green-500',
  CANCELLED:  'border-l-red-400',
};

type Tab = 'overview' | 'orders' | 'addresses' | 'account';

export const Profile: React.FC = () => {
  const { isDark } = useTheme();
  const { token, logout, updateUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'overview');

  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ ...EMPTY_ADDR });
  const [addrError, setAddrError] = useState('');
  const [addrSaving, setAddrSaving] = useState(false);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReasonMap, setCancelReasonMap] = useState<Record<string, string>>({});

  const [editingAccount, setEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', phone: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState('');

  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100';
  const input = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'account', label: 'Account', icon: Mail },
  ];

  const fetchData = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setLoadError('');
    Promise.allSettled([
      userApi.getProfile(token),
      orderApi.getAll(token),
      shipmentApi.getAll(token),
    ]).then(([p, o, s]) => {
      if (p.status === 'rejected') {
        setLoadError((p.reason as Error)?.message || 'Failed to load profile');
        return;
      }
      setProfile(p.value.user);
      if (o.status === 'fulfilled') setOrders(o.value.orders);
      if (s.status === 'fulfilled') setShipments(s.value.shipments);
    }).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAddAddr = () => { setAddrForm({ ...EMPTY_ADDR }); setEditingAddrId(null); setAddrError(''); setShowAddrForm(true); };
  const openEditAddr = (a: Address) => { setAddrForm({ building: a.building || '', area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pincode: a.pincode, country: a.country, alternatephone: a.alternatephone || '' }); setEditingAddrId(a._id!); setAddrError(''); setShowAddrForm(true); };

  const saveAddress = async () => {
    if (!addrForm.area || !addrForm.city || !addrForm.state || !addrForm.pincode || !addrForm.country) {
      setAddrError('Required fields missing'); return;
    }
    if (!token) return;
    setAddrSaving(true);
    try {
      const res = editingAddrId
        ? await userApi.updateAddress(editingAddrId, addrForm, token)
        : await userApi.addAddress(addrForm, token);
      setProfile(p => p ? { ...p, address: res.address } : p);
      setShowAddrForm(false);
    } catch (e: any) { setAddrError(e.message || 'Failed to save'); }
    finally { setAddrSaving(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!token || !window.confirm('Delete?')) return;
    try {
      const res = await userApi.deleteAddress(id, token);
      setProfile(p => p ? { ...p, address: res.address } : p);
    } catch { }
  };

  const cancelOrder = async (orderId: string) => {
    if (!token) return;
    const reason = (cancelReasonMap[orderId] || '').trim() || 'Cancelled by customer';
    setCancellingId(orderId);
    try {
      const res = await orderApi.cancel(orderId, reason, token);
      setOrders(prev => prev.map(o => o._id === orderId ? res.order : o));
      setCancelReasonMap(m => { const n = { ...m }; delete n[orderId]; return n; });
    } catch (e: any) {
      alert(e.message || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  const saveAccount = async () => {
    if (!token) return;
    if (!accountForm.name.trim()) { setAccountError('Name is required'); return; }
    if (accountForm.phone && accountForm.phone.length !== 10) { setAccountError('Phone must be 10 digits'); return; }
    setAccountSaving(true);
    setAccountError('');
    try {
      const res = await userApi.updateProfile({ name: accountForm.name.trim(), phone: accountForm.phone || undefined }, token);
      setProfile(p => p ? { ...p, name: res.user.name, phone: res.user.phone } : p);
      updateUser({ name: res.user.name });
      setEditingAccount(false);
    } catch (e: any) {
      setAccountError(e.message || 'Failed to save');
    } finally {
      setAccountSaving(false);
    }
  };

  const totalSpend = orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length;
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const activeShipments = shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'FAILED').length;

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-400 text-sm">{loadError}</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black text-xs font-black uppercase">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Profile header ──────────────────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className="h-0.5 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />
        <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg sm:text-xl font-black text-black">{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-sm sm:text-base font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.name}</h2>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 ${
                  profile?.role === 'ADMIN' ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'
                }`}>{profile?.role}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{profile?.email}{profile?.phone ? ` · ${profile.phone}` : ''}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="hidden sm:flex items-center gap-5">
              {[
                { label: 'Orders',    value: totalOrders },
                { label: 'Delivered', value: deliveredOrders },
                { label: 'Spent',     value: formatPrice(totalSpend) },
              ].map(stat => (
                <div key={stat.label} className="text-right">
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className={`p-2.5 rounded-xl transition-colors ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 w-full sm:w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex-1 sm:flex-none justify-center whitespace-nowrap ${
              activeTab === tab.id ? 'bg-yellow-400 text-black shadow-sm' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Spent',      value: formatPrice(totalSpend), icon: TrendingUp, accent: 'text-green-400'  },
              { label: 'Total Orders',     value: totalOrders,             icon: Package,    accent: 'text-blue-400'   },
              { label: 'In Progress',      value: pendingOrders,           icon: Clock,      accent: 'text-yellow-400' },
              { label: 'Active Shipments', value: activeShipments,         icon: Truck,      accent: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className={`p-4 rounded-2xl border flex items-center gap-3 ${card}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <stat.icon className={`w-4 h-4 ${stat.accent}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-base sm:text-lg font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Orders</h3>
              <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors">
                View All →
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Package className="w-8 h-8 text-slate-400 opacity-40" />
                <p className="text-xs text-slate-500">No orders yet</p>
                <Link to="/products" className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors">Browse Products →</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {orders.slice(0, 5).map(order => (
                  <div
                    key={order._id}
                    className={`flex items-center gap-4 px-5 py-3 border-l-2 ${ORDER_BORDER[order.status] || 'border-l-transparent'} ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/70'} transition-colors`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ORDER_STATUS_COLOR[order.status]}`}>{order.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className={`text-sm font-black shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(order.totalAmount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { label: 'Browse Products',   sub: 'Shop construction materials',        to: '/products', icon: Package  },
              { label: 'Quote Requests',    sub: 'Manage your RFQs',                   to: '/rfqs',     icon: FileText },
              { label: 'Saved Addresses',   sub: `${(profile?.address || []).length} addresses saved`, tab: 'addresses' as Tab, icon: MapPin   },
            ] as const).map(link => {
              const inner = (
                <>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <link.icon className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{link.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{link.sub}</p>
                  </div>
                </>
              );
              const cls = `flex items-center gap-3 p-4 rounded-2xl border transition-all ${card} ${isDark ? 'hover:border-white/10' : 'hover:shadow-md'}`;
              return 'to' in link ? (
                <Link key={link.label} to={link.to} className={cls}>{inner}</Link>
              ) : (
                <button key={link.label} onClick={() => setActiveTab(link.tab)} className={`w-full text-left ${cls}`}>{inner}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Orders ──────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-3.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Order History <span className="text-slate-500 font-medium normal-case ml-1">({orders.length})</span>
            </h3>
          </div>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Package className="w-10 h-10 text-slate-400 opacity-30" />
              <p className="text-xs text-slate-500 uppercase tracking-widest">No orders yet</p>
              <Link to="/products" className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors">Browse Products →</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {orders.map(order => {
                const cancellable = ['PENDING', 'CONFIRMED'].includes(order.status);
                const isCancelling = cancellingId === order._id;
                const reason = cancelReasonMap[order._id] || '';
                return (
                  <div key={order._id} className={`border-l-2 ${ORDER_BORDER[order.status] || 'border-l-transparent'}`}>
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ORDER_STATUS_COLOR[order.status]}`}>{order.status}</span>
                            <span className={`text-[9px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{order.paymentMethod || 'COD'}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-2">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {order.shippingAddress ? ` · ${order.shippingAddress.city}, ${order.shippingAddress.state}` : ''}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {order.items.map((item, i) => (
                              <span key={i} className={`text-[9px] font-bold px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                {item.productName} ×{item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(order.totalAmount)}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {cancellable && (
                        <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                          <input
                            value={reason}
                            onChange={e => setCancelReasonMap(m => ({ ...m, [order._id]: e.target.value }))}
                            placeholder="Cancel reason (optional)"
                            className={`flex-1 px-3 py-2 rounded-lg border text-xs outline-none transition-colors ${input}`}
                          />
                          <button
                            onClick={() => cancelOrder(order._id)}
                            disabled={isCancelling}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black uppercase text-red-400 bg-red-400/10 hover:bg-red-400/20 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {isCancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            {isCancelling ? 'Cancelling…' : 'Cancel Order'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Addresses ───────────────────────────────────────────────── */}
      {activeTab === 'addresses' && (
        <>
          {/* Address modal */}
          {showAddrForm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => { if (e.target === e.currentTarget) setShowAddrForm(false); }}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/70'}`}>
                  <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingAddrId ? 'Edit' : 'New'} Address
                  </h3>
                  <button onClick={() => setShowAddrForm(false)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  {addrError && (
                    <div className="px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20">
                      <p className="text-xs font-bold text-red-400">{addrError}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'building', label: 'Building / Flat',  cols: 2 },
                      { key: 'area',     label: 'Area / Street *',  cols: 2 },
                      { key: 'landmark', label: 'Landmark',         cols: 2 },
                      { key: 'city',     label: 'City *',           cols: 1 },
                      { key: 'state',    label: 'State *',          cols: 1 },
                      { key: 'pincode',  label: 'Pincode *',        cols: 1 },
                      { key: 'country',  label: 'Country *',        cols: 1 },
                    ] as const).map(f => (
                      <div key={f.key} className={f.cols === 2 ? 'col-span-2' : ''}>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{f.label}</label>
                        <input
                          value={addrForm[f.key]}
                          onChange={e => setAddrForm(a => ({ ...a, [f.key]: e.target.value }))}
                          className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-colors ${input}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`px-5 py-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/60'}`}>
                  <button onClick={() => setShowAddrForm(false)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                    Cancel
                  </button>
                  <button
                    onClick={saveAddress}
                    disabled={addrSaving}
                    className="flex items-center gap-1.5 bg-yellow-400 text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50"
                  >
                    {addrSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {editingAddrId ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Saved Addresses <span className="text-slate-500 font-medium normal-case ml-1">({(profile?.address || []).length})</span>
              </h3>
              <button
                onClick={openAddAddr}
                className="flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {(profile?.address || []).length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <MapPin className="w-8 h-8 text-slate-400 opacity-30" />
                <p className="text-xs text-slate-500 uppercase tracking-widest">No addresses saved</p>
                <button onClick={openAddAddr} className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors">+ Add Address</button>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile?.address || []).map(a => (
                  <div key={a._id} className={`p-4 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isDark ? 'bg-white/5' : 'bg-white border border-slate-200'}`}>
                      <MapPin className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {[a.building, a.area].filter(Boolean).join(', ') || a.area}
                      </p>
                      {a.landmark && <p className="text-[10px] text-slate-500 mt-0.5">Near {a.landmark}</p>}
                      <p className="text-[10px] text-slate-500 mt-0.5">{a.city}, {a.state} — {a.pincode}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => openEditAddr(a)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-slate-400 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteAddress(a._id!)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Account ──────────────────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-3.5 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Account Information</h3>
            {!editingAccount && (
              <button
                onClick={() => { setAccountForm({ name: profile?.name || '', phone: profile?.phone || '' }); setAccountError(''); setEditingAccount(true); }}
                className="flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {editingAccount ? (
            <div className="p-5 space-y-4">
              {accountError && (
                <div className="px-3 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20">
                  <p className="text-xs font-bold text-red-400">{accountError}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Full Name *</label>
                  <input
                    value={accountForm.name}
                    onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${input}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Phone (10 digits)</label>
                  <input
                    value={accountForm.phone}
                    onChange={e => setAccountForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="10-digit mobile"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${input}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button onClick={saveAccount} disabled={accountSaving} className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50">
                  {accountSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
                <button onClick={() => setEditingAccount(false)} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {[
                { icon: Mail,     label: 'Email',        value: profile?.email,    sub: false },
                { icon: Phone,    label: 'Phone',        value: profile?.phone || 'Not set', sub: !profile?.phone },
                { icon: BarChart, label: 'Role',         value: profile?.role,     sub: false },
                { icon: Calendar, label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', sub: false },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{label}</p>
                    <p className={`text-sm font-semibold mt-0.5 truncate ${sub ? 'text-slate-400 italic' : isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};