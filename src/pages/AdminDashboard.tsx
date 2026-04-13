import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, BackendProduct, orderApi, Order, rfqApi, RFQ, shipmentApi, Shipment, specsApi, SpecSheet } from '../api';
import { Plus, Package, ShoppingCart, FileText, Truck, Loader2, ChevronRight, LayoutDashboard } from 'lucide-react';

interface AdminDashboardProps {
  isDark: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, orders: 0, rfqs: 0, shipments: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentRfqs, setRecentRfqs] = useState<RFQ[]>([]);

  useEffect(() => {
    if (!adminToken) return;
    Promise.all([
      adminApi.getAll(adminToken).then(r => r.products?.length || 0),
      orderApi.adminGetAll(adminToken).then(r => r.orders || []),
      rfqApi.adminGetAll(adminToken).then(r => r.rfqs || []),
      shipmentApi.adminGetAll(adminToken).then(r => r.shipments || []),
    ]).then(([products, orders, rfqs, shipments]) => {
      setStats({ products, orders: orders.length, rfqs: rfqs.length, shipments: shipments.length });
      setRecentOrders(orders.slice(0, 5));
      setRecentRfqs(rfqs.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [adminToken]);

  const navigate = useNavigate();
  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  const statCards = [
    { label: 'Products', value: stats.products, icon: Package, path: '/admin/products' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, path: '/admin/orders' },
    { label: 'RFQs', value: stats.rfqs, icon: FileText, path: '/admin/rfqs' },
    { label: 'Shipments', value: stats.shipments, icon: Truck, path: '/admin/shipments' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl font-black uppercase tracking-wider mb-2 ${textClass}`}>Dashboard</h1>
        <p className={`text-sm font-bold ${mutedClass}`}>Welcome to BuildMore Admin Portal</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <button key={stat.label} onClick={() => navigate(stat.path)} className={`p-6 rounded-2xl border text-left transition-all hover:border-yellow-400/50 hover:scale-[1.02] ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <stat.icon className="w-5 h-5 text-yellow-400" />
              </div>
              <ChevronRight className={`w-4 h-4 ${mutedClass}`} />
            </div>
            <p className={`text-3xl font-black ${textClass}`}>{stat.value}</p>
            <p className={`text-xs font-black uppercase tracking-widest mt-1 ${mutedClass}`}>{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-sm font-black uppercase tracking-widest ${textClass}`}>Recent Orders</h2>
            <button onClick={() => navigate('/admin/orders')} className="text-xs font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300">View All</button>
          </div>
          {recentOrders.length === 0 ? (
            <p className={`text-sm font-bold ${mutedClass}`}>No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order._id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div>
                    <p className={`text-xs font-black ${textClass}`}>{order.orderNumber}</p>
                    <p className={`text-[10px] ${mutedClass}`}>{order.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${textClass}`}>${order.totalAmount.toFixed(2)}</p>
                    <p className={`text-[10px] font-black uppercase ${order.status === 'PENDING' ? 'text-yellow-400' : 'text-green-400'}`}>{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-sm font-black uppercase tracking-widest ${textClass}`}>Recent RFQs</h2>
            <button onClick={() => navigate('/admin/rfqs')} className="text-xs font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300">View All</button>
          </div>
          {recentRfqs.length === 0 ? (
            <p className={`text-sm font-bold ${mutedClass}`}>No RFQs yet</p>
          ) : (
            <div className="space-y-3">
              {recentRfqs.map(rfq => (
                <div key={rfq._id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div>
                    <p className={`text-xs font-black ${textClass}`}>{rfq.rfqNumber}</p>
                    <p className={`text-[10px] ${mutedClass}`}>{rfq.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${textClass}`}>${rfq.totalEstimatedValue.toFixed(2)}</p>
                    <p className={`text-[10px] font-black uppercase text-yellow-400`}>{rfq.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};