import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Check, X, Upload, AlertCircle,
  ChevronDown, Truck, FileText, ClipboardList, Loader2, ChevronUp, Send,
} from 'lucide-react';
import { adminApi, BackendProduct, orderApi, Order, rfqApi, RFQ, shipmentApi, Shipment, specsApi, SpecSheet } from '../api';
import { useAuth } from '../context/AuthContext';

interface AdminProps {
  isDark: boolean;
}

const EMPTY_FORM = {
  productName: '', desc: '', category: '', price: '', stock: '', materialSpecifications: '',
};

type Tab = 'products' | 'orders' | 'rfqs' | 'shipments' | 'specs';

const ORDER_STATUSES: Order['status'][] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-slate-400', CONFIRMED: 'text-blue-400', PROCESSING: 'text-yellow-400',
  SHIPPED: 'text-purple-400', DELIVERED: 'text-green-400', CANCELLED: 'text-red-400',
};

const SHIPMENT_STATUSES: Shipment['status'][] = ['PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({ isDark, token, input, card, showToast }: {
  isDark: boolean; token: string; input: string; card: string; showToast: (m: string) => void;
}) {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BackendProduct>>({});
  const [stockEditing, setStockEditing] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    adminApi.getAll(token).then(r => setProducts(r.products || [])).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) { setError('At least one product image is required'); return; }
    setSubmitting(true); setError('');
    const fd = new FormData();
    fd.append('productName', form.productName); fd.append('desc', form.desc);
    fd.append('category', form.category); fd.append('price', form.price);
    fd.append('stock', form.stock); fd.append('materialSpecifications', form.materialSpecifications);
    Array.from(files as FileList).forEach((f: File) => fd.append('images', f));
    try {
      await adminApi.add(fd, token);
      setForm({ ...EMPTY_FORM }); setFiles(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowAddForm(false); showToast('Product added'); load();
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id: string) => {
    try { await adminApi.update(id, editForm, token); setEditingId(null); showToast('Updated'); load(); }
    catch (err: any) { showToast('Update failed: ' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try { await adminApi.delete(id, token); showToast('Deleted'); load(); }
    catch (err: any) { showToast('Delete failed: ' + err.message); }
  };

  const handleStockUpdate = async (id: string) => {
    const n = Number(stockValue);
    if (isNaN(n) || n < 0) { showToast('Invalid stock value'); return; }
    try { await adminApi.updateStock(id, n, token); setStockEditing(null); showToast('Stock updated'); load(); }
    catch (err: any) { showToast('Stock update failed: ' + err.message); }
  };

  const handleToggleAvailability = async (id: string) => {
    try { await adminApi.toggleAvailability(id, token); showToast('Availability toggled'); load(); }
    catch (err: any) { showToast('Toggle failed: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{products.length} Products in Catalog</p>
        <button
          onClick={() => { setShowAddForm(v => !v); setError(''); }}
          className="flex items-center gap-3 bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all"
        >
          {showAddForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Product</>}
        </button>
      </div>

      {showAddForm && (
        <div className={`rounded-2xl border p-8 space-y-6 ${card}`}>
          <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>New Product</h2>
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400 font-bold">{error}</p>
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Product Name *</label>
                <input required value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} placeholder="BuildMore X-Series..." />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Category *</label>
                <input required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} placeholder="Industrial Tools" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Price (INR) *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stock *</label>
                <input required type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Description *</label>
              <textarea required rows={3} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-colors resize-none ${input}`} placeholder="Professional-grade..." />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Material Specifications</label>
              <input value={form.materialSpecifications} onChange={e => setForm(f => ({ ...f, materialSpecifications: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} placeholder="Composite/Aluminum, IP67..." />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Product Images * (up to 5)</label>
              <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors ${isDark ? 'border-white/10 hover:border-yellow-400/40' : 'border-slate-200 hover:border-yellow-400/60'}`} onClick={() => fileRef.current?.click()}>
                <Upload className="w-6 h-6 text-slate-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{files && files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload images'}</p>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setFiles(e.target.files)} />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={submitting} className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Product</>}
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setError(''); setForm({ ...EMPTY_FORM }); }} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
      ) : products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
          <Package className="w-10 h-10 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">No products in catalog</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b text-[9px] font-black uppercase tracking-widest ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                  <th className="text-left px-6 py-4">Product</th>
                  <th className="text-left px-4 py-4">Category</th>
                  <th className="text-right px-4 py-4">Price</th>
                  <th className="text-right px-4 py-4">Stock</th>
                  <th className="text-center px-4 py-4">Available</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {products.map(p => (
                  <tr key={p._id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    {editingId === p._id ? (
                      <>
                        <td className="px-6 py-4" colSpan={4}>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input value={editForm.productName ?? p.productName} onChange={e => setEditForm(f => ({ ...f, productName: e.target.value }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Name" />
                            <input value={editForm.category ?? p.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Category" />
                            <input type="number" value={editForm.price ?? p.price} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Price" />
                            <input value={editForm.materialSpecifications ?? p.materialSpecifications ?? ''} onChange={e => setEditForm(f => ({ ...f, materialSpecifications: e.target.value }))} className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} placeholder="Material specs" />
                          </div>
                        </td>
                        <td className="text-center px-4 py-4" />
                        <td className="text-right px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdate(p._id)} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-1.5"><Check className="w-3 h-3" /> Save</button>
                            <button onClick={() => { setEditingId(null); setEditForm({}); }} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600'}`}><X className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                              <Package className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className={`text-xs font-black leading-tight max-w-[200px] truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.productName}</p>
                              {p.desc && <p className="text-[9px] text-slate-500 font-medium truncate max-w-[200px]">{p.desc}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{p.category}</span></td>
                        <td className="px-4 py-4 text-right"><span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{p.price.toFixed(2)}</span></td>
                        <td className="px-4 py-4 text-right">
                          {stockEditing === p._id ? (
                            <div className="flex items-center justify-end gap-2">
                              <input type="number" min="0" value={stockValue} onChange={e => setStockValue(e.target.value)} className={`w-20 px-2 py-1 rounded-lg border text-xs font-bold outline-none text-right ${input}`} autoFocus />
                              <button onClick={() => handleStockUpdate(p._id)} className="text-yellow-400 hover:text-yellow-300"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setStockEditing(null)} className="text-slate-500 hover:text-slate-300"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setStockEditing(p._id); setStockValue(String(p.stock)); }} className={`text-xs font-black hover:text-yellow-400 transition-colors flex items-center gap-1 ml-auto ${p.stock === 0 ? 'text-red-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                              {p.stock} <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => handleToggleAvailability(p._id)} title={p.availability ? 'Click to disable' : 'Click to enable'}>
                            {p.availability ? <ToggleRight className="w-6 h-6 text-yellow-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingId(p._id); setEditForm({}); }} className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-500 hover:text-yellow-500'}`}><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(p._id)} className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ isDark, token, input, card, showToast }: {
  isDark: boolean; token: string; input: string; card: string; showToast: (m: string) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    orderApi.adminGetAll(token).then(r => setOrders(r.orders)).catch(() => showToast('Failed to load orders')).finally(() => setLoading(false));
  }, [token]);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    setUpdatingId(id);
    try {
      const res = await orderApi.adminUpdateStatus(id, status, token);
      setOrders(prev => prev.map(o => o._id === id ? res.order : o));
      showToast(`Order status → ${status}`);
    } catch (err: any) {
      showToast('Update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{orders.length} Total Orders</p>
      {orders.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <ClipboardList className="w-10 h-10 opacity-30" />
          <p className="text-[10px] font-black uppercase tracking-widest">No orders yet</p>
        </div>
      )}
      {orders.map(order => {
        const isExpanded = expandedId === order._id;
        const statusColor = ORDER_STATUS_COLORS[order.status] ?? 'text-slate-400';
        return (
          <div key={order._id} className={`rounded-2xl border transition-all ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="p-5 flex items-center gap-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order._id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{order.orderNumber}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${statusColor}`}>{order.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] text-slate-500 font-bold">{order.items.length} item(s)</span>
                  <span className="text-[9px] text-slate-500 font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{order.totalAmount.toFixed(2)}</p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
            </div>

            {isExpanded && (
              <div className={`border-t px-5 pb-5 pt-4 space-y-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</span>
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
    </div>
  );
}

// ─── RFQs Tab ─────────────────────────────────────────────────────────────────

const RFQ_ADMIN_STATUSES = ['UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED'] as const;

function RFQsTab({ isDark, token, input, card, showToast }: {
  isDark: boolean; token: string; input: string; card: string; showToast: (m: string) => void;
}) {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [quotedPrices, setQuotedPrices] = useState<Record<string, Record<string, string>>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    rfqApi.adminGetAll(token).then(r => setRfqs(r.rfqs)).catch(() => showToast('Failed to load RFQs')).finally(() => setLoading(false));
  }, [token]);

  const handleUpdate = async (rfqId: string, status?: string) => {
    setUpdatingId(rfqId);
    const rfq = rfqs.find(r => r._id === rfqId);
    if (!rfq) return;
    const items = rfq.items.map(item => ({
      itemId: item._id,
      quotedPrice: Number(quotedPrices[rfqId]?.[item._id] ?? item.quotedPrice ?? 0),
    })).filter(i => i.quotedPrice > 0);
    try {
      const res = await rfqApi.adminUpdate(rfqId, {
        status: status || undefined,
        adminNotes: adminNotes[rfqId] || undefined,
        quotedItems: items.length > 0 ? items : undefined,
      }, token);
      setRfqs(prev => prev.map(r => r._id === rfqId ? res.rfq : r));
      showToast('RFQ updated');
    } catch (err: any) {
      showToast('Update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{rfqs.length} Total RFQs</p>
      {rfqs.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <FileText className="w-10 h-10 opacity-30" />
          <p className="text-[10px] font-black uppercase tracking-widest">No RFQs submitted</p>
        </div>
      )}
      {rfqs.map(rfq => {
        const isExpanded = expandedId === rfq._id;
        return (
          <div key={rfq._id} className={`rounded-2xl border transition-all ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="p-5 flex items-center gap-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rfq._id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rfq.rfqNumber}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">{rfq.status}</span>
                </div>
                <p className={`text-sm font-black uppercase truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{rfq.notes || 'No description'}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">{rfq.items.length} item(s) · ₹{rfq.totalEstimatedValue.toFixed(2)} est.</p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
            </div>

            {isExpanded && (
              <div className={`border-t px-5 pb-5 pt-4 space-y-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                {rfq.items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Items — Enter Quoted Prices</p>
                    {rfq.items.map(item => (
                      <div key={item._id} className={`flex items-center justify-between px-4 py-2 rounded-xl gap-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.productName}</p>
                          <p className="text-[9px] text-slate-500 font-bold">Qty: {item.quantity} · Target: ₹{item.targetPrice ?? '—'}</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder={item.quotedPrice != null ? String(item.quotedPrice) : 'Quote ₹'}
                          value={quotedPrices[rfq._id]?.[item._id] ?? ''}
                          onChange={e => setQuotedPrices(p => ({ ...p, [rfq._id]: { ...p[rfq._id], [item._id]: e.target.value } }))}
                          className={`w-28 px-3 py-1.5 rounded-lg border text-xs font-bold outline-none transition-colors ${input}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Admin Notes</label>
                  <textarea
                    rows={2}
                    value={adminNotes[rfq._id] ?? rfq.adminNotes ?? ''}
                    onChange={e => setAdminNotes(n => ({ ...n, [rfq._id]: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none transition-colors resize-none ${input}`}
                    placeholder="Internal notes visible to user..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button onClick={() => handleUpdate(rfq._id)} disabled={updatingId === rfq._id} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-1.5 disabled:opacity-50">
                    {updatingId === rfq._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save Notes
                  </button>
                  {RFQ_ADMIN_STATUSES.map(s => (
                    <button key={s} onClick={() => handleUpdate(rfq._id, s)} disabled={updatingId === rfq._id || rfq.status === s}
                      className={`px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all disabled:opacity-50 ${rfq.status === s ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                      {s === 'UNDER_REVIEW' ? 'Review' : s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shipments Tab ────────────────────────────────────────────────────────────

function ShipmentsTab({ isDark, token, input, card, showToast }: {
  isDark: boolean; token: string; input: string; card: string; showToast: (m: string) => void;
}) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({ orderId: '', userId: '', carrier: '', origin: '', destination: '', estimatedDelivery: '', freightClass: '', weight: '' });
  const [eventForms, setEventForms] = useState<Record<string, { status: string; location: string; description: string }>>({});

  const load = () => {
    setLoading(true);
    shipmentApi.adminGetAll(token).then(r => setShipments(r.shipments)).catch(() => showToast('Failed to load shipments')).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleCreate = async () => {
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
      }, token);
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
    setUpdatingId(id);
    try {
      const res = await shipmentApi.adminUpdate(id, { status }, token);
      setShipments(prev => prev.map(s => s._id === id ? res.shipment : s));
      showToast(`Status → ${status}`);
    } catch (err: any) {
      showToast('Update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddEvent = async (id: string) => {
    const ev = eventForms[id];
    if (!ev?.status.trim()) { showToast('Event status is required'); return; }
    setUpdatingId(id);
    try {
      const res = await shipmentApi.adminUpdate(id, {
        status: ev.status as Shipment['status'] | undefined,
        location: ev.location || undefined,
        description: ev.description || undefined,
      }, token);
      setShipments(prev => prev.map(s => s._id === id ? res.shipment : s));
      setEventForms(f => ({ ...f, [id]: { status: '', location: '', description: '' } }));
      showToast('Event added');
    } catch (err: any) {
      showToast('Failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{shipments.length} Shipments</p>
        <button onClick={() => setShowCreate(v => !v)} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-2">
          {showCreate ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Create Shipment</>}
        </button>
      </div>

      {showCreate && (
        <div className={`p-6 rounded-2xl border space-y-4 ${card}`}>
          <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>New Shipment</h3>
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
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`}
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
        {shipments.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <Truck className="w-10 h-10 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No shipments yet</p>
          </div>
        )}
        {shipments.map(ship => {
          const isExpanded = expandedId === ship._id;
          const ev = eventForms[ship._id] ?? { status: '', location: '', description: '' };
          return (
            <div key={ship._id} className={`rounded-2xl border transition-all ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="p-5 flex items-center gap-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : ship._id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ship.trackingNumber}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">{ship.status}</span>
                  </div>
                  <p className={`text-sm font-black uppercase truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{ship.carrier || 'No carrier'}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                    {[ship.origin, ship.destination].filter(Boolean).join(' → ')}
                    {ship.order && ` · Order: ${ship.order.orderNumber}`}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
              </div>

              {isExpanded && (
                <div className={`border-t px-5 pb-5 pt-4 space-y-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  {/* Status buttons */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 self-center mr-1">Status:</span>
                    {SHIPMENT_STATUSES.map(s => (
                      <button key={s} onClick={() => handleStatusUpdate(ship._id, s)} disabled={updatingId === ship._id || ship.status === s}
                        className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all disabled:opacity-50 ${ship.status === s ? 'bg-yellow-400 text-black' : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        {s === 'OUT_FOR_DELIVERY' ? 'Out for Del.' : s === 'PICKED_UP' ? 'Picked Up' : s === 'IN_TRANSIT' ? 'In Transit' : s}
                      </button>
                    ))}
                  </div>

                  {/* Add tracking event */}
                  <div className={`p-4 rounded-xl space-y-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Add Tracking Event</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input value={ev.status} onChange={e => setEventForms(f => ({ ...f, [ship._id]: { ...ev, status: e.target.value } }))} placeholder="Status label *" className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} />
                      <input value={ev.location} onChange={e => setEventForms(f => ({ ...f, [ship._id]: { ...ev, location: e.target.value } }))} placeholder="Location" className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} />
                      <input value={ev.description} onChange={e => setEventForms(f => ({ ...f, [ship._id]: { ...ev, description: e.target.value } }))} placeholder="Description" className={`px-3 py-2 rounded-lg border text-xs font-bold outline-none ${input}`} />
                    </div>
                    <button onClick={() => handleAddEvent(ship._id)} disabled={updatingId === ship._id || !ev.status.trim()} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-1.5 disabled:opacity-50">
                      {updatingId === ship._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add Event
                    </button>
                  </div>

                  {/* Events history */}
                  {ship.events.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Event History ({ship.events.length})</p>
                      {[...ship.events].reverse().map((ev, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                          <div>
                            <p className={`text-[10px] font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{ev.status}</p>
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
    </div>
  );
}

// ─── Specs Tab ────────────────────────────────────────────────────────────────

function SpecsTab({ isDark, token, input, card, showToast }: {
  isDark: boolean; token: string; input: string; card: string; showToast: (m: string) => void;
}) {
  const [specs, setSpecs] = useState<SpecSheet[]>([]);
  const [loading, setLoading] = useState(true);

  const FILE_TYPES = ['PDF', 'CAD', 'XLSX', 'DWG', 'OTHER'] as const;
  const [form, setForm] = useState({ title: '', fileType: 'PDF' as typeof FILE_TYPES[number], version: '1.0', description: '', productId: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    specsApi.getAll()
      .then(r => setSpecs(r.specs))
      .catch(() => showToast('Failed to load spec sheets'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  const handleUpload = async () => {
    if (!form.title.trim() || !file) { showToast('Title and file are required'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title.trim());
      fd.append('fileType', form.fileType);
      fd.append('version', form.version || '1.0');
      if (form.description.trim()) fd.append('description', form.description.trim());
      if (form.productId.trim()) fd.append('productId', form.productId.trim());
      await specsApi.adminUpload(fd, token);
      showToast('Spec sheet uploaded');
      setForm({ title: '', fileType: 'PDF', version: '1.0', description: '', productId: '' });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (e: any) { showToast(e.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this spec sheet?')) return;
    setDeleting(id);
    try {
      await specsApi.adminDelete(id, token);
      setSpecs(prev => prev.filter(s => s._id !== id));
      showToast('Deleted');
    } catch (e: any) { showToast(e.message || 'Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-8">
      {/* Upload form */}
      <div className={`p-6 rounded-2xl border space-y-5 ${card}`}>
        <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload Spec Sheet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Structural Steel Grade A Datasheet" className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">File Type *</label>
            <select value={form.fileType} onChange={e => setForm(f => ({ ...f, fileType: e.target.value as any }))} className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`}>
              {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Version</label>
            <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0" className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Product ID <span className="text-slate-600 normal-case font-bold">(optional — links sheet to a product)</span></label>
            <input value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} placeholder="MongoDB _id of linked product" className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the document" className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input}`} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">File *</label>
            <input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)} className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${input} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-yellow-400 file:text-black`} />
          </div>
        </div>
        <button onClick={handleUpload} disabled={uploading} className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 disabled:opacity-50 transition-all">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
        </button>
      </div>

      {/* Spec sheets list */}
      <div className="space-y-3">
        <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
          All Spec Sheets <span className="text-slate-500 font-bold text-xs">({specs.length})</span>
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>
        ) : specs.length === 0 ? (
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest py-8 text-center">No spec sheets yet</p>
        ) : specs.map(s => (
          <div key={s._id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${card}`}>
            <div className="flex items-center gap-4 min-w-0">
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{s.fileType}</span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                  v{s.version}{s.product ? ` · ${s.product.productName}` : ''}{s.fileSize ? ` · ${s.fileSize}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {s.fileUrl && (
                <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-400 hover:text-yellow-500'}`}>
                  <FileText className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => handleDelete(s._id)} disabled={deleting === s._id} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}>
                {deleting === s._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export const Admin: React.FC<AdminProps> = ({ isDark }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const base = isDark ? 'bg-zinc-950 text-white' : 'bg-white text-slate-900';
  const card = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const input = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'rfqs', label: 'RFQs', icon: FileText },
    { id: 'shipments', label: 'Shipments', icon: Truck },
    { id: 'specs', label: 'Spec Sheets', icon: FileText },
  ];

  if (!token) return null;

  return (
    <div className={`min-h-screen ${base} pb-32`}>
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all duration-300">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-white/5 pb-8">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">BuildMore Admin</p>
          <h1 className={`text-4xl font-black tracking-tighter mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Control <span className="text-yellow-400">Panel</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border w-fit ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'products' && <ProductsTab isDark={isDark} token={token} input={input} card={card} showToast={showToast} />}
        {activeTab === 'orders'   && <OrdersTab   isDark={isDark} token={token} input={input} card={card} showToast={showToast} />}
        {activeTab === 'rfqs'     && <RFQsTab     isDark={isDark} token={token} input={input} card={card} showToast={showToast} />}
        {activeTab === 'shipments'&& <ShipmentsTab isDark={isDark} token={token} input={input} card={card} showToast={showToast} />}
        {activeTab === 'specs'    && <SpecsTab    isDark={isDark} token={token} input={input} card={card} showToast={showToast} />}
      </div>
    </div>
  );
};
