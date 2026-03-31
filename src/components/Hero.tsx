import React from 'react';

interface HeroProps {
  isDark: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isDark }) => (
  <section className={`relative h-[420px] w-full rounded-xl overflow-hidden group border ${isDark ? 'border-white/5' : 'border-slate-100'} transition-all duration-300 shadow-xl`}>
    <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-zinc-900 via-zinc-900/40' : 'from-slate-900 via-slate-900/40'} to-transparent z-10`}></div>
    <img 
      src="https://images.unsplash.com/photo-1684497404598-6e844dff9cde?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
      alt="Enterprise Infrastructure"
      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ${isDark ? 'grayscale opacity-60' : 'grayscale-0 opacity-80'}`}
      referrerPolicy="no-referrer"
    />
    <div className="relative z-20 flex flex-col justify-center h-full px-10 max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <span className="bg-yellow-400 text-black px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-sm">
          Infrastructure v4.1
        </span>
      </div>
      <h1 className="text-5xl font-black text-white leading-[0.9] tracking-tighter">
        Build <span className="text-yellow-400">Faster.</span> <br />
        Procure <span className="text-yellow-400">Smarter.</span>
      </h1>
      <p className="text-slate-300 text-base leading-snug font-medium max-w-xl">
        The unified operating system for global procurement. 
        Real-time supply chain intelligence for ambitious industrial projects.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button className="bg-yellow-400 text-black px-8 py-3.5 font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-yellow-300 transition-all shadow-xl">
          Launch Workspace
        </button>
        <button className="bg-white/5 backdrop-blur-xl text-white px-8 py-3.5 font-black text-[10px] uppercase tracking-widest rounded-sm border border-white/20 hover:bg-white/10 transition-all">
          View Catalog
        </button>
      </div>
    </div>
    <div className="absolute bottom-6 right-8 z-20 hidden lg:flex items-center gap-8">
      <div className="flex flex-col items-end text-white">
        <span className="text-[9px] text-slate-300 uppercase tracking-widest font-black">Active Projects</span>
        <span className="text-2xl font-black">1,240<span className="text-yellow-400">+</span></span>
      </div>
      <div className="w-px h-8 bg-white/20"></div>
      <div className="flex flex-col items-end text-white">
        <span className="text-[9px] text-slate-300 uppercase tracking-widest font-black">Global Suppliers</span>
        <span className="text-2xl font-black">45,000<span className="text-yellow-400">+</span></span>
      </div>
    </div>
  </section>
);
