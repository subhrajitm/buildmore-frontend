import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { orderApi, Order } from '../api';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronDown, ChevronUp, Loader2, Search, ChevronLeft, ChevronRight, 
  Package, Truck, Clock, CheckCircle, XCircle, AlertCircle,
  IndianRupee, MapPin, User, Phone, Mail, Calendar,
  Eye, Filter, Download, RefreshCw, ShoppingCart
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const ORDER_STATUSES: Order['status'][] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  PENDING: { color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Clock },
  CONFIRMED: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: CheckCircle },
  PROCESSING: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Package },
  SHIPPED: { color: 'text-purple-400', bg: 'bg-purple-400/10', icon: Truck },
  DELIVERED: { color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle },
  CANCELLED: { color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

export const AdminOrders: React.FC = () => {
  const { isDark } = useTheme();
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
  const cardHover = isDark ? 'hover:border-yellow-400/30' : 'hover:border-yellow-400';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400'}`;

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
    const matchSearch = o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    revenue: orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0),
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

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
              <ShoppingCart className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.total}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Total Orders</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.pending}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Pending</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.processing}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Processing</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>₹{stats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Revenue</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.delivered}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Delivered</p>
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
              placeholder="Search by order number..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', ...ORDER_STATUSES].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  statusFilter === s 
                    ? 'bg-yellow-400 text-black' 
                    : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className={`text-sm font-bold ${mutedClass}`}>
          Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} orders
        </p>
        <button 
          onClick={() => { orderApi.adminGetAll(adminToken!).then(r => setOrders(r.orders || [])); }}
          className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <Package className="w-16 h-16 text-slate-300" />
          <p className={`text-sm font-black uppercase tracking-widest ${mutedClass}`}>No orders found</p>
          <p className={`text-xs ${mutedClass}`}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Orders List */}
      {paginatedOrders.map(order => {
        const isExpanded = expandedId === order._id;
        const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
        const StatusIcon = config.icon;
        
        return (
          <div key={order._id} className={`rounded-2xl border transition-all ${cardBg} ${cardHover}`}>
            {/* Main Row */}
            <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order._id)}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-black ${textClass}`}>{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" /> {order.items?.length || 0} item(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {order.shippingAddress?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {order.shippingAddress.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xl font-black ${textClass}`}>₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-[9px] font-bold ${mutedClass}`}>
                    {order.paymentMethod === 'ONLINE' ? 'Online' : order.paymentMethod === 'COD' ? 'COD' : 'Card'}
                  </p>
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
                {/* Customer Info */}
                {order.user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Customer</p>
                      <div className="space-y-2">
                        {order.user.name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{order.user.name}</span>
                          </div>
                        )}
                        {order.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{order.user.phone}</span>
                          </div>
                        )}
                        {order.user.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{order.user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Shipping Address</p>
                      {order.shippingAddress ? (
                        <div className="space-y-1">
                          {order.shippingAddress.building && <p className={`text-xs font-bold ${textClass}`}>{order.shippingAddress.building}</p>}
                          {order.shippingAddress.area && <p className={`text-xs ${mutedClass}`}>{order.shippingAddress.area}</p>}
                          <p className={`text-xs ${mutedClass}`}>
                            {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      ) : (
                        <p className={`text-xs ${mutedClass}`}>No address provided</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Order Items</p>
                  <div className="space-y-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${textClass}`}>{item.productName}</p>
                          <p className={`text-[9px] ${mutedClass}`}>SKU: {item.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs font-bold ${textClass}`}>×{item.quantity}</p>
                          <p className={`text-[9px] ${mutedClass}`}>₹{item.price?.toFixed(2)}</p>
                        </div>
                        <p className={`text-sm font-black w-24 text-right shrink-0 ${textClass}`}>
                          ₹{(item.quantity * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Order Total */}
                  <div className={`flex justify-end mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="w-48 text-right space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={mutedClass}>Subtotal</span>
                        <span className={textClass}>₹{order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span>
                      </div>
                      {order.shippingCost > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className={mutedClass}>Shipping</span>
                          <span className={textClass}>₹{order.shippingCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black pt-1 border-t border-current">
                        <span className={textClass}>Total</span>
                        <span className={textClass}>₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map(s => {
                      const sc = STATUS_CONFIG[s];
                      const StatusIcon2 = sc.icon;
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(order._id, s)}
                          disabled={updatingId === order._id || order.status === s}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            order.status === s 
                              ? 'bg-yellow-400 text-black' 
                              : `${sc.bg} ${sc.color} hover:opacity-80`
                          }`}
                        >
                          {updatingId === order._id && order.status !== s ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <StatusIcon2 className="w-3 h-3" />
                          )}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
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