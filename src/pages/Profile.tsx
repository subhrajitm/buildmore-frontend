import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, BarChart, ChevronRight, Plus, Pencil, Trash2, Check, X, Truck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi, orderApi, shipmentApi, UserProfile, Order, Shipment, Address } from '../api';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/currency';

interface ProfileProps {
  isDark: boolean;
}

const EMPTY_ADDR = { building: '', area: '', landmark: '', city: '', state: '', pincode: '', country: 'India', alternatephone: '' };

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-400', CONFIRMED: 'text-blue-400', PROCESSING: 'text-blue-400',
  SHIPPED: 'text-purple-400', DELIVERED: 'text-green-400', CANCELLED: 'text-red-400',
};

export const Profile: React.FC<ProfileProps> = ({ isDark }) => {
  const { token, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeSection, setActiveSection] = useState<'overview' | 'orders' | 'addresses'>('overview');

  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ ...EMPTY_ADDR });
  const [addrError, setAddrError] = useState('');
  const [addrSaving, setAddrSaving] = useState(false);

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReasonMap, setCancelReasonMap] = useState<Record<string, string>>({});

  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100';
  const input = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  useEffect(() => {
    if (!token) return;
    Promise.all([
      userApi.getProfile(token),
      orderApi.getAll(token),
      shipmentApi.getAll(token),
    ]).then(([p, o, s]) => {
      setProfile(p.user);
      setProfileForm({ name: p.user.name, phone: p.user.phone });
      setOrders(o.orders);
      setShipments(s.shipments);
    }).catch(() => setLoadError('Failed to load')).finally(() => setLoading(false));
  }, [token]);

  const saveProfile = async () => {
    if (!token) return;
    setProfileSaving(true);
    setProfileError('');
    try {
      const res = await userApi.updateProfile(profileForm, token);
      setProfile(res.user);
      if (res.user.name) updateUser({ name: res.user.name });
      setEditProfile(false);
    } catch (e: any) {
      setProfileError(e.message || 'Failed to save');
    } finally { setProfileSaving(false); }
  };

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

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  const NAV = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ] as const;

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (loadError) {
    return <div className="flex items-center justify-center py-24 text-red-400 text-sm">{loadError}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className={`flex items-center justify-between p-4 rounded-xl ${card}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
            <span className="text-lg font-black text-black">{initials}</span>
          </div>
          <div>
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.name}</h2>
            <p className="text-xs text-slate-500">{profile?.email} · {profile?.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${isDark ? 'bg-white/5 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>{profile?.role}</span>
          <button onClick={logout} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-white/5 w-fit">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
              activeSection === item.id ? 'bg-yellow-400 text-black' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" /> {item.label}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${card}`}>
            <BarChart className="w-4 h-4 text-yellow-400 mb-2" />
            <p className="text-[9px] text-slate-500 uppercase">Total Spend</p>
            <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(totalSpend)}</p>
          </div>
          <div className={`p-4 rounded-xl ${card}`}>
            <Package className="w-4 h-4 text-yellow-400 mb-2" />
            <p className="text-[9px] text-slate-500 uppercase">Pending</p>
            <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{pendingOrders}</p>
          </div>
          <div className={`p-4 rounded-xl ${card}`}>
            <Truck className="w-4 h-4 text-yellow-400 mb-2" />
            <p className="text-[9px] text-slate-500 uppercase">Shipments</p>
            <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{shipments.filter(s => s.status !== 'DELIVERED').length}</p>
          </div>
        </div>
      )}

      {activeSection === 'overview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Orders</h3>
            <Link to="/profile" onClick={() => setActiveSection('orders')} className="text-yellow-400 text-[9px] font-black uppercase">View All →</Link>
          </div>
          {orders.slice(0, 3).map(order => (
            <div key={order._id} className={`p-4 rounded-xl flex items-center justify-between ${card}`}>
              <div>
                <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.orderNumber}</p>
                <p className="text-[9px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(order.totalAmount)}</p>
                <p className={`text-[9px] font-black uppercase ${ORDER_STATUS_COLOR[order.status]}`}>{order.status}</p>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-slate-500 text-sm py-8">No orders yet</p>}
        </div>
      )}

      {activeSection === 'orders' && (
        <div className="space-y-3">
          <h3 className={`text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Order History</h3>
          {orders.map(order => {
            const cancellable = ['PENDING', 'CONFIRMED'].includes(order.status);
            const isCancelling = cancellingId === order._id;
            const reason = cancelReasonMap[order._id] || '';
            return (
              <div key={order._id} className={`p-4 rounded-xl ${card}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.orderNumber}</p>
                    <p className="text-[9px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(order.totalAmount)}</p>
                    <p className={`text-[9px] font-black uppercase ${ORDER_STATUS_COLOR[order.status]}`}>{order.status}</p>
                  </div>
                </div>
                <div className="space-y-1 border-t border-slate-100 dark:border-white/5 pt-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span className="text-slate-500 truncate">{item.productName}</span>
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
                      className="px-3 py-2 rounded-lg text-[9px] font-black uppercase bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {isCancelling ? '...' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {orders.length === 0 && <div className="text-center py-12 text-slate-500">No orders yet</div>}
        </div>
      )}

      {activeSection === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Addresses</h3>
            <button onClick={openAddAddr} className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {showAddrForm && (
            <div className={`p-4 rounded-xl ${card}`}>
              <h4 className="text-xs font-black uppercase mb-4">{editingAddrId ? 'Edit' : 'New'} Address</h4>
              {addrError && <p className="text-xs text-red-400 mb-3">{addrError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <input value={addrForm.area} onChange={e => setAddrForm(a => ({ ...a, area: e.target.value }))} placeholder="Area *" className={`col-span-2 px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.city} onChange={e => setAddrForm(a => ({ ...a, city: e.target.value }))} placeholder="City *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.state} onChange={e => setAddrForm(a => ({ ...a, state: e.target.value }))} placeholder="State *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.pincode} onChange={e => setAddrForm(a => ({ ...a, pincode: e.target.value }))} placeholder="Pincode *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
                <input value={addrForm.country} onChange={e => setAddrForm(a => ({ ...a, country: e.target.value }))} placeholder="Country *" className={`px-3 py-2 rounded-lg text-sm ${input}`} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveAddress} disabled={addrSaving} className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase disabled:opacity-50">
                  {addrSaving ? '...' : <><Check className="w-3 h-3" /> Save</>}
                </button>
                <button onClick={() => setShowAddrForm(false)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
              </div>
            </div>
          )}

          {(profile?.address || []).map(a => (
            <div key={a._id} className={`p-4 rounded-xl flex justify-between ${card}`}>
              <div className="text-xs">
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
          {(profile?.address || []).length === 0 && !showAddrForm && <div className="text-center py-8 text-slate-500 text-sm">No addresses saved</div>}
        </div>
      )}
    </div>
  );
};