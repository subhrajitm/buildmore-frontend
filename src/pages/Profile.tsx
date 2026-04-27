import React, { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, BarChart, Plus, Pencil, Trash2, Check, LogOut, Mail, Phone, Calendar, TrendingUp, Truck, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi, orderApi, shipmentApi, UserProfile, Order, Address } from '../api';
import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../utils/currency';

interface ProfileProps {
  isDark: boolean;
}

const EMPTY_ADDR = { building: '', area: '', landmark: '', city: '', state: '', pincode: '', country: 'India', alternatephone: '' };

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10', CONFIRMED: 'text-blue-400 bg-blue-400/10', PROCESSING: 'text-blue-400 bg-blue-400/10',
  SHIPPED: 'text-purple-400 bg-purple-400/10', DELIVERED: 'text-green-400 bg-green-400/10', CANCELLED: 'text-red-400 bg-red-400/10',
};

type Tab = 'overview' | 'orders' | 'addresses' | 'account';

export const Profile: React.FC<ProfileProps> = ({ isDark }) => {
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
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row items-start justify-between gap-4 p-6 rounded-2xl ${card}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-black text-black">{initials}</span>
          </div>
          <div>
            <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.name}</h2>
            <p className="text-sm text-slate-500">{profile?.email} · {profile?.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${isDark ? 'bg-white/5 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>{profile?.role}</span>
          <button onClick={logout} className={`p-2.5 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl ${card}`}>
              <TrendingUp className="w-5 h-5 text-yellow-400 mb-2" />
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(totalSpend)}</p>
              <p className="text-[9px] text-slate-500 uppercase mt-1">Total Spent</p>
            </div>
            <div className={`p-5 rounded-2xl ${card}`}>
              <Clock className="w-5 h-5 text-yellow-400 mb-2" />
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{pendingOrders}</p>
              <p className="text-[9px] text-slate-500 uppercase mt-1">Pending</p>
            </div>
            <div className={`p-5 rounded-2xl ${card}`}>
              <Truck className="w-5 h-5 text-yellow-400 mb-2" />
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeShipments}</p>
              <p className="text-[9px] text-slate-500 uppercase mt-1">Shipments</p>
            </div>
            <div className={`p-5 rounded-2xl ${card}`}>
              <Package className="w-5 h-5 text-yellow-400 mb-2" />
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{deliveredOrders}/{totalOrders}</p>
              <p className="text-[9px] text-slate-500 uppercase mt-1">Delivered</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Orders</h3>
              <button onClick={() => setActiveTab('orders')} className="text-yellow-400 text-[9px] font-bold uppercase hover:text-yellow-300">View All →</button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No orders yet</p>
                <Link to="/products" className="text-yellow-400 text-xs mt-2 block hover:underline">Browse products →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 4).map(order => (
                  <div key={order._id} className={`p-4 rounded-xl flex items-center justify-between ${isDark ? 'bg-black/20' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <Package className={`w-4 h-4 ${ORDER_STATUS_COLOR[order.status].split(' ')[1]}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.orderNumber}</p>
                        <p className="text-[9px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(order.totalAmount)}</p>
                      <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${ORDER_STATUS_COLOR[order.status]}`}>{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className={`p-6 rounded-2xl ${card}`}>
          <h3 className={`text-sm font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Order History</h3>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const cancellable = ['PENDING', 'CONFIRMED'].includes(order.status);
                const isCancelling = cancellingId === order._id;
                const reason = cancelReasonMap[order._id] || '';
                return (
                  <div key={order._id} className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.orderNumber}</p>
                        <p className="text-[9px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(order.totalAmount)}</p>
                        <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${ORDER_STATUS_COLOR[order.status]}`}>{order.status}</p>
                      </div>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-slate-500">{item.productName}</span>
                          <span className="text-slate-400">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    {cancellable && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        <input
                          value={reason}
                          onChange={e => setCancelReasonMap(m => ({ ...m, [order._id]: e.target.value }))}
                          placeholder="Reason (optional)"
                          className={`flex-1 px-3 py-2 rounded-lg text-xs ${input}`}
                        />
                        <button
                          onClick={() => cancelOrder(order._id)}
                          disabled={isCancelling}
                          className="px-4 py-2 rounded-lg text-[9px] font-black uppercase bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {isCancelling ? '...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className={`p-6 rounded-2xl ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Saved Addresses</h3>
            <button onClick={openAddAddr} className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {showAddrForm && (
            <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-black/30' : 'bg-slate-50'}`}>
              <h4 className="text-xs font-black uppercase mb-3">{editingAddrId ? 'Edit' : 'New'} Address</h4>
              {addrError && <p className="text-xs text-red-400 mb-3">{addrError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <input value={addrForm.area} onChange={e => setAddrForm(a => ({ ...a, area: e.target.value }))} placeholder="Area *" className={`col-span-2 px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.city} onChange={e => setAddrForm(a => ({ ...a, city: e.target.value }))} placeholder="City *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.state} onChange={e => setAddrForm(a => ({ ...a, state: e.target.value }))} placeholder="State *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.pincode} onChange={e => setAddrForm(a => ({ ...a, pincode: e.target.value }))} placeholder="Pincode *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.country} onChange={e => setAddrForm(a => ({ ...a, country: e.target.value }))} placeholder="Country *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={saveAddress} disabled={addrSaving} className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase">
                  {addrSaving ? '...' : <><Check className="w-3 h-3" /> Save</>}
                </button>
                <button onClick={() => setShowAddrForm(false)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
              </div>
            </div>
          )}
          {(profile?.address || []).map(a => (
            <div key={a._id} className={`p-4 rounded-xl flex justify-between mb-2 ${isDark ? 'bg-black/20' : 'bg-slate-50'}`}>
              <div className="text-sm">
                <p className={isDark ? 'text-white' : 'text-slate-900'}>{[a.building, a.area, a.landmark].filter(Boolean).join(', ')}</p>
                <p className="text-[9px] text-slate-500">{a.city}, {a.state} — {a.pincode}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditAddr(a)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => deleteAddress(a._id!)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {(profile?.address || []).length === 0 && !showAddrForm && (
            <p className="text-center py-8 text-slate-500">No addresses saved</p>
          )}
        </div>
      )}

      {activeTab === 'account' && (
        <div className={`p-6 rounded-2xl ${card}`}>
          <h3 className={`text-sm font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">Email</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">Phone</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <BarChart className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">Role</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">Member Since</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};