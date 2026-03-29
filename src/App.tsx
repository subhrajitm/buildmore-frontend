/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  ChevronDown, 
  Menu, 
  Star, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Send,
  Globe,
  Award,
  BarChart3,
  ArrowRight,
  Hammer,
  Zap,
  HardHat,
  Droplets,
  Trash2,
  Wrench,
  Paintbrush,
  Grid3X3
} from 'lucide-react';
import { motion } from 'motion/react';

// --- Mock Data ---

const CATEGORIES = [
  { name: 'Industrial Tools', icon: Hammer, desc: 'Power & hand tools' },
  { name: 'Electrical Systems', icon: Zap, desc: 'Wiring & control' },
  { name: 'Safety Gear', icon: HardHat, desc: 'PPE & site safety' },
  { name: 'Fluid Dynamics', icon: Droplets, desc: 'Pipes & valves' },
  { name: 'Janitorial', icon: Trash2, desc: 'Professional sanitation' },
  { name: 'Hardware', icon: Wrench, desc: 'Fasteners & fixtures' },
  { name: 'Coatings', icon: Paintbrush, desc: 'Paints & finishes' },
  { name: 'Tiling', icon: Grid3X3, desc: 'Ceramic & stone' },
];

const PRODUCTS = [
  {
    id: 1,
    name: 'PrecisionBrush Pro-Series Cordless Hammer Drill w/ 2x 5.0Ah Batteries',
    price: 284.99,
    originalPrice: 429.00,
    rating: 4.8,
    reviews: 1248,
    discount: '-34% OFF',
    bulkInfo: 'Bulk Price: $245.00 (10+ units)',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtasAoLJZNB18AMNnGiCcN1kr_G4sfoYoUhfr-QIktvdulhjzqnXlBtaQc-4xMTs7M4p5rwoauGl5sb600bAtYnfvQ6_PVX9VUpFmbRKfKrtz2L3ebL0ZpHpxp3k9_1ik8ZqbDt_RpOH7SCzRlHc6aXNsXKFFAQ5GJ_7PN4YxwQvQEJCjnK9JiXm4qdLCym9hhOtH0I7xn7VIxk1bBMDx8AnjPINumAaHftYUA29c4qHLJFJEMlMYCyxyin3AKOWGrIuaOn1nCvcTb',
  },
  {
    id: 2,
    name: 'Guardian Elite Vented Safety Helmet with 6-Point Suspension System',
    price: 42.50,
    unit: '/Unit',
    rating: 4.9,
    reviews: 856,
    tag: 'VERIFIED',
    claimed: 85,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkzKaySc_Bypd2WdDptO-0pUTEpUkfM4kymoT16b2QS1LJahsbFDxYHRVug2bg-xBz0ZwQ0opJo1IUjvT_RApdwdV3s2hXqZ3m6t7XZTpAei2HeTzvufZKvC0Itz5Yam-h8742_aS413j3Wy0fl62vOhgeipVE_r6pfdGmyVmrcfRnUnIZQamnSyqFwB1phH3OmzGJpfGfhwAJBl9ACK0pAeP9pU5nxz_4pAoSbzy7u7tHkAy1-FRHbCV0bLW4qa4nx-IRHbP2Xm9j',
  },
  {
    id: 3,
    name: 'CoreLogic 400A Main Breaker Load Center, 42-Circuit NEMA 3R',
    price: 1120.00,
    rating: 4.5,
    reviews: 42,
    bulkInfo: 'Ships LTL Freight',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxSP2J0A5FTZyHutfJWxJJujpDGdIWZ60RCgQ4iOn7hJiBqNhFlCHIJyEtyrgXMG9zrJhji7V12lrOCcOXESMgz7BMBbhxNOvuFp8A1hZOLIbaNmHG_2qNobksY__lw5c5VImitDHzQFQAUdrui0i1N5pJI1W2Ciepa1XcnJ8i44pFT3EB2RmXCVz_GjH_YpudTSNMgGjpvujbsSZ4Iph0aYcaMPBU2uw72T9XI6TNbe4XJic9clu3ln2KWZZ77o_qdATVT34VAJ3X',
    isTechnical: true,
  },
  {
    id: 4,
    name: 'TerraForce Waterproof Composite Toe 8" Logger Boots',
    price: 189.95,
    rating: 5.0,
    reviews: 12,
    tag: 'NEW ARRIVAL',
    shipping: 'Free Expedited Shipping',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr5sGNOnvg7EtRLX7wk5rbQFWEnlPM4w-08o1W2T8EUqBGVYswvKnW5eo96dh60Kyc5Oi2QiojElp-u7z3Jjq9waSaNcsz8F3c5iuOiKsgjKZxKaTwmofl_pfr_pbc4eFhNUza5LVvx9rKSi08zCdWYmOeWbgqSo2WDDeBkIgnkyGm8kZ7V_4TF_bVP00Q_KzcKHqAag_oRyns4iFO_1sIbY2978bcsfo3qYI9sQ6xq7kLORBpTYa8ix0s7siZRUgnrkEHKWfLRHsy',
  },
];

const TESTIMONIALS = [
  {
    quote: "The 'Price Engine' tool has revolutionized our procurement cycle. Being able to compare bulk rates with technical specs in one view is unmatched.",
    author: "David Chen",
    role: "Director of Operations, BuildGlobal",
  },
  {
    quote: "Unrivaled reliability for safety gear. Their compliance documentation is always perfect, which makes site audits completely stress-free.",
    author: "Elena Rodriguez",
    role: "HSE Compliance Officer, SkyRise Corp",
  },
  {
    quote: "Finally, an enterprise e-commerce platform that understands high-density data. The UI is clean, functional, and lightning fast.",
    author: "Marcus Thorne",
    role: "Principal Architect, Thorne & Partners",
  },
];

// --- Components ---

const Header = () => (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
    <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between gap-8">
      <div className="flex items-center gap-8">
        <span className="text-xl font-extrabold tracking-tighter text-gray-900">Architectural Curator</span>
        <div className="hidden lg:flex items-center gap-2 group cursor-pointer">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] leading-tight text-gray-500 uppercase font-bold tracking-wider">Deliver to</span>
            <span className="text-xs font-bold leading-tight">London SE1</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-4">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Search bulk inventory, technical specs, or industrial tools..."
            className="w-full bg-gray-100 border-none rounded-sm px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#8a5100] transition-all"
          />
          <button className="absolute right-0 top-0 h-full px-5 bg-[#8a5100] text-white rounded-r-sm hover:opacity-90 transition-opacity">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="hidden xl:flex items-center gap-6 text-gray-600">
          <a href="#" className="hover:text-gray-900 transition-colors">Bulk Orders</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Price Engine</a>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col cursor-pointer group">
            <span className="text-[10px] leading-tight text-gray-500">Hello, Sign in</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">Account & Lists</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          
          <div className="flex flex-col cursor-pointer">
            <span className="text-[10px] leading-tight text-gray-500">Returns</span>
            <span className="text-xs font-bold">& Orders</span>
          </div>
          
          <div className="relative flex items-center gap-2 cursor-pointer text-[#fe9800]">
            <div className="relative">
              <ShoppingCart className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 bg-[#8a5100] text-white text-[10px] font-bold px-1.5 rounded-full">0</span>
            </div>
            <span className="text-xs font-bold self-end mb-1 text-gray-900">Cart</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const SubNav = () => (
  <nav className="bg-gray-50 border-b border-gray-200 py-2.5 px-6 overflow-x-auto">
    <div className="max-w-[1920px] mx-auto flex items-center gap-8 whitespace-nowrap">
      <button className="flex items-center gap-2 font-bold text-sm text-gray-900">
        <Menu className="w-4 h-4" />
        All
      </button>
      <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
        <a href="#" className="text-[#fe9800] border-b-2 border-[#fe9800] pb-0.5">Industrial Tools</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Safety Gear</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Electrical</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Plumbing</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Hardware</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Janitorial</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Technical Specs</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Store Locator</a>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative h-[520px] w-full rounded-xl overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-[#101c2b]/95 via-[#101c2b]/50 to-transparent z-10"></div>
    <img 
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjgxB88i2YGyAKUvYxDKj0Tqp0ZSMr9P5RFtjQwrBm0xXDr3sjp6JYmuL517rssmuFuIKc3yn9mkd510L77AsM-bBlKjX_CWJuELwTQnv_4HGP72TUVS7Phg7Fg8AuKIRxMHNIQlmTR5pUSexMNaZ8lQMOPQS8rxU1xUbQzoliYZ2PpxYsIIBbuL1zXE7-o4qMkXSQ0h9M6dDb0uQHW3Y_vLlG113UXvBnECv1YYbwQAG-cqACiGUBViOQnSMDEWGqSQAF4S-k5Z7O" 
      alt="Enterprise Construction"
      className="absolute inset-0 w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
    <div className="relative z-20 flex flex-col justify-center h-full px-16 max-w-3xl space-y-8">
      <motion.span 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#fe9800] text-[#643900] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] inline-block w-fit rounded-sm"
      >
        Bulk Procurement Launch
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-6xl font-black text-white leading-[1.05] tracking-tighter"
      >
        Precision Engineering for <br />
        <span className="text-[#fe9800]">Enterprise Scale</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-200 text-xl leading-relaxed font-medium"
      >
        Access wholesale rates on certified industrial components. <br />
        Verified supply chains for high-volume architectural projects.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-5 pt-4"
      >
        <button className="bg-[#8a5100] text-white px-10 py-4 font-bold rounded-sm hover:bg-[#693c00] transition-all shadow-2xl hover:scale-105 active:scale-95">
          Request Quote
        </button>
        <button className="bg-white/10 backdrop-blur-xl text-white px-10 py-4 font-bold rounded-sm border border-white/20 hover:bg-white/20 transition-all">
          View Catalog
        </button>
      </motion.div>
    </div>
  </section>
);

const CategoryGrid = () => (
  <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-5">
    <div className="col-span-1 md:col-span-2 row-span-2 bg-white p-8 rounded-sm shadow-sm flex flex-col justify-between border border-gray-100">
      <div>
        <h3 className="text-2xl font-black tracking-tight mb-3 text-gray-900">Architectural Cement</h3>
        <p className="text-gray-500 text-sm leading-relaxed">High-performance structural binders for foundation and facade.</p>
      </div>
      <div className="mt-8 flex justify-center">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1Ur_IquW29XBeVXFVPHlUahxllMVQVezmE5brWVXhRcOkTth-3r8qGOR3nU8BROJNMtJc864mDXufWOicwAMrvBERrGfoP53_F5YJzZ6Ske4FhHJVNscG-2HNryrq5frBNovVIz_kAsfdDnK43eAasyVwaudS1eOfSpnwSfhKVYHd6UhWIbXdjq_Yx1XSMa6WYGG7kDw3hr7ENOekapZzHIIlSEEHEKkAWNjWs3XD64bE3ai2X5TvYPkA7Uy0UxrQZOrGfusea92m" 
          alt="Cement Bag" 
          className="w-48 h-48 object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <a href="#" className="text-[#8a5100] text-sm font-black mt-6 flex items-center gap-2 hover:translate-x-1 transition-transform">
        Explore Structural Components <ArrowRight className="w-4 h-4" />
      </a>
    </div>

    {CATEGORIES.map((cat, idx) => (
      <div key={idx} className="bg-white p-6 rounded-sm shadow-sm group cursor-pointer hover:bg-gray-50 transition-all border border-gray-100 flex flex-col items-start">
        <div className="bg-gray-50 p-3 rounded-sm mb-4 group-hover:bg-white transition-colors">
          <cat.icon className="w-7 h-7 text-[#8a5100]" />
        </div>
        <h4 className="font-bold text-sm text-gray-900">{cat.name}</h4>
        <p className="text-[11px] text-gray-500 mt-1 font-medium">{cat.desc}</p>
      </div>
    ))}
  </section>
);

const ProductCard: React.FC<{ product: any }> = ({ product }) => (
  <div className="bg-white rounded-sm shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-shadow group">
    <div className="relative h-56 bg-gray-50 flex items-center justify-center p-8">
      <img 
        src={product.image} 
        alt={product.name} 
        className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      {product.discount && (
        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-sm">
          {product.discount}
        </span>
      )}
      {product.tag && (
        <span className={`absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-sm ${product.tag === 'VERIFIED' ? 'bg-[#8a5100]' : 'bg-[#fe9800]'}`}>
          {product.tag}
        </span>
      )}
    </div>
    <div className="p-5 flex-1 flex flex-col space-y-3">
      <h3 className="font-bold text-sm line-clamp-2 text-gray-900 leading-snug h-10">
        {product.name}
      </h3>
      <div className="flex items-center gap-1.5">
        <div className="flex text-[#fe9800]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
          ))}
        </div>
        <span className="text-[10px] text-gray-400 font-bold">({product.reviews.toLocaleString()})</span>
      </div>
      <div className="pt-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through font-medium">${product.originalPrice.toFixed(2)}</span>
          )}
          {product.unit && <span className="text-xs text-gray-400 font-medium">{product.unit}</span>}
        </div>
        {product.bulkInfo && (
          <div className="bg-blue-50 text-blue-900 text-[10px] font-bold px-2 py-1 rounded-sm inline-block mt-2">
            {product.bulkInfo}
          </div>
        )}
        {product.claimed && (
          <div className="mt-3">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#fe9800] h-full" style={{ width: `${product.claimed}%` }}></div>
            </div>
            <p className="text-[10px] text-[#fe9800] font-black mt-1.5 uppercase tracking-wider">{product.claimed}% claimed</p>
          </div>
        )}
        {product.shipping && (
          <p className="text-[10px] text-green-600 font-black mt-2 flex items-center gap-1">
            <Truck className="w-3 h-3" /> {product.shipping}
          </p>
        )}
      </div>
      <div className="pt-4 mt-auto">
        {product.isTechnical ? (
          <button className="w-full bg-gray-100 text-gray-900 text-xs font-bold py-2.5 rounded-sm hover:bg-gray-200 transition-colors">
            Request Technical Specs
          </button>
        ) : (
          <div className="flex gap-2">
            <select className="text-xs border-gray-200 bg-gray-50 rounded-sm py-2 px-2 focus:ring-[#8a5100] w-16 font-bold">
              <option>1</option>
              <option>5</option>
              <option>10</option>
            </select>
            <button className="flex-1 bg-[#8a5100] text-white text-xs font-bold py-2.5 rounded-sm hover:opacity-90 transition-opacity">
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

const TrustSignals = () => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-y border-gray-100">
    <div className="flex gap-5">
      <div className="bg-orange-50 p-4 rounded-sm h-fit">
        <ShieldCheck className="w-8 h-8 text-[#fe9800]" />
      </div>
      <div>
        <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider mb-2">Certified Supply Chain</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">Every item in our inventory is sourced directly from verified manufacturers with full SDS compliance.</p>
      </div>
    </div>
    <div className="flex gap-5">
      <div className="bg-orange-50 p-4 rounded-sm h-fit">
        <Truck className="w-8 h-8 text-[#fe9800]" />
      </div>
      <div>
        <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider mb-2">Industrial Logistics</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">Integrated freight management for LTL and full container shipments worldwide. Site-ready deliveries.</p>
      </div>
    </div>
    <div className="flex gap-5">
      <div className="bg-orange-50 p-4 rounded-sm h-fit">
        <Headphones className="w-8 h-8 text-[#fe9800]" />
      </div>
      <div>
        <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider mb-2">Engineering Support</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">Dedicated account managers and technical specialists available for project-specific consultations.</p>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#101c2b] text-gray-400 pt-20 pb-10">
    <div className="max-w-[1920px] mx-auto px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
        <div className="col-span-1 lg:col-span-2">
          <span className="text-2xl font-black text-white block mb-6 tracking-tighter">Architectural Curator</span>
          <p className="text-xs leading-relaxed max-w-xs mb-8 font-medium">
            The leading destination for enterprise-grade architectural supplies and industrial tools. Verified manufacturers, global logistics, and technical precision.
          </p>
          <div className="flex gap-5">
            <Globe className="w-5 h-5 hover:text-[#fe9800] cursor-pointer transition-colors" />
            <Award className="w-5 h-5 hover:text-[#fe9800] cursor-pointer transition-colors" />
            <BarChart3 className="w-5 h-5 hover:text-[#fe9800] cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h5 className="text-white font-black text-xs uppercase tracking-widest mb-6">Quick Links</h5>
          <ul className="space-y-3 text-xs font-bold">
            <li><a href="#" className="hover:text-white transition-colors">Bulk Orders</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Price Engine</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Technical Specs</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Store Locator</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="text-white font-black text-xs uppercase tracking-widest mb-6">Support</h5>
          <ul className="space-y-3 text-xs font-bold">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Rates</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Returns & Orders</a></li>
            <li><a href="#" className="hover:text-white transition-colors">SDS Sheets</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="text-white font-black text-xs uppercase tracking-widest mb-6">Compliance</h5>
          <ul className="space-y-3 text-xs font-bold">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Wholesale Login</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Certifications</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className="text-white font-black text-xs uppercase tracking-widest mb-6">Newsletter</h5>
          <p className="text-[11px] font-medium">Get technical updates and bulk pricing alerts.</p>
          <div className="flex group">
            <input 
              type="email" 
              placeholder="Email" 
              className="bg-white/5 border-none rounded-l-sm text-xs py-3 px-4 w-full focus:ring-1 focus:ring-[#fe9800] text-white"
            />
            <button className="bg-[#fe9800] text-[#643900] px-4 rounded-r-sm hover:bg-[#ffb86f] transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-10 text-center">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-600">
          © 2024 Architectural Curator Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col font-sans selection:bg-[#fe9800] selection:text-white">
      <Header />
      <SubNav />
      
      <main className="max-w-[1920px] mx-auto px-6 py-8 space-y-16 w-full">
        <Hero />
        
        <CategoryGrid />

        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900">Enterprise Flash Drops</h2>
              <p className="text-gray-500 font-medium mt-1">Bulk inventory liquidation. Limited time availability.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-sm border border-orange-100">
                <span className="text-[10px] font-black text-[#643900] uppercase tracking-widest">Ending In:</span>
                <span className="text-sm font-mono font-black text-[#8a5100]">08:42:12</span>
              </div>
              <a href="#" className="text-sm font-black text-[#8a5100] hover:underline flex items-center gap-1">
                View All Drops <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <TrustSignals />

        <section className="space-y-12 pb-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tighter text-gray-900">The Professional's Choice</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-medium">Powering infrastructure projects across 40 countries with reliable architectural curation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex text-[#fe9800] mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-sm italic text-gray-600 leading-relaxed font-medium">"{t.quote}"</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-black text-gray-400">{t.author.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{t.author}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
