import React from 'react';
import { Settings, User, Bell, Shield, Award, Package, Clock, BarChart, ChevronRight } from 'lucide-react';

interface ProfileProps {
  isDark: boolean;
}

export const Profile: React.FC<ProfileProps> = ({ isDark }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1.5px] bg-yellow-400"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400">Enterprise Profile</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border cursor-pointer hover:bg-yellow-400 hover:text-black transition-colors ${isDark ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <Settings className="w-4 h-4" />
          </div>
          <div className={`p-2 rounded-lg border cursor-pointer hover:bg-yellow-400 hover:text-black transition-colors ${isDark ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <Bell className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-2xl border text-center space-y-4 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="w-20 h-20 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-3xl font-black text-black">BG</span>
            </div>
            <div>
              <h3 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>BuildGlobal</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise ID: #BG_0428</p>
            </div>
            <div className={`p-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-yellow-400' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>
              Verified Procurement Level 4
            </div>
          </div>
          
          <nav className="space-y-1">
            {[
              { label: 'Procurement History', icon: Clock },
              { label: 'Active Quotations', icon: Shield },
              { label: 'Enterprise Settings', icon: User },
              { label: 'Compliance Documents', icon: Award },
            ].map(item => (
               <button key={item.label} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'}`}>
                <div className="flex items-center gap-4">
                   <item.icon className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
               </button>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-3 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Monthly Volume', value: '$1.42M', icon: BarChart },
              { label: 'Pending RFQs', value: '18 Units', icon: Package },
              { label: 'Verified Subs', value: '1,240', icon: Shield },
            ].map(stat => (
              <div key={stat.label} className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <stat.icon className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Updated: 2h ago</span>
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</h4>
                <p className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Active Project Logistics</h2>
            <div className="space-y-4">
              {[
                { name: 'SkyRise Phase 4 Structural Steel', status: 'In Transit - LTL', date: 'Arriving Apr 4' },
                { name: 'Global Hub Electrical Upgrade', status: 'Awaiting Quote Approval', date: 'Expires 24h' },
                { name: 'Sentinel Safety PPE Batch #42', status: 'Delivered - Verified', date: 'Mar 28' },
              ].map((project, i) => (
                <div key={i} className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#1a1a1a]' : 'bg-slate-50'}`}>
                       <Package className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{project.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.date}</p>
                    <button className="text-yellow-400 text-[9px] font-black uppercase tracking-widest mt-2 hover:text-yellow-300 transition-colors">Track Cargo</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
