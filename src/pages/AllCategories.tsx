import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ChevronRight, Package, ArrowRight, Loader2 } from 'lucide-react';
import { categoryApi, Category } from '../api';
import { getCategoryMeta } from '../utils/categoryMeta';

interface AllCategoriesProps {
  isDark: boolean;
}

export const AllCategories: React.FC<AllCategoriesProps> = ({ isDark }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setCategories(res.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cardBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
        <p className={`text-xs font-black uppercase tracking-widest ${mutedClass}`}>Building the Catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
          <Layers className="w-3 h-3" />
          Browse by Category
        </div>
        <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${textClass}`}>
          Material <span className="text-yellow-400">Categories</span>
        </h1>
        <p className={`max-w-2xl text-sm font-medium leading-relaxed ${mutedClass}`}>
          Explore our comprehensive catalog of industrial and construction materials, 
          carefully organized to help you find exactly what your project needs.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const meta = getCategoryMeta(cat.name);
          return (
            <Link 
              key={cat._id} 
              to={`/products/${cat.slug}`}
              className={`group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardBg} hover:border-yellow-400/30`}
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden bg-zinc-800">
                {cat.image ? (
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <meta.icon className="w-16 h-16 text-zinc-700 group-hover:text-yellow-400 transition-colors" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating Icon */}
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg">
                    <meta.icon className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-white text-lg font-black uppercase tracking-tight drop-shadow-md">
                    {cat.name}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <p className={`text-xs font-medium line-clamp-2 ${mutedClass}`}>
                  {cat.description || meta.desc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {cat.subcategories.slice(0, 3).map(sub => (
                    <span key={sub._id} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      {sub.name}
                    </span>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/5 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                      +{cat.subcategories.length - 3} More
                    </span>
                  )}
                </div>

                <div className="pt-4 mt-auto border-t border-dashed border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-yellow-400" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${mutedClass}`}>
                      Browse Products
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
