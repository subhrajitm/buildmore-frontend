import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ChevronRight, Package, ArrowRight, Loader2, Search, Menu, X } from 'lucide-react';
import { categoryApi, Category, productApi, BackendProduct } from '../api';
import { getCategoryMeta } from '../utils/categoryMeta';
import { normalizeProduct } from '../utils/normalizeProduct';
import { formatPrice } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const AllCategories: React.FC = () => {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      categoryApi.getAll(),
      productApi.getAll()
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.categories || []);
      setProducts(prodRes.products || []);
      if (catRes.categories && catRes.categories.length > 0) {
        setActiveCategory(catRes.categories[0]);
      }
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const cardBg = isDark ? 'bg-zinc-900' : 'bg-white';
  const sidebarBg = isDark ? 'bg-zinc-950/50' : 'bg-slate-50';
  const borderClass = isDark ? 'border-white/5' : 'border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
        <p className={`text-xs font-black uppercase tracking-widest ${mutedClass}`}>Loading Material Catalog...</p>
      </div>
    );
  }

  const filteredSidebarCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const activeCategoryProducts = products.filter(p => {
    const pCat = typeof p.category === 'object' && p.category ? (p.category as any).name : p.category;
    return pCat === activeCategory?.name;
  });

  return (
    <div className={`max-w-[1920px] mx-auto flex h-[calc(100vh-120px)] overflow-hidden rounded-3xl border ${borderClass} ${cardBg} relative`}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 flex-shrink-0 border-r flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 md:z-auto
        ${sidebarBg} ${borderClass}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 space-y-4 border-b border-dashed border-white/5">
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${textClass}`}>
              <Layers className="w-4 h-4 text-yellow-400" />
              Categories
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`md:hidden p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-[10px] font-bold outline-none border transition-all ${
                isDark ? 'bg-zinc-900 border-white/10 text-white focus:border-yellow-400/50' : 'bg-white border-slate-200 text-slate-900 focus:border-yellow-400'
              }`}
            />
          </div>
        </div>
        <nav className="p-2">
          {filteredSidebarCategories.map((cat) => {
            const isActive = activeCategory?._id === cat._id;
            const meta = getCategoryMeta(cat.name);
            return (
              <button
                key={cat._id}
                onClick={() => { setActiveCategory(cat); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-left group ${
                  isActive 
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' 
                    : `${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isActive ? 'bg-black/10' : isDark ? 'bg-zinc-800' : 'bg-white shadow-sm'
                }`}>
                  <meta.icon className={`w-5 h-5 ${isActive ? 'text-black' : isDark ? 'text-slate-400 group-hover:text-yellow-400' : 'text-slate-500 group-hover:text-yellow-500'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight truncate">{cat.name}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-black/60' : mutedClass}`}>
                    {cat.subcategories.length} Types
                  </p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
        {activeCategory && (
          <>
            {/* Category Header */}
            <header className={`p-4 sm:p-6 md:p-8 border-b ${borderClass} flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-white/[0.02]`}>
              <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`md:hidden p-2 rounded-xl shrink-0 ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                >
                  <Menu className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20 shrink-0">
                  {(() => {
                    const meta = getCategoryMeta(activeCategory.name);
                    return <meta.icon className="w-5 h-5 md:w-7 md:h-7 text-black" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <nav className="hidden sm:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    <Link to="/" className="hover:text-yellow-400">Home</Link>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span>Categories</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span className="text-yellow-400 truncate">{activeCategory.name}</span>
                  </nav>
                  <h1 className={`text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tighter truncate ${textClass}`}>
                    {activeCategory.name} <span className="text-yellow-400">Products</span>
                  </h1>
                </div>
              </div>
              <Link
                to={`/products/${activeCategory.slug}`}
                className="flex items-center gap-2 bg-yellow-400 text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 shrink-0"
              >
                <span className="hidden sm:inline">Explore All</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
              {/* Subcategories horizontal scroll */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <button className="px-6 py-2 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg shadow-yellow-400/10">
                  All
                </button>
                {activeCategory.subcategories.map(sub => (
                  <button key={sub._id} className={`px-6 py-2 rounded-full border ${borderClass} ${isDark ? 'text-slate-400 hover:border-yellow-400/50 hover:text-white' : 'text-slate-600 hover:border-yellow-400 hover:text-slate-900'} text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all`}>
                    {sub.name}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {activeCategoryProducts.length > 0 ? (
                  activeCategoryProducts.map(p => {
                    const norm = normalizeProduct(p);
                    return (
                      <div key={p._id} className={`group flex flex-col rounded-2xl border ${borderClass} overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${isDark ? 'bg-zinc-900 hover:border-yellow-400/30' : 'bg-white hover:border-yellow-400'}`}>
                        <Link to={`/product/${p._id}`} className="relative aspect-square overflow-hidden bg-slate-100">
                          <img src={norm.image} alt={norm.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-3 left-3 right-3 translate-y-4 group-hover:translate-y-0 transition-transform">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                addItem(norm);
                              }}
                              className="w-full py-2 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-yellow-300"
                            >
                              Quick Add
                            </button>
                          </div>
                        </Link>
                        <div className="p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">{norm.category}</span>
                            <span className={`text-[9px] font-black ${p.stock > 0 ? 'text-green-500' : 'text-red-500'} uppercase`}>{p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                          </div>
                          <Link to={`/product/${p._id}`} className={`text-sm font-black line-clamp-1 group-hover:text-yellow-400 transition-colors ${textClass}`}>{norm.name}</Link>
                          <div className="flex items-center justify-between pt-2">
                            <span className={`text-lg font-black ${textClass}`}>{formatPrice(norm.price)}</span>
                            <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded text-yellow-500">
                              <Package className="w-3 h-3" />
                              <span className="text-[9px] font-black uppercase">{p.stock}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center gap-4">
                    <Package className="w-16 h-16 text-zinc-800" />
                    <div className="text-center">
                      <p className={`text-sm font-black uppercase tracking-widest ${textClass}`}>No products available</p>
                      <p className={`text-[10px] font-bold ${mutedClass} uppercase mt-1`}>Check back soon for new arrivals in {activeCategory.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
