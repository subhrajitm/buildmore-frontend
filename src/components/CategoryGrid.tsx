import React from 'react';
import { Link } from 'react-router-dom';
import { ALL_CATEGORIES, getCategoryMeta } from '../utils/categoryMeta';

interface CategoryGridProps {
  isDark: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ isDark }) => {
  return (
    <section className="py-5 font-primary">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
        {ALL_CATEGORIES.map((name) => {
          const cat = getCategoryMeta(name);
          return (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 border-2 ${
                isDark
                  ? 'bg-zinc-800 border-transparent group-hover:border-yellow-400/50 group-hover:bg-zinc-700'
                  : 'bg-slate-100 border-transparent group-hover:border-yellow-300 group-hover:bg-yellow-50'
              }`}>
                <cat.icon className={`w-8 h-8 transition-colors ${isDark ? 'text-slate-300 group-hover:text-yellow-400' : 'text-slate-600 group-hover:text-yellow-500'}`} />
              </div>
              <span className={`text-[11px] font-semibold text-center leading-tight px-1 transition-colors ${
                isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
              }`}>
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
