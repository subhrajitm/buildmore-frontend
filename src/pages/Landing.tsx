import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { TrustSignals } from '../components/TrustSignals';
import { productApi, BackendProduct } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';

interface LandingProps {
  isDark: boolean;
}

const FLASH_OFFERS = [
  {
    id: 1,
    title: 'Weekend Construction Bumper',
    tag: 'Limited Time',
    discount: 'Extra 15% OFF',
    desc: 'Get an additional discount on all structural steel and power tools over $500.',
    color: 'from-orange-600 to-red-700',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Bulk Infrastructure Blowout',
    tag: 'Bumper Offer',
    discount: 'Buy 5, Get 1 FREE',
    desc: 'On all safety equipment and sitewide hardware kits. Stock up for your next project.',
    color: 'from-blue-700 to-indigo-900',
    image: 'https://images.unsplash.com/photo-1581094120973-10d9be8a1290?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Premium Project Pack',
    tag: 'Flash Deal',
    discount: 'Flat $500 Cashback',
    desc: 'When you finalize your first procurement order over $5,000 this month.',
    color: 'from-emerald-700 to-teal-900',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000&auto=format&fit=crop',
  },
];

export const Landing: React.FC<LandingProps> = ({ isDark }) => {
  const [featured, setFeatured] = useState<BackendProduct[]>([]);

  useEffect(() => {
    productApi.getAll()
      .then(res => setFeatured((res.products || []).slice(0, 8)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <Hero isDark={isDark} />

      <CategoryGrid isDark={isDark} />

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-[2px] bg-yellow-400"></span>
              <span className="text-xs font-bold text-yellow-400">Featured Deals</span>
            </div>
            <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Best Infrastructure Offers</h2>
          </div>
          <div className="flex items-center gap-6">
             <Link to="/products" className={`text-xs font-bold hover:text-yellow-400 transition-all flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {featured.length === 0 ? (
          <div className={`flex items-center justify-center py-24 rounded-2xl border ${isDark ? 'border-white/5 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map(product => (
              <ProductCard key={product._id} product={normalizeProduct(product)} isDark={isDark} />
            ))}
          </div>
        )}
      </section>

      <TrustSignals isDark={isDark} />

      <BumperSlider isDark={isDark} />
    </>
  );
};

const BumperSlider: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FLASH_OFFERS.length);
      setProgress(0);
    }, 6000);
    
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / 60), 100));
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [activeSlide]);

  return (
    <section className="pb-12 relative overflow-hidden font-primary">
      <div className="flex items-end justify-between mb-6 px-2">
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-[2.5px] bg-yellow-400 rounded-full"></span>
            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.4em]">Exclusive Deals</span>
          </div>
          <h2 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Bumper <span className="text-yellow-400 italic">Offers</span></h2>
        </div>
        <div className="flex items-center gap-3 mb-1">
          {FLASH_OFFERS.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => { setActiveSlide(idx); setProgress(0); }}
              className="group relative h-8 w-8 flex items-center justify-center underline-offset-4"
            >
              <span className={`absolute inset-0 rounded-full border transition-all duration-500 ${activeSlide === idx ? 'border-yellow-400 scale-110' : 'border-slate-300 dark:border-white/10 opacity-50'}`} />
              <span className={`text-[9px] font-black transition-colors ${activeSlide === idx ? 'text-yellow-400' : 'text-slate-400'}`}>0{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[430px] w-full rounded-[32px] overflow-hidden shadow-2xl group">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 z-40 bg-white/10">
          <div 
            className="h-full bg-yellow-400 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {FLASH_OFFERS.map((offer, idx) => (
          <div 
            key={offer.id}
            className={`absolute inset-0 transition-all duration-[1000ms] ${activeSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
          >
            {/* Background elements */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${offer.color} opacity-70 z-10`} />
            <div className="absolute inset-0 bg-black/40 z-[5]" />
            <img 
              src={offer.image} 
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[6000ms] ease-linear brightness-110 contrast-[1.1] ${activeSlide === idx ? 'scale-110' : 'scale-100'}`}
              alt={offer.title}
            />
            
            <div className="relative z-30 h-full flex flex-col justify-center px-10 md:px-16 max-w-4xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-yellow-400 text-black px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md">
                  {offer.tag}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">Flash active</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-black mb-2 leading-[1.1] tracking-tighter">
                {offer.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-yellow-400 italic' : ''}>{word}{' '}</span>
                ))}
              </h3>

              <div className="relative mb-3">
                <p className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 drop-shadow-xl italic -ml-1">
                  {offer.discount}
                </p>
              </div>

              <p className="text-sm md:text-base font-medium text-white/90 mb-6 max-w-xl leading-relaxed border-l-2 border-yellow-400/50 pl-4">
                {offer.desc}
              </p>

              <div className="flex items-center gap-6">
                <button className="bg-white text-black px-8 py-3.5 rounded-xl font-black text-[11px] transition-all shadow-xl hover:bg-yellow-400 hover:scale-105 active:scale-95">
                  Claim Offer
                </button>
                
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Time left</span>
                    <span className="text-lg font-mono font-black text-yellow-400">02:14:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-4 right-4 z-40 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => { setActiveSlide((v) => (v - 1 + FLASH_OFFERS.length) % FLASH_OFFERS.length); setProgress(0); }}
            className="w-10 h-10 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-yellow-400 hover:text-black transition-all hover:scale-110"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <button 
            onClick={() => { setActiveSlide((v) => (v + 1) % FLASH_OFFERS.length); setProgress(0); }}
            className="w-10 h-10 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-yellow-400 hover:text-black transition-all hover:scale-110"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
