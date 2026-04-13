import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, CheckCircle, AlertCircle, Clock, Search, FileText, Plus, Trash2, Loader2, Upload, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { complianceApi, ComplianceDoc } from '../api';

interface ComplianceProps {
  isDark: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  ACTIVE:        { label: 'Active',        icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
  EXPIRING_SOON: { label: 'Expiring Soon', icon: AlertCircle,  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  EXPIRED:       { label: 'Expired',       icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
};

const DOC_TYPES = ['ISO', 'CE', 'RoHS', 'REACH', 'SDS', 'AUDIT', 'OTHER'] as const;

export const Compliance: React.FC<ComplianceProps> = ({ isDark }) => {
  const { token, isAdmin } = useAuth();

  const [docs, setDocs] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Upload form
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<typeof DOC_TYPES[number]>('OTHER');
  const [uploadIssuedBy, setUploadIssuedBy] = useState('');
  const [uploadIssuedAt, setUploadIssuedAt] = useState('');
  const [uploadExpiresAt, setUploadExpiresAt] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetch = isAdmin ? complianceApi.adminGetAll(token) : complianceApi.getAll(token);
    fetch
      .then(res => setDocs(res.docs))
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [token, isAdmin]);

  const handleUpload = async () => {
    if (!token || !uploadTitle.trim() || !uploadFile) return;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('document', uploadFile);
      fd.append('title', uploadTitle.trim());
      fd.append('type', uploadType);
      if (uploadIssuedBy) fd.append('issuedBy', uploadIssuedBy);
      if (uploadIssuedAt) fd.append('issuedAt', uploadIssuedAt);
      if (uploadExpiresAt) fd.append('expiresAt', uploadExpiresAt);
      if (uploadNotes) fd.append('notes', uploadNotes);

      const res = await complianceApi.upload(fd, token);
      setDocs(prev => [res.doc, ...prev]);
      setShowUpload(false);
      setUploadTitle(''); setUploadType('OTHER'); setUploadIssuedBy('');
      setUploadIssuedAt(''); setUploadExpiresAt(''); setUploadNotes(''); setUploadFile(null);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Delete this compliance document?')) return;
    setDeleting(id);
    try {
      await complianceApi.delete(id, token);
      setDocs(prev => prev.filter(d => d._id !== id));
    } catch {
      // no-op
    } finally {
      setDeleting(null);
    }
  };

  const types = ['All', ...Array.from(new Set(docs.map(d => d.type)))];

  const filtered = docs.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchType = activeFilter === 'All' || doc.type === activeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    active: docs.filter(d => d.status === 'ACTIVE').length,
    expiring: docs.filter(d => d.status === 'EXPIRING_SOON').length,
    expired: docs.filter(d => d.status === 'EXPIRED').length,
  };

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1.5px] bg-yellow-400"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Regulatory Management</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Compliance Hub</h1>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 shrink-0 mt-2"
        >
          <Upload className="w-4 h-4" /> Upload Doc
        </button>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{fetchError}</p>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className={`p-6 rounded-2xl border space-y-4 transition-all duration-300 ${isDark ? 'bg-zinc-900 border-yellow-400/20' : 'bg-white border-yellow-400/30 shadow-xl'}`}>
          <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload Compliance Document</h3>
          {uploadError && <p className="text-xs text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-lg">{uploadError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Title *</label>
              <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. ISO 9001:2015 Quality Management" className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${inp}`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Type *</label>
              <select value={uploadType} onChange={e => setUploadType(e.target.value as any)} className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${inp}`}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Issued By</label>
              <input value={uploadIssuedBy} onChange={e => setUploadIssuedBy(e.target.value)} placeholder="e.g. Bureau Veritas" className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${inp}`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Issued Date</label>
              <input type="date" value={uploadIssuedAt} onChange={e => setUploadIssuedAt(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${inp}`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Expiry Date</label>
              <input type="date" value={uploadExpiresAt} onChange={e => setUploadExpiresAt(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${inp}`} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">File *</label>
              <input type="file" accept=".pdf,.doc,.docx,.xlsx" onChange={e => setUploadFile(e.target.files?.[0] || null)} className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none transition-colors ${inp} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-yellow-400 file:text-black`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowUpload(false); setUploadError(''); }} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>Cancel</button>
            <button onClick={handleUpload} disabled={uploading || !uploadTitle.trim() || !uploadFile} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Certs', value: stats.active, color: 'text-green-400', icon: CheckCircle },
          { label: 'Expiring Soon', value: stats.expiring, color: 'text-yellow-400', icon: AlertCircle },
          { label: 'Expired', value: stats.expired, color: 'text-red-400', icon: XCircle },
        ].map(stat => (
          <div key={stat.label} className={`p-6 rounded-2xl border flex items-center gap-5 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative flex items-center border rounded-lg ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className={`pl-9 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent w-56 ${isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeFilter === type
                  ? 'bg-yellow-400 text-black'
                  : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Document Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className={`grid grid-cols-12 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <span className="col-span-4">Document</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Expires</span>
          <span className="col-span-1">Issued By</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 gap-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No documents found</p>
          </div>
        ) : (
          filtered.map((doc, i) => {
            const s = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG['ACTIVE'];
            return (
              <div
                key={doc._id}
                className={`grid grid-cols-12 px-6 py-4 items-center border-b transition-colors ${
                  isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
                } ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
              >
                <div className="col-span-4 pr-4">
                  <p className={`text-[11px] font-black uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</p>
                  {doc.product && (
                    <p className="text-[9px] text-slate-500 font-bold mt-0.5">{doc.product.productName}</p>
                  )}
                </div>
                <span className={`col-span-2 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doc.type}</span>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.bg} ${s.color}`}>
                    <s.icon className="w-2.5 h-2.5" />
                    {s.label}
                  </span>
                </div>
                <span className={`col-span-2 text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : '—'}
                </span>
                <span className={`col-span-1 text-[9px] font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {doc.issuedBy || '—'}
                </span>
                <div className="col-span-1 flex justify-end items-center gap-1">
                  {(doc.status === 'EXPIRING_SOON' || doc.status === 'EXPIRED') && isAdmin && (
                    <button
                      onClick={() => {
                        setUploadTitle(doc.title);
                        setUploadType(doc.type);
                        setShowUpload(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      title="Upload replacement document"
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-yellow-400/10 text-yellow-500 hover:text-yellow-400' : 'hover:bg-yellow-50 text-yellow-500 hover:text-yellow-600'}`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {doc.documentUrl && (
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-500 hover:text-yellow-400' : 'hover:bg-slate-100 text-slate-400 hover:text-yellow-500'}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      disabled={deleting === doc._id}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                    >
                      {deleting === doc._id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
