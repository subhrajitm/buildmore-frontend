import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Plus, Trash2, Save, ToggleLeft, ToggleRight, Settings2, IndianRupee, Pencil, X, Check } from 'lucide-react';
import { Fee, getFees, saveFees, DEFAULT_FEES } from '../utils/fees';
import { formatPrice } from '../utils/currency';

const CONDITION_LABELS: Record<Fee['condition'], string> = {
  always: 'Always apply',
  min_items: 'Min. items in cart',
  min_amount: 'Min. order amount',
};

const EMPTY_FEE: Omit<Fee, 'id'> = {
  name: '',
  amount: 0,
  enabled: true,
  condition: 'always',
  conditionValue: undefined,
};

export const AdminSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [fees, setFees] = useState<Fee[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newFee, setNewFee] = useState<Omit<Fee, 'id'>>({ ...EMPTY_FEE });
  const [editFee, setEditFee] = useState<Omit<Fee, 'id'>>({ ...EMPTY_FEE });

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const field = isDark
    ? 'bg-zinc-800 border-white/10 text-white placeholder-slate-500 focus:border-yellow-400/60'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-yellow-400';

  useEffect(() => {
    setFees(getFees());
  }, []);

  const persist = (updated: Fee[]) => {
    setFees(updated);
    saveFees(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleFee = (id: string) => {
    persist(fees.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const deleteFee = (id: string) => {
    persist(fees.filter(f => f.id !== id));
  };

  const startEdit = (fee: Fee) => {
    setEditingId(fee.id);
    setEditFee({ name: fee.name, amount: fee.amount, enabled: fee.enabled, condition: fee.condition, conditionValue: fee.conditionValue });
  };

  const saveEdit = () => {
    if (!editingId || !editFee.name.trim()) return;
    persist(fees.map(f => f.id === editingId ? { ...f, ...editFee } : f));
    setEditingId(null);
  };

  const addFee = () => {
    if (!newFee.name.trim() || newFee.amount < 0) return;
    const fee: Fee = {
      ...newFee,
      id: Date.now().toString(),
      conditionValue: newFee.condition === 'always' ? undefined : (newFee.conditionValue ?? 0),
    };
    persist([...fees, fee]);
    setNewFee({ ...EMPTY_FEE });
    setShowAddForm(false);
  };

  const FeeFormFields = ({
    values,
    onChange,
  }: {
    values: Omit<Fee, 'id'>;
    onChange: (v: Omit<Fee, 'id'>) => void;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${mutedClass}`}>Fee Name *</label>
        <input
          value={values.name}
          onChange={e => onChange({ ...values, name: e.target.value })}
          placeholder="e.g. Handling Fee"
          className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${field}`}
        />
      </div>
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${mutedClass}`}>Amount (₹) *</label>
        <input
          type="number"
          min="0"
          value={values.amount}
          onChange={e => onChange({ ...values, amount: parseFloat(e.target.value) || 0 })}
          className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${field}`}
        />
      </div>
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${mutedClass}`}>Condition</label>
        <select
          value={values.condition}
          onChange={e => onChange({ ...values, condition: e.target.value as Fee['condition'], conditionValue: undefined })}
          className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${field}`}
        >
          <option value="always">Always apply</option>
          <option value="min_items">Min. items in cart</option>
          <option value="min_amount">Min. order amount (₹)</option>
        </select>
      </div>
      {values.condition !== 'always' && (
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${mutedClass}`}>
            {values.condition === 'min_items' ? 'Min. Items' : 'Min. Amount (₹)'}
          </label>
          <input
            type="number"
            min="0"
            value={values.conditionValue ?? ''}
            onChange={e => onChange({ ...values, conditionValue: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${field}`}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${textClass}`}>Other Fees</h1>
          <p className={`text-xs font-medium mt-1 ${mutedClass}`}>Configure additional fees applied at checkout based on conditions.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          <button
            onClick={() => persist([...DEFAULT_FEES])}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            Reset to Default
          </button>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-300 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Fee
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? 'bg-zinc-900 border-yellow-400/30' : 'bg-white border-yellow-400/50 shadow-lg'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>New Fee</p>
            <button onClick={() => setShowAddForm(false)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <FeeFormFields values={newFee} onChange={setNewFee} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              Cancel
            </button>
            <button
              onClick={addFee}
              disabled={!newFee.name.trim()}
              className="px-5 py-2 bg-yellow-400 text-black rounded-xl text-xs font-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
            >
              Add Fee
            </button>
          </div>
        </div>
      )}

      {/* Fees List */}
      {fees.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <Settings2 className="w-16 h-16 text-slate-300" />
          <p className={`text-sm font-black uppercase tracking-widest ${mutedClass}`}>No fees configured</p>
          <button onClick={() => setShowAddForm(true)} className="text-xs font-bold text-yellow-500 hover:underline">Add your first fee</button>
        </div>
      ) : (
        <div className="space-y-3">
          {fees.map(fee => {
            const isEditing = editingId === fee.id;
            return (
              <div key={fee.id} className={`rounded-2xl border transition-all ${cardBg} ${isEditing ? (isDark ? 'border-yellow-400/30' : 'border-yellow-400/50') : ''}`}>
                {!isEditing ? (
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${fee.enabled ? 'bg-yellow-400/10' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <IndianRupee className={`w-5 h-5 ${fee.enabled ? 'text-yellow-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black ${fee.enabled ? textClass : mutedClass}`}>{fee.name}</p>
                      <p className={`text-[10px] font-bold mt-0.5 ${mutedClass}`}>
                        {CONDITION_LABELS[fee.condition]}
                        {fee.condition !== 'always' && fee.conditionValue !== undefined
                          ? ` \u2265 ${fee.condition === 'min_amount' ? formatPrice(fee.conditionValue) : fee.conditionValue}`
                          : ''}
                      </p>
                    </div>
                    <p className={`text-lg font-black shrink-0 ${fee.enabled ? textClass : mutedClass}`}>{formatPrice(fee.amount)}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleFee(fee.id)}
                        title={fee.enabled ? 'Disable' : 'Enable'}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                      >
                        {fee.enabled
                          ? <ToggleRight className="w-5 h-5 text-yellow-400" />
                          : <ToggleLeft className={`w-5 h-5 ${mutedClass}`} />}
                      </button>
                      <button
                        onClick={() => startEdit(fee)}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFee(fee.id)}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Edit Fee</p>
                      <button onClick={() => setEditingId(null)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <FeeFormFields values={editFee} onChange={setEditFee} />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={!editFee.name.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-yellow-400 text-black rounded-xl text-xs font-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Condition Reference */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${mutedClass}`}>How conditions work</p>
        <div className="space-y-2">
          <p className={`text-xs ${mutedClass}`}>
            <span className={`font-bold ${textClass}`}>Always apply</span> — Fee is added to every order.
          </p>
          <p className={`text-xs ${mutedClass}`}>
            <span className={`font-bold ${textClass}`}>Min. items in cart</span> — Fee applies when the cart has at least N items.
          </p>
          <p className={`text-xs ${mutedClass}`}>
            <span className={`font-bold ${textClass}`}>Min. order amount</span> — Fee applies when the subtotal meets or exceeds the specified amount.
          </p>
        </div>
      </div>
    </div>
  );
};
