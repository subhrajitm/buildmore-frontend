import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { rfqApi, RFQ } from '../api';
import { 
  ChevronDown, ChevronUp, Loader2, Check, ChevronLeft, ChevronRight, 
  Clock, CheckCircle, XCircle, FileText, Search, AlertCircle, Package, 
  IndianRupee, Calendar, User, Phone, Mail, RefreshCw, Pencil
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface AdminRFQsProps {
  isDark: boolean;
}

const RFQ_ADMIN_STATUSES = ['UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED'] as const;
const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', icon: FileText, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  SUBMITTED: { label: 'Submitted', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  UNDER_REVIEW: { label: 'Under Review', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  QUOTED: { label: 'Quoted', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ACCEPTED: { label: 'Accepted', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  EXPIRED: { label: 'Expired', icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

export const AdminRFQs: React.FC<AdminRFQsProps> = ({ isDark }) => {
  const { adminToken } = useAdminAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [quotedPrices, setQuotedPrices] = useState<Record<string, Record<string, string>>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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

  const filtered = rfqs.filter(rfq => {
    const matchSearch = rfq.rfqNumber?.toLowerCase().includes(search.toLowerCase()) ||
      (rfq.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || rfq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: rfqs.length,
    pending: rfqs.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status)).length,
    quoted: rfqs.filter(r => r.status === 'QUOTED').length,
    accepted: rfqs.filter(r => r.status === 'ACCEPTED').length,
    value: rfqs.filter(r => r.status === 'ACCEPTED').reduce((s, r) => s + r.totalEstimatedValue, 0),
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRfqs = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

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
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.total}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Total RFQs</p>
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
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.quoted}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Quoted</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>{stats.accepted}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Accepted</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className={`text-2xl font-black ${textClass}`}>₹{(stats.value / 1000).toFixed(0)}K</p>
          <p className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>Accepted Value</p>
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
              placeholder="Search by RFQ number or notes..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', ...RFQ_ADMIN_STATUSES].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  statusFilter === s 
                    ? 'bg-yellow-400 text-black' 
                    : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                {s === 'UNDER_REVIEW' ? 'Review' : s === 'All' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className={`text-sm font-bold ${mutedClass}`}>
          Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} RFQs
        </p>
        <button 
          onClick={() => { rfqApi.adminGetAll(adminToken!).then(r => setRfqs(r.rfqs || [])); }}
          className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <FileText className="w-16 h-16 text-slate-300" />
          <p className={`text-sm font-black uppercase tracking-widest ${mutedClass}`}>No RFQs found</p>
          <p className={`text-xs ${mutedClass}`}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* RFQ List */}
      {paginatedRfqs.map(rfq => {
        const isExpanded = expandedId === rfq._id;
        const config = STATUS_CONFIG[rfq.status] || STATUS_CONFIG['DRAFT'];
        const StatusIcon = config.icon;
        
        return (
          <div key={rfq._id} className={`rounded-2xl border transition-all ${cardBg} ${cardHover}`}>
            {/* Main Row */}
            <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rfq._id)}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-black ${textClass}`}>{rfq.rfqNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${mutedClass}`}>{rfq.notes || 'No description'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" /> {rfq.items?.length || 0} item(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(rfq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {rfq.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Expires: {new Date(rfq.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xl font-black ${textClass}`}>₹{rfq.totalEstimatedValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-[9px] font-bold ${mutedClass}`}>Est. Value</p>
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
                {/* User Info */}
                {rfq.user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Requester</p>
                      <div className="space-y-2">
                        {rfq.user.name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{rfq.user.name}</span>
                          </div>
                        )}
                        {rfq.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{rfq.user.phone}</span>
                          </div>
                        )}
                        {rfq.user.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className={`text-xs font-bold ${textClass}`}>{rfq.user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {rfq.expiresAt && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Expiry</p>
                        <p className={`text-sm font-bold ${textClass}`}>
                          {new Date(rfq.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className={`text-xs ${mutedClass}`}>
                          {Math.ceil((new Date(rfq.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quote Items */}
                {rfq.items.length > 0 && (
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Items — Enter Quoted Prices</p>
                    <div className="space-y-2">
                      {rfq.items.map(item => (
                        <div key={item._id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${textClass}`}>{item.productName}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className={`text-[9px] ${mutedClass}`}>Qty: {item.quantity}</span>
                              {item.targetPrice != null && <span className={`text-[9px] ${mutedClass}`}>Target: ₹{item.targetPrice.toLocaleString('en-IN')}</span>}
                              {item.quotedPrice != null && <span className={`text-[9px] text-green-400 font-bold`}>Quoted: ₹{item.quotedPrice.toLocaleString('en-IN')}</span>}
                            </div>
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
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-3`}>Admin Notes</p>
                  <textarea
                    rows={2}
                    value={adminNotes[rfq._id] ?? rfq.adminNotes ?? ''}
                    onChange={e => setAdminNotes(n => ({ ...n, [rfq._id]: e.target.value }))}
                    className={input}
                    placeholder="Internal notes visible to user..."
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => handleUpdate(rfq._id)} disabled={updatingId === rfq._id} className="bg-yellow-400 text-black px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 flex items-center gap-1.5 disabled:opacity-50">
                    {updatingId === rfq._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save Quote & Notes
                  </button>
                  {RFQ_ADMIN_STATUSES.map(s => {
                    const sc = STATUS_CONFIG[s];
                    if (!sc) return null;
                    return (
                      <button key={s} onClick={() => handleUpdate(rfq._id, s)} disabled={updatingId === rfq._id || rfq.status === s}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                          rfq.status === s 
                            ? 'bg-yellow-400 text-black' 
                            : `${sc.bg} ${sc.color} hover:opacity-80`
                        }`}
                      >
                        {updatingId === rfq._id && rfq.status !== s ? <Loader2 className="w-3 h-3 animate-spin" /> : <sc.icon className="w-3 h-3" />}
                        {s === 'UNDER_REVIEW' ? 'Review' : s}
                      </button>
                    );
                  })}
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