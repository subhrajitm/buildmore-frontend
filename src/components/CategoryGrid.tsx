import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryMeta } from '../utils/categoryMeta';
import { categoryApi, Category } from '../api';
import { useTheme } from '../context/ThemeContext';

// Fallback gradient per category (used when no image)
const CAT_GRADIENT: Record<string, string> = {
  'Cement & Concrete':            'from-orange-950 via-amber-900 to-orange-800',
  'Tiles and Flooring':           'from-blue-950 via-blue-900 to-slate-800',
  'Tiles & Flooring':             'from-blue-950 via-blue-900 to-slate-800',
  'Paints & Finishes':            'from-purple-950 via-violet-900 to-fuchsia-900',
  'Construction Chemicals':       'from-emerald-950 via-teal-900 to-emerald-800',
  'Plywood, Laminates & Boards':  'from-amber-950 via-yellow-900 to-amber-800',
  'Doors & Windows':              'from-cyan-950 via-sky-900 to-slate-800',
  'Hardware & Fittings':          'from-zinc-900 via-slate-800 to-zinc-700',
  'Kitchen & Wardrobe Solutions': 'from-rose-950 via-pink-900 to-rose-800',
  'Tools & Equipment':            'from-yellow-950 via-amber-900 to-yellow-800',
  'Electrical':                   'from-yellow-950 via-orange-900 to-amber-800',
  'Lighting & Fans':              'from-amber-900 via-yellow-800 to-amber-700',
  'Electrical Infrastructure':    'from-blue-950 via-indigo-900 to-blue-800',
  'Plumbing':                     'from-teal-950 via-cyan-900 to-teal-800',
  'Sanitary & Bath':              'from-sky-950 via-cyan-900 to-sky-800',
  'Bathware & Sanitaryware':      'from-sky-950 via-blue-900 to-sky-800',
  'uPVC Plumbing':                'from-teal-950 via-emerald-900 to-teal-800',
};

const DEFAULT_GRADIENT = 'from-zinc-900 via-slate-800 to-zinc-700';

const CARD_W = 140; // px — card width
const CARD_GAP = 10; // px — gap between cards

export const CategoryGrid: React.FC = () => {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setCategories(res.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener('scroll', updateArrows);
  }, [updateArrows, categories]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(CARD_W + CARD_GAP) * 3 : (CARD_W + CARD_GAP) * 3, behavior: 'smooth' });
  };

  return (
    <section className="py-3 font-primary relative">
      {/* Left fade + arrow */}
      <div className={`absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: isDark ? 'linear-gradient(to right, #09090b, transparent)' : 'linear-gradient(to right, #ffffff, transparent)' }}
      />
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Right fade + arrow */}
      <div className={`absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: isDark ? 'linear-gradient(to left, #09090b, transparent)' : 'linear-gradient(to left, #ffffff, transparent)' }}
      />
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-[10px] overflow-x-auto scrollbar-none pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`shrink-0 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-slate-200'} animate-pulse`}
                style={{ width: CARD_W, height: Math.round(CARD_W * 1.25) }}
              />
            ))
          : categories.map((cat) => {
              const meta = getCategoryMeta(cat.name);
              const hasImage = cat.image && !failedImages.has(cat.image);
              const gradient = CAT_GRADIENT[cat.name] || DEFAULT_GRADIENT;

              return (
                <Link
                  key={cat._id}
                  to={`/products/${cat.slug}`}
                  className="group relative shrink-0 rounded-2xl overflow-hidden block"
                  style={{ width: CARD_W, height: Math.round(CARD_W * 1.25) }}
                >
                  {/* Background */}
                  {hasImage ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      onError={() => cat.image && setFailedImages(prev => new Set(prev).add(cat.image!))}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                  )}

                  {/* Bottom vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  {/* Icon */}
                  <div className="absolute top-2.5 left-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center transition-all duration-300 group-hover:bg-yellow-400/25 group-hover:border-yellow-400/40">
                      <meta.icon className="w-3.5 h-3.5 text-white/80 group-hover:text-yellow-300 transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Arrow on hover */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                    <div className="w-5 h-5 rounded-lg bg-yellow-400 flex items-center justify-center">
                      <ArrowRight className="w-2.5 h-2.5 text-black" />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white font-black text-[10px] uppercase tracking-wide leading-tight line-clamp-2">
                      {cat.name}
                    </p>
                    {cat.subcategories?.length > 0 && (
                      <p className="text-white/40 text-[8px] font-semibold mt-0.5">
                        {cat.subcategories.length} types
                      </p>
                    )}
                  </div>

                  {/* Ring border */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-yellow-400/40 transition-all duration-300" />
                </Link>
              );
            })}
      </div>
    </section>
  );
};