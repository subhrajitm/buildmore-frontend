import React from 'react';
import { ShieldCheck, Truck, Headphones } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const TrustSignals: React.FC = () => {
  const { isDark } = useTheme();
  return (
  <section className={`grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y ${isDark ? 'border-white/5' : 'border-slate-100'} transition-colors duration-300`}>
    <div className="flex gap-4">
      <div className={`${isDark ? 'bg-white/5' : 'bg-slate-50'} p-4 rounded-lg h-fit text-yellow-400 shadow-sm`}>
        <ShieldCheck className="w-6 h-6" />
      </div>
      <div>
        <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Verified Sourcing</h4>
        <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">Automated SDS and compliance verification.</p>
      </div>
    </div>
    <div className="flex gap-4">
      <div className={`${isDark ? 'bg-white/5' : 'bg-slate-50'} p-4 rounded-lg h-fit text-yellow-400 shadow-sm`}>
        <Truck className="w-6 h-6" />
      </div>
      <div>
        <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Global Logistics</h4>
        <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">Integrated LTL/FTL tracking coordination.</p>
      </div>
    </div>
    <div className="flex gap-4">
      <div className={`${isDark ? 'bg-white/5' : 'bg-slate-50'} p-4 rounded-lg h-fit text-yellow-400 shadow-sm`}>
        <Headphones className="w-6 h-6" />
      </div>
      <div>
        <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Technical Support</h4>
        <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">24/7 engineering consultation.</p>
      </div>
    </div>
  </section>
  );
};
