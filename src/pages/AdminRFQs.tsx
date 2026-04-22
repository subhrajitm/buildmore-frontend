import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { rfqApi, RFQ } from '../api';
import { ChevronDown, ChevronUp, Loader2, Check } from 'lucide-react';

interface AdminRFQsProps {
  isDark: boolean;
}

const RFQ_ADMIN_STATUSES = ['UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED'] as const;

export const AdminRFQs: React.FC<AdminRFQsProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [quotedPrices, setQuotedPrices] = useState<Record<string, Record<string, string>>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const input = `w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none transition-colors ${isDark ? 'bg-zinc-900 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`;

  useEffect(() => {
    if (!adminToken) return;
    rfqApi.adminGetAll(adminToken).then(r => setRfqs(r.rfqs || [])).catch(() => showToast('Failed to load RFQs')).finally(() => setLoading(false));
  }, [adminToken]);

  const handleUpdate = async (rfqId: string, status?: string) => {
    if (!adminToken) return;
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
      }, adminToken);
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
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest z-50">
          {toast}
        </div>
      )}
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{rfqs.length} Total RFQs</p>
      {rfqs.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">No RFQs submitted</p>
        </div>
      )}
      {rfqs.map(rfq => {
        const isExpanded = expandedId === rfq._id;
        return (
          <div key={rfq._id} className={`rounded-2xl border transition-all ${cardBg}`}>
            <div className="p-5 flex items-center gap-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rfq._id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${mutedClass}`}>{rfq.rfqNumber}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">{rfq.status}</span>
                </div>
                <p className={`text-sm font-black uppercase truncate ${textClass}`}>{rfq.notes || 'No description'}</p>
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
                          <p className={`text-xs font-bold ${textClass}`}>{item.productName}</p>
                          <p className="text-[9px] text-slate-500 font-bold">Qty: {item.quantity} · Target: ₹{item.targetPrice ?? '—'}</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder={item.quotedPrice != null ? String(item.quotedPrice) : 'Quote ₹'}
                          value={quotedPrices[rfq._id]?.[item._id] ?? ''}
                          onChange={e => setQuotedPrices(p => ({ ...p, [rfq._id]: { ...p[rfq._id], [item._id]: e.target.value } }))}
                          className={`w-28 px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${isDark ? 'border-white/10 bg-zinc-900 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
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
                    className={input}
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
};