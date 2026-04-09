import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Award, Package, Clock, BarChart, ChevronRight, Plus, Pencil, Trash2, Check, X, MapPin, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi, orderApi, shipmentApi, UserProfile, Order, Shipment, Address } from '../api';
import { Link } from 'react-router-dom';

interface ProfileProps {
  isDark: boolean;
}

const EMPTY_ADDR = { building: '', area: '', landmark: '', city: '', state: '', pincode: '', country: 'India', alternatephone: '' };

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-400', CONFIRMED: 'text-blue-400', PROCESSING: 'text-blue-400',
  SHIPPED: 'text-purple-400', DELIVERED: 'text-green-400', CANCELLED: 'text-red-400',
};

const SHIP_STATUS_COLOR: Record<string, string> = {
  PREPARING: 'text-slate-400', PICKED_UP: 'text-blue-400', IN_TRANSIT: 'text-yellow-400',
  OUT_FOR_DELIVERY: 'text-orange-400', DELIVERED: 'text-green-400', FAILED: 'text-red-400',
};

export const Profile: React.FC<ProfileProps> = ({ isDark }) => {
  const { token, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeSection, setActiveSection] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');

  // Address form state
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ ...EMPTY_ADDR });
  const [addrError, setAddrError] = useState('');
  const [addrSaving, setAddrSaving] = useState(false);

  // Profile edit state
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm';
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
    }).catch(() => setLoadError('Failed to load profile data')).finally(() => setLoading(false));
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
      setProfileError(e.message || 'Failed to save profile');
    } finally { setProfileSaving(false); }
  };

  const openAddAddr = () => { setAddrForm({ ...EMPTY_ADDR }); setEditingAddrId(null); setAddrError(''); setShowAddrForm(true); };
  const openEditAddr = (a: Address) => { setAddrForm({ building: a.building || '', area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pincode: a.pincode, country: a.country, alternatephone: a.alternatephone || '' }); setEditingAddrId(a._id!); setAddrError(''); setShowAddrForm(true); };

  const saveAddress = async () => {
    if (!addrForm.area || !addrForm.city || !addrForm.state || !addrForm.pincode || !addrForm.country) {
      setAddrError('Area, city, state, pincode and country are required.'); return;
    }
    if (!token) return;
    setAddrSaving(true);
    try {
      const res = editingAddrId
        ? await userApi.updateAddress(editingAddrId, addrForm, token)
        : await userApi.addAddress(addrForm, token);
      setProfile(p => p ? { ...p, address: res.address } : p);
      setShowAddrForm(false);
    } catch (e: any) { setAddrError(e.message || 'Failed to save address'); }
    finally { setAddrSaving(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!token || !window.confirm('Delete this address?')) return;
    try {
      const res = await userApi.deleteAddress(id, token);
      setProfile(p => p ? { ...p, address: res.address } : p);
    } catch { /* deletion failed — address list unchanged */ }
  };

  const totalSpend = orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length;
  const activeShipments = shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'FAILED').length;

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  const NAV = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-48">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-400">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1.5px] bg-yellow-400"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Enterprise Profile</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>My Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-900 border-white/5 text-yellow-400' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>
            {profile?.role || 'USER'}
          </div>
          <button onClick={logout} className={`px-4 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-colors ${isDark ? 'bg-zinc-900 border-white/5 text-slate-400 hover:text-red-400' : 'bg-white border-slate-200 text-slate-500 hover:text-red-500'}`}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-2xl border text-center space-y-4 ${card}`}>
            <div className="w-20 h-20 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-3xl font-black text-black">{initials}</span>
            </div>
            <div>
              <h3 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">{profile?.email}</p>
              <p className="text-[10px] text-slate-500 font-bold">{profile?.phone}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeSection === item.id ? 'bg-yellow-400 text-black' : isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-10">

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Spend', value: `$${(totalSpend / 1000).toFixed(1)}K`, icon: BarChart },
                  { label: 'Pending Orders', value: pendingOrders, icon: Package },
                  { label: 'Active Shipments', value: activeShipments, icon: Truck },
                ].map(stat => (
                  <div key={stat.label} className={`p-6 rounded-2xl border ${card}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <stat.icon className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</h4>
                    <p className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent shipments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Active Logistics</h2>
                  <Link to="/logistics" className="text-yellow-400 text-[9px] font-black uppercase tracking-widest hover:text-yellow-300">View All →</Link>
                </div>
                {shipments.filter(s => s.status !== 'DELIVERED').slice(0, 3).length === 0 ? (
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No active shipments</p>
                ) : shipments.filter(s => s.status !== 'DELIVERED').slice(0, 3).map(s => (
                  <div key={s._id} className={`p-5 rounded-2xl border flex items-center justify-between ${card}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <Truck className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.trackingNumber}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${SHIP_STATUS_COLOR[s.status]}`}>{s.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{s.origin} → {s.destination}</p>
                      {s.estimatedDelivery && <p className="text-[9px] text-yellow-400 font-bold mt-0.5">ETA: {new Date(s.estimatedDelivery).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── ORDERS ── */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              <h2 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Order History</h2>
              {orders.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                  <Package className="w-10 h-10 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No orders yet</p>
                  <Link to="/products" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:text-yellow-300">Browse Products →</Link>
                </div>
              ) : orders.map(order => (
                <div key={order._id} className={`p-6 rounded-2xl border ${card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${order.totalAmount.toFixed(2)}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${ORDER_STATUS_COLOR[order.status] || 'text-slate-400'}`}>{order.status}</p>
                    </div>
                  </div>
                  <div className={`space-y-1 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-xs">{item.productName}</span>
                        <span className="text-[10px] font-black text-slate-400">×{item.quantity} · ${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ADDRESSES ── */}
          {activeSection === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Saved Addresses</h2>
                <button onClick={openAddAddr} className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              {showAddrForm && (
                <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-zinc-900 border-yellow-400/20' : 'bg-white border-yellow-400/30 shadow-xl'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingAddrId ? 'Edit Address' : 'New Address'}</h3>
                  {addrError && <p className="text-xs text-red-400 font-bold bg-red-400/10 px-3 py-2 rounded-lg">{addrError}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([
                      { key: 'building', label: 'Building', ph: '12A, Tower Block' },
                      { key: 'area', label: 'Area *', ph: 'MG Road' },
                      { key: 'landmark', label: 'Landmark', ph: 'Near Central Park' },
                      { key: 'city', label: 'City *', ph: 'Mumbai' },
                      { key: 'state', label: 'State *', ph: 'Maharashtra' },
                      { key: 'pincode', label: 'Pincode *', ph: '400001' },
                      { key: 'country', label: 'Country *', ph: 'India' },
                      { key: 'alternatephone', label: 'Alt. Phone', ph: '+91 98765 43210' },
                    ] as const).map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{f.label}</label>
                        <input value={(addrForm as any)[f.key]} onChange={e => setAddrForm(a => ({ ...a, [f.key]: e.target.value }))} placeholder={f.ph} className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveAddress} disabled={addrSaving} className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50">
                      {addrSaving ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                    </button>
                    <button onClick={() => setShowAddrForm(false)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}

              {(profile?.address || []).length === 0 && !showAddrForm ? (
                <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                  <MapPin className="w-10 h-10 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No saved addresses</p>
                </div>
              ) : (profile?.address || []).map(a => (
                <div key={a._id} className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${card}`}>
                  <div className="space-y-1">
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{[a.building, a.area, a.landmark].filter(Boolean).join(', ')}</p>
                    <p className="text-[10px] font-bold text-slate-500">{a.city}, {a.state} — {a.pincode}</p>
                    <p className="text-[10px] font-bold text-slate-500">{a.country}{a.alternatephone ? ` · ${a.alternatephone}` : ''}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditAddr(a)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-400 hover:text-yellow-500'} transition-colors`}><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteAddress(a._id!)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'} transition-colors`}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Account Settings</h2>
              <div className={`p-6 rounded-2xl border space-y-5 ${card}`}>
                {profileError && <p className="text-xs text-red-400 font-bold bg-red-400/10 px-3 py-2 rounded-lg">{profileError}</p>}
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Personal Info</h3>
                  {!editProfile
                    ? <button onClick={() => setEditProfile(true)} className="flex items-center gap-2 text-yellow-400 text-[9px] font-black uppercase tracking-widest hover:text-yellow-300"><Pencil className="w-3 h-3" /> Edit</button>
                    : <div className="flex gap-2">
                      <button onClick={saveProfile} disabled={profileSaving} className="flex items-center gap-1.5 bg-yellow-400 text-black px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50">
                        {profileSaving ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3" />} Save
                      </button>
                      <button onClick={() => setEditProfile(false)} className={`p-1.5 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><X className="w-3 h-3" /></button>
                    </div>
                  }
                </div>
                {editProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{ key: 'name', label: 'Full Name' }, { key: 'phone', label: 'Phone' }].map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{f.label}</label>
                        <input value={(profileForm as any)[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none ${input}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{ label: 'Name', value: profile?.name }, { label: 'Email', value: profile?.email }, { label: 'Phone', value: profile?.phone }, { label: 'Role', value: profile?.role }, { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—' }].map(f => (
                      <div key={f.label}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{f.label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
