import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, Clock, AlertCircle, MapPin, Search, ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shipmentApi, Shipment } from '../api';

interface LogisticsProps {
  isDark: boolean;
}

const STATUS_MAP: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string; progress: number }> = {
  PREPARING:        { label: 'Preparing',        icon: Clock,        color: 'text-slate-400',  bg: 'bg-slate-400/10 border-slate-400/20',  progress: 5   },
  PICKED_UP:        { label: 'Picked Up',         icon: Package,      color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', progress: 25  },
  IN_TRANSIT:       { label: 'In Transit',        icon: Truck,        color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',    progress: 60  },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', progress: 85  },
  DELIVERED:        { label: 'Delivered',         icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',  progress: 100 },
  FAILED:           { label: 'Failed',            icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',      progress: 40  },
};

const STATUS_OPTIONS = ['All', 'PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];

const STATUS_LABELS: Record<string, string> = {
  All: 'All', PREPARING: 'Preparing', PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', FAILED: 'Failed',
};

export const Logistics: React.FC<LogisticsProps> = ({ isDark }) => {
  const { token } = useAuth();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);

  // Track shipment
  const [trackInput, setTrackInput] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackedShipment, setTrackedShipment] = useState<Shipment | null>(null);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    if (!token) return;
    shipmentApi.getAll(token)
      .then(res => setShipments(res.shipments))
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleTrack = async () => {
    if (!token || !trackInput.trim()) return;
    setTracking(true);
    setTrackError('');
    setTrackedShipment(null);
    try {
      const res = await shipmentApi.track(trackInput.trim(), token);
      setTrackedShipment(res.shipment);
    } catch (err: any) {
      setTrackError(err.message || 'Shipment not found');
    } finally {
      setTracking(false);
    }
  };

  const filtered = shipments.filter(s => {
    const matchSearch =
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.carrier || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.origin || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.destination || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inTransit = shipments.filter(s => ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;
  const failed = shipments.filter(s => s.status === 'FAILED').length;

  const selectedShipment = shipments.find(s => s._id === selected) ?? trackedShipment;

  const inp = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 transition-all duration-500">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Freight Intelligence</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Logistics</h1>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{fetchError}</p>
        </div>
      )}

      {/* Track shipment */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Track a Shipment</p>
        <div className="flex items-center gap-3">
          <input
            value={trackInput}
            onChange={e => setTrackInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            placeholder="Enter tracking number or order number..."
            className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${inp}`}
          />
          <button
            onClick={handleTrack}
            disabled={tracking || !trackInput.trim()}
            className="bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Track
          </button>
        </div>
        {trackError && <p className="text-xs text-red-400 font-bold mt-2">{trackError}</p>}
        {trackedShipment && (
          <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Tracked Result</p>
              <button onClick={() => setTrackedShipment(null)} className="text-[9px] font-black uppercase text-slate-500 hover:text-slate-300">Dismiss</button>
            </div>
            <ShipmentDetail shipment={trackedShipment} isDark={isDark} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Shipments', value: inTransit, icon: Truck, color: 'text-blue-400' },
          { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Failed / Issues', value: failed, icon: AlertCircle, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-2xl border flex items-center gap-5 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shipments..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-56 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment list */}
        <div className={`space-y-3 ${selected ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {filtered.length === 0 && (
            <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              <Package className="w-10 h-10 opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-widest">No shipments found</p>
            </div>
          )}
          {filtered.map(shipment => {
            const sm = STATUS_MAP[shipment.status] ?? STATUS_MAP['PREPARING'];
            const isSelected = selected === shipment._id;
            const progress = sm.progress;
            return (
              <div
                key={shipment._id}
                onClick={() => setSelected(isSelected ? null : shipment._id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-yellow-400/40 bg-yellow-400/5'
                    : isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{shipment.trackingNumber}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${sm.bg} ${sm.color}`}>
                        <sm.icon className="w-2.5 h-2.5" />
                        {sm.label}
                      </span>
                    </div>
                    <h3 className={`text-sm font-black uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {shipment.carrier || 'BuildMore Freight'}
                    </h3>
                    {shipment.order && (
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        Order: {shipment.order.orderNumber}
                      </p>
                    )}
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90 text-yellow-400' : 'text-slate-500'}`} />
                </div>

                <div className="mb-3">
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${shipment.status === 'DELIVERED' ? 'bg-green-400' : shipment.status === 'FAILED' ? 'bg-red-400' : 'bg-yellow-400'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  {shipment.origin && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{shipment.origin}</span>}
                  {shipment.origin && shipment.destination && <ArrowRight className="w-2.5 h-2.5" />}
                  {shipment.destination && <span>{shipment.destination}</span>}
                  {shipment.estimatedDelivery && (
                    <span className="ml-auto">ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && selectedShipment && (
          <div className={`p-6 rounded-2xl border space-y-6 sticky top-24 h-fit transition-all duration-300 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
            <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Shipment Detail</h3>
            <ShipmentDetail shipment={selectedShipment} isDark={isDark} />
          </div>
        )}
      </div>
    </div>
  );
};

function ShipmentDetail({ shipment, isDark }: { shipment: Shipment; isDark: boolean }) {
  const [showEvents, setShowEvents] = useState(false);
  const rows = [
    { label: 'Tracking #',    value: shipment.trackingNumber },
    { label: 'Carrier',       value: shipment.carrier },
    { label: 'Status',        value: STATUS_MAP[shipment.status]?.label ?? shipment.status },
    { label: 'Origin',        value: shipment.origin },
    { label: 'Destination',   value: shipment.destination },
    { label: 'Freight Class', value: shipment.freightClass },
    { label: 'Weight',        value: shipment.weight != null ? `${shipment.weight} kg` : undefined },
    { label: 'ETA',           value: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : undefined },
    { label: 'Delivered At',  value: shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleDateString() : undefined },
    { label: 'Order',         value: shipment.order?.orderNumber },
  ].filter(r => r.value);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rows.map((item, i) => (
          <div key={i} className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Events timeline */}
      {shipment.events && shipment.events.length > 0 && (
        <div>
          <button
            onClick={() => setShowEvents(v => !v)}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-3"
          >
            {showEvents ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Tracking Events ({shipment.events.length})
          </button>
          {showEvents && (
            <div className="space-y-3">
              {[...shipment.events].reverse().map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                  <div>
                    <p className={`text-[10px] font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{ev.status}</p>
                    {ev.location && <p className="text-[9px] text-slate-500 font-bold">{ev.location}</p>}
                    {ev.description && <p className="text-[9px] text-slate-500 italic">{ev.description}</p>}
                    <p className="text-[9px] text-slate-600 font-bold mt-0.5">{new Date(ev.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
