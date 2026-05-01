import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SLIDES = [
  {
    image: '/images/buildhero.jpg',
    tag: 'Enterprise Procurement',
    headline: 'Build Better.',
    headlineAccent: 'Buy Smarter.',
    sub: 'Your one-stop destination for high-quality construction materials — reliable delivery and competitive pricing for any project size.',
    cta: 'Shop Now',
    ctaTo: '/products',
  },
  {
    image: 'https://images.unsplash.com/photo-1581094120973-10d9be8a1290?q=80&w=2000&auto=format&fit=crop',
    tag: 'Bulk Orders',
    headline: 'More Volume.',
    headlineAccent: 'Better Pricing.',
    sub: 'Submit RFQs for bulk procurement and get competitive quotes from verified suppliers across 15+ material categories.',
    cta: 'Request Quote',
    ctaTo: '/rfqs',
  },
  {
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop',
    tag: '15+ Categories',
    headline: 'Everything',
    headlineAccent: 'On One Platform.',
    sub: 'From cement and tiles to electrical and plumbing — source all your construction materials from a single trusted marketplace.',
    cta: 'Browse Categories',
    ctaTo: '/products/categories',
  },
  {
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000&auto=format&fit=crop',
    tag: 'Fast Delivery',
    headline: 'Order Today.',
    headlineAccent: 'Deliver Tomorrow.',
    sub: 'Real-time shipment tracking and priority logistics ensure your materials arrive on time, every time.',
    cta: 'View Products',
    ctaTo: '/products',
  },
];

export const Hero: React.FC = () => {
  const { isDark } = useTheme();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className={`relative h-[180px] sm:h-[230px] md:h-[260px] w-full rounded-2xl overflow-hidden border ${isDark ? 'border-white/5' : 'border-slate-200'} shadow-xl`}>

      {/* ── Slides ── */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* BG image */}
          <img
            src={slide.image}
            alt={slide.headline}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${i === current ? 'scale-105' : 'scale-100'}`}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-5 sm:px-8 md:px-12 max-w-2xl space-y-1.5 sm:space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400/90">
              <span className="w-4 h-px bg-yellow-400" />
              {slide.tag}
            </span>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              {slide.headline}{' '}
              <span className="text-yellow-400">{slide.headlineAccent}</span>
            </h1>
            <p className="text-slate-300 text-[10px] sm:text-xs leading-relaxed font-medium max-w-md hidden sm:block line-clamp-2">
              {slide.sub}
            </p>
            <div className="pt-0.5 sm:pt-1">
              <Link
                to={slide.ctaTo}
                className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 sm:px-6 py-1.5 sm:py-2.5 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 active:scale-95"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-5 h-1.5 bg-yellow-400'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute top-3 right-3 z-20 text-[9px] font-black text-white/40 tabular-nums">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
};
