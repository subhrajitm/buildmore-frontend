import { BackendProduct } from '../api';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop';

/**
 * Maps a backend product to the shape expected by ProductCard and ProductDetail.
 */
export function normalizeProduct(p: BackendProduct) {
  return {
    id: p._id,
    name: p.productName,
    price: p.price,
    category: p.category,
    subcategory: p.subcategory ?? null,
    image: p.productImages && p.productImages.length > 0 && p.productImages[0].startsWith('http')
      ? p.productImages[0]
      : PLACEHOLDER_IMAGE,
    stock: p.stock,
    availability: p.availability,
    desc: p.desc,
    materialSpecifications: p.materialSpecifications,
    // Fields not in backend model — provide sensible defaults
    rating: null,
    reviews: null,
    originalPrice: null,
    bulkInfo: p.stock > 50 ? `Bulk Price Available (${p.stock} in stock)` : null,
    discount: null,
    tier: null,
    isTechnical: false,
    tag: !p.availability ? 'UNAVAILABLE' : p.stock === 0 ? 'OUT OF STOCK' : null,
  };
}
