import React from 'react';

interface HeroProps {
  isDark: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isDark }) => (
  <section className={`relative h-[420px] w-full rounded-xl overflow-hidden group border ${isDark ? 'border-white/5' : 'border-slate-100'} transition-all duration-300 shadow-xl`}>
    <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-zinc-900 via-zinc-900/40' : 'from-slate-900 via-slate-900/40'} to-transparent z-10`}></div>
    <img 
      src="/images/buildhero.jpg" 
      alt="Enterprise Infrastructure"
      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ${isDark ? 'grayscale opacity-60' : 'grayscale-0 opacity-80'}`}
    />
    <div className="relative z-20 flex flex-col justify-center h-full px-10 max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <span className="bg-yellow-400 text-black px-4 py-1.5 text-xs font-bold rounded-full">
          Quality Construction Guaranteed
        </span>
      </div>
      <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
        Build <span className="text-yellow-400">Better.</span> <br />
        Buy <span className="text-yellow-400">Smarter.</span>
      </h1>
      <p className="text-slate-200 text-lg leading-relaxed font-medium max-w-xl">
        Your one-stop destination for high-quality construction materials. 
        Reliable delivery and competitive pricing for projects of any size.
      </p>
      <div className="flex items-center gap-4 pt-4">
        <button className="bg-yellow-400 text-black px-10 py-4 font-bold text-sm rounded-lg hover:bg-yellow-300 transition-all shadow-lg hover:scale-105 active:scale-95">
          Start Shopping
        </button>
        <button className="bg-white/10 backdrop-blur-md text-white px-10 py-4 font-bold text-sm rounded-lg border border-white/30 hover:bg-white/20 transition-all">
          Learn More
        </button>
      </div>
    </div>
    <div className="absolute bottom-8 right-10 z-20 hidden lg:flex items-center gap-10">
      <div className="flex flex-col items-end text-white">
        <span className="text-xs text-slate-300 font-bold mb-1">Projects Served</span>
        <span className="text-3xl font-black">1,240<span className="text-yellow-400">+</span></span>
      </div>
      <div className="w-px h-10 bg-white/20"></div>
      <div className="flex flex-col items-end text-white">
        <span className="text-xs text-slate-300 font-bold mb-1">Global Partners</span>
        <span className="text-3xl font-black">45,000<span className="text-yellow-400">+</span></span>
      </div>
    </div>
  </section>
);
