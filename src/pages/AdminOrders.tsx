import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { orderApi, Order } from '../api';
import { ChevronDown, ChevronUp, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface AdminOrdersProps {
  isDark: boolean;
}

const ORDER_STATUSES: Order['status'][] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-slate-400', CONFIRMED: 'text-blue-400', PROCESSING: 'text-yellow-400',
  SHIPPED: 'text-purple-400', DELIVERED: 'text-green-400', CANCELLED: 'text-red-400',
};

export const AdminOrders: React.FC<AdminOrdersProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    if (!adminToken) return;
    orderApi.adminGetAll(adminToken).then(r => setOrders(r.orders || [])).catch(() => showToast('Failed to load orders')).finally(() => setLoading(false));
  }, [adminToken]);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    if (!adminToken) return;
    setUpdatingId(id);
    try {
      const res = await orderApi.adminUpdateStatus(id, status, adminToken);
      setOrders(prev => prev.map(o => o._id === id ? res.order : o));
      showToast(`Order status → ${status}`);
    } catch (err: any) {
      showToast('Update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest z-50">
          {toast}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search orders..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-56 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...ORDER_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-auto">{filtered.length} Orders</p>
      </div>
      {filtered.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">No orders found</p>
        </div>
      )}
      {paginatedOrders.map(order => {
        const isExpanded = expandedId === order._id;
        const statusColor = ORDER_STATUS_COLORS[order.status] ?? 'text-slate-400';
        return (
          <div key={order._id} className={`rounded-2xl border transition-all ${cardBg}`}>
            <div className="p-5 flex items-center gap-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order._id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${mutedClass}`}>{order.orderNumber}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${statusColor}`}>{order.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] text-slate-500 font-bold">{order.items.length} item(s)</span>
                  <span className="text-[9px] text-slate-500 font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-lg font-black ${textClass}`}>₹{order.totalAmount.toFixed(2)}</p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
            </div>

            {isExpanded && (
              <div className={`border-t px-5 pb-5 pt-4 space-y-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <span className={`text-xs font-bold ${textClass}`}>{item.productName}</span>
                      <span className="text-[9px] text-slate-500 font-bold">×{item.quantity} @ ₹{item.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {order.shippingAddress && (
                  <p className="text-[9px] text-slate-500 font-bold">Ship to: {[order.shippingAddress.building, order.shippingAddress.area, order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')}</p>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Update Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(order._id, s)}
                        disabled={updatingId === order._id || order.status === s}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          order.status === s ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {updatingId === order._id && order.status !== s ? <Loader2 className="w-3 h-3 animate-spin inline" /> : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
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