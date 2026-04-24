import React from 'react';

interface HeroProps {
  isDark: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isDark }) => (
  <section className={`relative h-[240px] w-full rounded-xl overflow-hidden border ${isDark ? 'border-white/5' : 'border-slate-100'} transition-all duration-300 shadow-lg`}>
    <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-zinc-900 via-zinc-900/50' : 'from-slate-900 via-slate-900/50'} to-transparent z-10`}></div>
    <img
      src="/images/buildhero.jpg"
      alt="Enterprise Infrastructure"
      className={`absolute inset-0 w-full h-full object-cover ${isDark ? 'grayscale opacity-60' : 'grayscale-0 opacity-80'}`}
    />
    <div className="relative z-20 flex flex-col justify-center h-full px-10 max-w-3xl space-y-3">
      <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
        Build <span className="text-yellow-400">Better.</span>{' '}
        Buy <span className="text-yellow-400">Smarter.</span>
      </h1>
      <p className="text-slate-300 text-sm leading-relaxed font-medium max-w-lg">
        Your one-stop destination for high-quality construction materials —
        reliable delivery and competitive pricing for any project size.
      </p>
      <div className="flex items-center gap-3 pt-1">
        <button className="bg-yellow-400 text-black px-7 py-2.5 font-bold text-sm rounded-lg hover:bg-yellow-300 transition-all shadow-md hover:scale-105 active:scale-95">
          Shop Now
        </button>
      </div>
    </div>
  </section>
);
