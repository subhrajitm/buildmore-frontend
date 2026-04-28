import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { shipmentApi, Shipment } from '../api';
import { ChevronDown, ChevronUp, Loader2, Plus, X, Send, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface AdminShipmentsProps {
  isDark: boolean;
}

const SHIPMENT_STATUSES: Shipment['status'][] = ['PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];

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
  const [currentPage, setCurrentPage] = useState(1);

  const [createForm, setCreateForm] = useState({ orderId: '', userId: '', carrier: '', origin: '', destination: '', estimatedDelivery: '', freightClass: '', weight: '' });
  const [eventForms, setEventForms] = useState<Record<string, { status: string; location: string; description: string }>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`;

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

  const filtered = shipments.filter(s =>
    s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.carrier?.toLowerCase().includes(search.toLowerCase()) ||
    s.order?.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedShipments = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest z-50">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search shipments..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-52 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{filtered.length} Shipments</p>
        <button onClick={() => setShowCreate(v => !v)} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-2">
          {showCreate ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Create Shipment</>}
        </button>
      </div>

      {showCreate && (
        <div className={`p-6 rounded-2xl border space-y-4 ${cardBg}`}>
          <h3 className={`text-sm font-black uppercase tracking-widest ${textClass}`}>New Shipment</h3>
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
          <button onClick={handleCreate} disabled={creating} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-2 disabled:opacity-50">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Create
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">No shipments found</p>
          </div>
        )}
        {paginatedShipments.map(ship => {
          const isExpanded = expandedId === ship._id;
          const ev = eventForms[ship._id] ?? { status: '', location: '', description: '' };
          return (
            <div key={ship._id} className={`rounded-2xl border transition-all ${cardBg}`}>
              <div className="p-5 flex items-center gap-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : ship._id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${mutedClass}`}>{ship.trackingNumber}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">{ship.status}</span>
                  </div>
                  <p className={`text-sm font-black uppercase truncate ${textClass}`}>{ship.carrier || 'No carrier'}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                    {[ship.origin, ship.destination].filter(Boolean).join(' → ')}
                    {ship.order && ` · Order: ${ship.order.orderNumber}`}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
              </div>

              {isExpanded && (
                <div className={`border-t px-5 pb-5 pt-4 space-y-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 self-center mr-1">Status:</span>
                    {SHIPMENT_STATUSES.map(s => (
                      <button key={s} onClick={() => handleStatusUpdate(ship._id, s)} disabled={updatingId === ship._id || ship.status === s}
                        className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all disabled:opacity-50 ${ship.status === s ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        {s === 'OUT_FOR_DELIVERY' ? 'Out for Del.' : s === 'PICKED_UP' ? 'Picked Up' : s === 'IN_TRANSIT' ? 'In Transit' : s}
                      </button>
                    ))}
                  </div>

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

                  {ship.events.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Event History ({ship.events.length})</p>
                      {[...ship.events].reverse().map((ev, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                          <div>
                            <p className={`text-[10px] font-black uppercase ${textClass}`}>{ev.status}</p>
                            {ev.location && <p className="text-[9px] text-slate-500 font-bold">{ev.location}</p>}
                            <p className="text-[9px] text-slate-600 font-bold">{new Date(ev.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className={`p-2 rounded-lg disabled:opacity-30 ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Page {safePage} of {totalPages}
          </span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className={`p-2 rounded-lg disabled:opacity-30 ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};