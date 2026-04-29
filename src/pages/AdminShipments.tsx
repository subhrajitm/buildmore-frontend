import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { shipmentApi, Shipment } from '../api';
import { 
  ChevronDown, ChevronUp, Loader2, Plus, X, Send, Search, ChevronLeft, ChevronRight, 
  Package, Truck, Clock, CheckCircle, AlertCircle, MapPin, User, Phone, Mail, Calendar,
  RefreshCw, Eye, Filter, Box, Weight, Route, ArrowRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface AdminShipmentsProps {
  isDark: boolean;
}

const SHIPMENT_STATUSES: Shipment['status'][] = ['PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];
const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  PREPARING: { label: 'Preparing', icon: Package, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  PICKED_UP: { label: 'Picked Up', icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  IN_TRANSIT: { label: 'In Transit', icon: Truck, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: Route, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  FAILED: { label: 'Failed', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export const AdminShipments: React.FC<AdminShipmentsProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [createForm, setCreateForm] = useState({ orderId: '', userId: '', carrier: '', origin: '', destination: '', estimatedDelivery: '', freightClass: '', weight: '' });
  const [eventForms, setEventForms] = useState<Record<string, { status: string; location: string; description: string }>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const cardHover = isDark ? 'hover:border-yellow-400/30' : 'hover:border-yellow-400';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'}`;

  const load = () => {
    if (!adminToken) return;
    setLoading(true);
    shipmentApi.adminGetAll(adminToken).then(r => setShipments(r.shipments || [])).catch(() => showToast('Failed to load shipments')).finally(() => setLoading(false));
  };
  useEffect(load, [adminToken]);

  const handleCreate = async () => {
    if (!adminToken) return;
    if (!createForm.orderId.trim() && !createForm.userId.trim()) { showToast('Order ID or User ID is required'); return; }
    setCreating(true);
    try {
      await shipmentApi.adminCreate({
        orderId: createForm.orderId.trim() || undefined,
        userId: createForm.userId.trim() || '',
        carrier: createForm.carrier || undefined,
        origin: createForm.origin || undefined,
        destination: createForm.destination || undefined,
        estimatedDelivery: createForm.estimatedDelivery || undefined,
        freightClass: createForm.freightClass || undefined,
        weight: createForm.weight ? Number(createForm.weight) : undefined,
      }, adminToken);
      setShowCreate(false);
      setCreateForm({ orderId: '', userId: '', carrier: '', origin: '', destination: '', estimatedDelivery: '', freightClass: '', weight: '' });
      showToast('Shipment created');
      load();
    } catch (err: any) {
      showToast('Create failed: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Shipment['status']) => {
    if (!adminToken) return;
    setUpdatingId(id);
    try {
      const res = await shipmentApi.adminUpdate(id, { status }, adminToken);
      setShipments(prev => prev.map(s => s._id === id ? res.shipment : s));
      showToast(`Status → ${status}`);
    } catch (err: any) {
      showToast('Update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddEvent = async (id: string) => {
    if (!adminToken) return;
    const ev = eventForms[id];
    if (!ev?.status.trim()) { showToast('Event status is required'); return; }
    setUpdatingId(id);
    try {
      const res = await shipmentApi.adminUpdate(id, {
        status: ev.status as Shipment['status'] | undefined,
        location: ev.location || undefined,
        description: ev.description || undefined,
      }, adminToken);
      setShipments(prev => prev.map(s => s._id === id ? res.shipment : s));
      setEventForms(f => ({ ...f, [id]: { status: '', location: '', description: '' } }));
      showToast('Event added');
    } catch (err: any) {
      showToast('Failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = shipments.filter(s => {
    const matchSearch = s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.carrier?.toLowerCase().includes(search.toLowerCase()) ||
      s.order?.orderNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: shipments.length,
    preparing: shipments.filter(s => s.status === 'PREPARING').length,
    inTransit: shipments.filter(s => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'DELIVERED').length,
    failed: shipments.filter(s => s.status === 'FAILED').length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedShipments = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-400/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.total}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Total Shipments</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.preparing}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Preparing</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.inTransit}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>In Transit</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.delivered}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Delivered</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.failed}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Failed</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className={`rounded-2xl border p-4 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by tracking number, carrier..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', ...SHIPMENT_STATUSES].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  statusFilter === s 
                    ? 'bg-yellow-400 text-black' 
                    : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                {s === 'OUT_FOR_DELIVERY' ? 'Out for Del.' : s === 'PICKED_UP' ? 'Picked Up' : s === 'IN_TRANSIT' ? 'In Transit' : s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Shipment
        </button>
      </div>

      {/* Create Popup */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className={`relative w-full max-w-2xl my-8 rounded-3xl border shadow-2xl overflow-hidden ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`px-8 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div>
                <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Shipment</h2>
                <p className={`text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5`}>Add new shipment record</p>
              </div>
              <button onClick={() => setShowCreate(false)} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'orderId', label: 'Order ID', placeholder: 'MongoDB _id of order (auto-resolves user)' },
                  { key: 'userId', label: 'User ID (fallback)', placeholder: 'Required if no Order ID' },
                  { key: 'carrier', label: 'Carrier', placeholder: 'BuildMore Freight' },
                  { key: 'origin', label: 'Origin', placeholder: 'Mumbai WH' },
                  { key: 'destination', label: 'Destination', placeholder: 'Delhi DC' },
                  { key: 'estimatedDelivery', label: 'ETA', placeholder: '', type: 'date' },
                  { key: 'freightClass', label: 'Freight Class', placeholder: 'LTL Class 70' },
                  { key: 'weight', label: 'Weight (kg)', placeholder: '0', type: 'number' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={(createForm as any)[f.key]}
                      onChange={e => setCreateForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className={input}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={`px-8 py-5 border-t flex items-center justify-end gap-4 ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <button onClick={() => setShowCreate(false)} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-2 disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Create Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className={`text-sm font-bold ${mutedClass}`}>
          Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} shipments
        </p>
        <button 
          onClick={load}
          className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <Truck className="w-16 h-16 text-slate-300" />
          <p className={`text-sm font-black uppercase tracking-widest ${mutedClass}`}>No shipments found</p>
          <p className={`text-xs ${mutedClass}`}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Shipments List */}
      {paginatedShipments.map(ship => {
        const isExpanded = expandedId === ship._id;
        const config = STATUS_CONFIG[ship.status] || STATUS_CONFIG['PREPARING'];
        const StatusIcon = config.icon;
        const ev = eventForms[ship._id] ?? { status: '', location: '', description: '' };
        
        return (
          <div key={ship._id} className={`rounded-2xl border transition-all ${cardBg} ${cardHover}`}>
            {/* Main Row */}
            <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : ship._id)}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-black ${textClass}`}>{ship.trackingNumber || 'Pending'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${textClass}`}>{ship.carrier || 'No carrier'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {[ship.origin, ship.destination].filter(Boolean).join(' → ')}
                    </span>
                    {ship.order && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> Order: {ship.order.orderNumber}
                      </span>
                    )}
                    {ship.estimatedDelivery && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> ETA: {new Date(ship.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className={`border-t px-5 pb-5 pt-4 space-y-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                {/* Shipment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Shipment Details</p>
                    <div className="space-y-2">
                      {ship.freightClass && (
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-slate-500" />
                          <span className={`text-xs font-bold ${textClass}`}>{ship.freightClass}</span>
                        </div>
                      )}
                      {ship.weight && (
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-slate-500" />
                          <span className={`text-xs font-bold ${textClass}`}>{ship.weight} kg</span>
                        </div>
                      )}
                      {ship.estimatedDelivery && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className={`text-xs font-bold ${textClass}`}>
                            ETA: {new Date(ship.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {ship.order?.user && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Customer</p>
                      <div className="space-y-2">
                        {ship.order.user.name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{ship.order.user.name}</span>
                          </div>
                        )}
                        {ship.order.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{ship.order.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Update Status */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {SHIPMENT_STATUSES.map(s => {
                      const sc = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(ship._id, s)}
                          disabled={updatingId === ship._id || ship.status === s}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            ship.status === s 
                              ? 'bg-yellow-400 text-black' 
                              : `${sc.bg} ${sc.color} hover:opacity-80`
                          }`}
                        >
                          {updatingId === ship._id && ship.status !== s ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <sc.icon className="w-3 h-3" />
                          )}
                          {s === 'OUT_FOR_DELIVERY' ? 'Out for Del.' : s === 'PICKED_UP' ? 'Picked Up' : s === 'IN_TRANSIT' ? 'In Transit' : s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Tracking Event */}
                <div className={`p-4 rounded-xl space-y-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Add Tracking Event</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={ev.status} onChange={e => setEventForms(f => ({ ...f, [ship._id]: { ...ev, status: e.target.value } }))} placeholder="Status label *" className={input} />
                    <input value={ev.location} onChange={e => setEventForms(f => ({ ...f, [ship._id]: { ...ev, location: e.target.value } }))} placeholder="Location" className={input} />
                    <input value={ev.description} onChange={e => setEventForms(f => ({ ...f, [ship._id]: { ...ev, description: e.target.value } }))} placeholder="Description" className={input} />
                  </div>
                  <button onClick={() => handleAddEvent(ship._id)} disabled={updatingId === ship._id || !ev.status.trim()} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-1.5 disabled:opacity-50">
                    {updatingId === ship._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add Event
                  </button>
                </div>

                {/* Event History */}
                {ship.events.length > 0 && (
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Event History ({ship.events.length})</p>
                    <div className="space-y-2">
                      {[...ship.events].reverse().map((ev, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                          <div>
                            <p className={`text-[10px] font-black uppercase ${textClass}`}>{ev.status}</p>
                            {ev.location && <p className="text-[9px] text-slate-500 font-bold">{ev.location}</p>}
                            {ev.description && <p className="text-[9px] text-slate-400">{ev.description}</p>}
                            <p className="text-[9px] text-slate-600 font-bold">{new Date(ev.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-xs font-bold ${mutedClass}`}>
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
              .reduce<(number | '...')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className={`px-2 py-2 text-xs font-bold ${mutedClass}`}>…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n as number)}
                    className={`min-w-[36px] h-9 rounded-lg text-xs font-black transition-colors ${
                      safePage === n
                        ? 'bg-yellow-400 text-black'
                        : isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};