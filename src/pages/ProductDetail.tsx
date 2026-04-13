import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Truck, ChevronRight, FileText, Zap, Check, Plus, Minus, AlertCircle,
  Heart, Share2, Star, ShieldCheck, MapPin, ArrowLeft, ArrowRight
} from 'lucide-react';
import { productApi, specsApi, BackendProduct, SpecSheet } from '../api';
import { normalizeProduct } from '../utils/normalizeProduct';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

interface ProductDetailProps {
  isDark: boolean;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ isDark }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [raw, setRaw] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');
  const [specSheets, setSpecSheets] = useState<SpecSheet[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.getById(id)
      .then(res => setRaw(res.product))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
    specsApi.getByProduct(id)
      .then(res => setSpecSheets(res.specs || []))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-48">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !raw) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-4">
        <AlertCircle className="w-10 h-10 text-slate-500" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-500">{error || 'Product not found'}</p>
        <Link to="/products" className="text-yellow-400 text-[10px] font-black uppercase tracking-widest border border-yellow-400/20 px-8 py-3 rounded-full hover:bg-yellow-400/10 transition-colors">Back to Catalog</Link>
      </div>
    );
  }

  const product = normalizeProduct(raw);
  
  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const cardClass = isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200';
  const inputClass = isDark ? 'bg-zinc-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8">
        <Link to="/" className="hover:text-yellow-400">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-yellow-400">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className={isDark ? 'text-white' : 'text-slate-900'}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left - Image Gallery */}
        <div className="space-y-4">
          <div className={`relative aspect-square ${cardClass} rounded-2xl overflow-hidden border`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-8"
              referrerPolicy="no-referrer"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  {product.discount} OFF
                </span>
              )}
              {raw.stock === 0 && (
                <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  Out of Stock
                </span>
              )}
            </div>
            {/* Wishlist */}
            <button 
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:text-red-500 shadow-lg'}`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          {/* Thumbnail Navigation */}
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 flex gap-2 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <button 
                  key={i}
                  className={`w-16 h-16 rounded-lg border-2 flex-shrink-0 flex items-center justify-center ${i === 1 ? 'border-yellow-400' : isDark ? 'border-white/10' : 'border-slate-200'}`}
                >
                  <span className="text-xs text-slate-400">{i}</span>
                </button>
              ))}
            </div>
            <button className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right - Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                {product.category}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">({product.reviews || 0} reviews)</span>
                </div>
              )}
            </div>
            <h1 className={`text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {product.name}
            </h1>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {raw.desc || 'Premium quality industrial product designed for professional use. Engineered for durability and performance in demanding environments.'}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-slate-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {raw.stock > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-500">In Stock ({raw.stock} available)</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-red-500">Out of Stock</span>
              </>
            )}
          </div>

          {/* Bulk Pricing */}
          {product.bulkInfo && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Bulk Pricing Available</p>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.bulkInfo}</p>
                </div>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-500">Quantity:</span>
              <div className={`flex items-center gap-0 rounded-xl border overflow-hidden ${inputClass}`}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  className="px-4 py-3 hover:bg-yellow-400 hover:text-black transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-bold text-center min-w-[60px] border-x">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)} 
                  className="px-4 py-3 hover:bg-yellow-400 hover:text-black transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-400 text-black hover:bg-yellow-300'
                }`}
              >
                {added ? <><Check className="w-5 h-5" /> Added to Cart</> : <>Add to Cart</>}
              </button>
              <button
                onClick={() => navigate('/rfqs', { state: { productName: raw.productName, productId: raw._id } })}
                className={`px-5 rounded-xl border flex items-center justify-center transition-all ${isDark ? 'border-white/10 text-white hover:bg-white/10' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}
              >
                <FileText className="w-5 h-5" />
              </button>
              <button className={`px-5 rounded-xl border flex items-center justify-center transition-all ${isDark ? 'border-white/10 text-white hover:bg-white/10' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Shipping Info */}
          <div className={`pt-6 space-y-3 ${isDark ? 'border-t border-white/10' : 'border-t border-slate-200'}`}>
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-yellow-400" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Free shipping on orders over ₹42,000</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Ships from Mumbai Warehouse</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>2-Year Manufacturer Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16">
        <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {(['description', 'specs', 'shipping'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === tab 
                  ? isDark ? 'text-white' : 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'description' ? 'Description' : tab === 'specs' ? 'Specifications' : 'Shipping'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="max-w-3xl">
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {raw.desc || 'This premium industrial product is engineered to meet the highest standards of quality and performance. Designed for professional use in demanding environments, it features robust construction, precision engineering, and reliable operation. Ideal for construction, manufacturing, and industrial applications.'}
              </p>
              {product.bulkInfo && (
                <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
                  <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Bulk Orders</h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    For bulk orders of 10+ units, contact us for special pricing. We offer competitive rates for bulk procurement with flexible delivery schedules.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-3xl space-y-4">
              {[
                { label: 'Category', value: raw.category },
                { label: 'Material', value: raw.materialSpecifications || 'Standard' },
                { label: 'Availability', value: raw.availability ? 'In Stock' : 'Out of Stock' },
                { label: 'Stock', value: `${raw.stock} units` },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className="text-sm font-medium text-slate-500">{item.label}</span>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-4">
              {[
                { label: 'Shipping Method', value: 'Standard / Express LTL' },
                { label: 'Delivery Time', value: raw.stock > 0 ? '5-7 Business Days' : '14-21 Days (Backorder)' },
                { label: 'Shipping Cost', value: 'Free over ₹42,000' },
                { label: 'Warehouse', value: 'Mumbai, India' },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className="text-sm font-medium text-slate-500">{item.label}</span>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Technical Downloads */}
      {specSheets.length > 0 && (
        <div className="mt-12 pt-8 border-t border-dashed">
          <h3 className={`text-lg font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Technical Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specSheets.map(sheet => (
              <div key={sheet._id} className={`p-4 rounded-xl border flex items-center gap-4 ${cardClass}`}>
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-black text-xs font-bold">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{sheet.title}</p>
                  <p className="text-xs text-slate-500">{sheet.fileSize || 'PDF'}</p>
                </div>
                {sheet.fileUrl ? (
                  <a href={sheet.fileUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300">
                    <span className="text-xs font-bold">Download</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">N/A</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};