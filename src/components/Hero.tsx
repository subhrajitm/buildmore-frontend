import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import { Banner } from '../api';

export const Hero: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const { isDark } = useTheme();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const prev = useCallback(() => goTo((current - 1 + (banners.length || 1)) % (banners.length || 1)), [current, goTo, banners.length]);
  const next = useCallback(() => goTo((current + 1) % (banners.length || 1)), [current, goTo, banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className={`relative h-[180px] sm:h-[230px] md:h-[260px] w-full rounded-2xl overflow-hidden border ${isDark ? 'border-white/5' : 'border-slate-200'} shadow-xl`}>

      {/* ── Slides ── */}
      {banners.map((slide, i) => (
        <div
          key={slide._id}
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
            {slide.tag && (
              <span className="inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400/90">
                <span className="w-4 h-px bg-yellow-400" />
                {slide.tag}
              </span>
            )}
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
        {banners.map((_, i) => (
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
        {String(current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
      </div>
    </section>
  );
};
