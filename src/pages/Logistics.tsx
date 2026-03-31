import React, { useState } from 'react';
import { Truck, Package, CheckCircle, Clock, AlertCircle, MapPin, Search, ArrowRight } from 'lucide-react';

interface LogisticsProps {
  isDark: boolean;
}

const SHIPMENTS = [
  {
    id: 'SHP-2025-0814',
    rfq: 'RFQ-2025-0038',
    description: 'Electrical Systems — GridMaster Load Centers (×2)',
    origin: 'London SE1',
    destination: 'Birmingham B1',
    carrier: 'BuildMore Freight',
    status: 'in_transit',
    eta: '2025-04-03',
    progress: 65,
    weight: '84 lbs',
    class: 'LTL Class 70',
    tracking: 'BMF-8841209',
  },
  {
    id: 'SHP-2025-0802',
    rfq: 'RFQ-2025-0035',
    description: 'Industrial Tool Refresh — Site A (×6 items)',
    origin: 'Manchester NW1',
    destination: 'London SE1',
    carrier: 'FastFreight UK',
    status: 'delivered',
    eta: '2025-03-28',
    progress: 100,
    weight: '62 lbs',
    class: 'Standard Parcel',
    tracking: 'FFU-5530812',
  },
  {
    id: 'SHP-2025-0795',
    rfq: 'RFQ-2025-0031',
    description: 'Heavy Machinery — HeavySet 50T Hydraulic Press',
    origin: 'Leeds LS1',
    destination: 'London SE1',
    carrier: 'HeavyHaul Logistics',
    status: 'pending',
    eta: '2025-04-12',
    progress: 5,
    weight: '820 lbs',
    class: 'LTL Class 125',
    tracking: 'HHL-2209041',
  },
  {
    id: 'SHP-2025-0788',
    rfq: 'RFQ-2025-0022',
    description: 'Site B PPE Annual Contract (×12 items)',
    origin: 'London SE1',
    destination: 'Manchester NW1',
    carrier: 'BuildMore Freight',
    status: 'delivered',
    eta: '2025-02-26',
    progress: 100,
    weight: '145 lbs',
    class: 'Standard Parcel',
    tracking: 'BMF-7720033',
  },
  {
    id: 'SHP-2025-0761',
    rfq: 'RFQ-2025-0028',
    description: 'Fastener Assortment Kits — Q1 Resupply (×8 kits)',
    origin: 'Birmingham B1',
    destination: 'London SE1',
    carrier: 'FastFreight UK',
    status: 'exception',
    eta: '2025-03-02',
    progress: 40,
    weight: '28 lbs',
    class: 'Standard Parcel',
    tracking: 'FFU-4419288',
  },
];

const STATUS_MAP = {
  pending: { label: 'Pending Pickup', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' },
  in_transit: { label: 'In Transit', icon: Truck, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  exception: { label: 'Exception', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
};

export const Logistics: React.FC<LogisticsProps> = ({ isDark }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);

  const statusOptions = ['All', 'pending', 'in_transit', 'delivered', 'exception'];

  const filtered = SHIPMENTS.filter(s => {
    const matchSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tracking.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inTransit = SHIPMENTS.filter(s => s.status === 'in_transit').length;
  const delivered = SHIPMENTS.filter(s => s.status === 'delivered').length;
  const exceptions = SHIPMENTS.filter(s => s.status === 'exception').length;

  const selectedShipment = SHIPMENTS.find(s => s.id === selected);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[1.5px] bg-yellow-400"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Freight Intelligence</span>
        </div>
        <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Logistics</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Shipments', value: inTransit, icon: Truck, color: 'text-blue-400' },
          { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Exceptions', value: exceptions, icon: AlertCircle, color: 'text-red-400' },
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
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {s === 'in_transit' ? 'In Transit' : s}
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
            const s = STATUS_MAP[shipment.status as keyof typeof STATUS_MAP];
            const isSelected = selected === shipment.id;
            return (
              <div
                key={shipment.id}
                onClick={() => setSelected(isSelected ? null : shipment.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-yellow-400/40 bg-yellow-400/5'
                    : isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{shipment.id}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.bg} ${s.color}`}>
                        <s.icon className="w-2.5 h-2.5" />
                        {s.label}
                      </span>
                    </div>
                    <h3 className={`text-sm font-black uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{shipment.description}</h3>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90 text-yellow-400' : 'text-slate-500'}`} />
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${shipment.status === 'delivered' ? 'bg-green-400' : shipment.status === 'exception' ? 'bg-red-400' : 'bg-yellow-400'}`}
                      style={{ width: `${shipment.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{shipment.origin}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                  <span>{shipment.destination}</span>
                  <span className="ml-auto">ETA: {shipment.eta}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedShipment && (
          <div className={`p-6 rounded-2xl border space-y-6 sticky top-24 h-fit animate-in fade-in duration-300 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
            <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Shipment Detail</h3>
            <div className="space-y-3">
              {[
                { label: 'Tracking #', value: selectedShipment.tracking },
                { label: 'Carrier', value: selectedShipment.carrier },
                { label: 'Origin', value: selectedShipment.origin },
                { label: 'Destination', value: selectedShipment.destination },
                { label: 'Freight Class', value: selectedShipment.class },
                { label: 'Gross Weight', value: selectedShipment.weight },
                { label: 'ETA', value: selectedShipment.eta },
                { label: 'Linked RFQ', value: selectedShipment.rfq },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <button className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-black'}`}>
              Track Shipment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
