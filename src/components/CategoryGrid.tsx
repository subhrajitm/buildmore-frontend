import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryMeta } from '../utils/categoryMeta';
import { categoryApi, Category } from '../api';

interface CategoryGridProps {
  isDark: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ isDark }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setCategories(res.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeletonClass = isDark ? 'bg-zinc-800 animate-pulse' : 'bg-slate-200 animate-pulse';

  return (
    <section className="py-5 font-primary">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
        {loading
          ? Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-full aspect-square rounded-2xl ${skeletonClass}`} />
                <div className={`h-3 w-14 rounded ${skeletonClass}`} />
              </div>
            ))
          : categories.map((cat) => {
              const meta = getCategoryMeta(cat.name);
              return (
                <Link
                  key={cat._id}
                  to={`/products/${cat.slug}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`relative w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 border-2 overflow-hidden ${
                    isDark
                      ? 'bg-zinc-800 border-transparent group-hover:border-yellow-400/50 group-hover:bg-zinc-700'
                      : 'bg-slate-100 border-transparent group-hover:border-yellow-300 group-hover:bg-yellow-50'
                  }`}>
                    {cat.image
                      ? (
                        <>
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        </>
                      )
                      : <meta.icon className={`w-8 h-8 transition-colors ${isDark ? 'text-slate-300 group-hover:text-yellow-400' : 'text-slate-600 group-hover:text-yellow-500'}`} />
                    }
                  </div>
                  <span className={`text-[11px] font-semibold text-center leading-tight px-1 transition-colors ${
                    isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
                  }`}>
                    {cat.name}
                  </span>
                </Link>
              );
            })
        }
      </div>
    </section>
  );
};
