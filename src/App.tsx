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
    name: 'BuildMore X-Series Industrial Hammer Drill w/ Dual 5.0Ah Lithium-Ion Packs',
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
    name: 'BuildMore Sentinel V5 Vented Safety Helmet with 6-Point Suspension System',
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
    name: 'BuildMore GridMaster 400A Main Breaker Load Center, 42-Circuit NEMA 3R',
    price: 1120.00,
    rating: 4.5,
    reviews: 42,
    bulkInfo: 'Ships LTL Freight',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxSP2J0A5FTZyHutfJWxJJujpDGdIWZ60RCgQ4iOn7hJiBqNhFlCHIJyEtyrgXMG9zrJhji7V12lrOCcOXESMgz7BMBbhxNOvuFp8A1hZOLIbaNmHG_2qNobksY__lw5c5VImitDHzQFQAUdrui0i1N5pJI1W2Ciepa1XcnJ8i44pFT3EB2RmXCVz_GjH_YpudTSNMgGjpvujbsSZ4Iph0aYcaMPBU2uw72T9XI6TNbe4XJic9clu3ln2KWZZ77o_qdATVT34VAJ3X',
    isTechnical: true,
  },
  {
    id: 4,
    name: 'BuildMore Titan-Step Waterproof Composite Toe 8" Logger Boots',
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
  <header className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-slate-200/50">
    <div className="max-w-[1920px] mx-auto px-8 py-4 flex items-center justify-between gap-12">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">BuildMore</span>
        </div>
        <div className="hidden lg:flex items-center gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors">
          <MapPin className="w-5 h-5 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] leading-tight text-slate-500 uppercase font-black tracking-widest">Global Logistics</span>
            <span className="text-xs font-bold leading-tight text-slate-900">London Hub SE1</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl">
        <div className="relative flex items-center group">
          <div className="absolute left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search enterprise inventory, technical specifications, or project components..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none"
          />
          <div className="absolute right-3 flex items-center gap-2">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 text-sm font-bold">
        <div className="hidden xl:flex items-center gap-8 text-slate-600">
          <a href="#" className="hover:text-slate-900 transition-colors flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </a>
          <a href="#" className="hover:text-slate-900 transition-colors flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </a>
        </div>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col cursor-pointer group">
            <span className="text-[10px] leading-tight text-slate-500 uppercase tracking-widest">Enterprise ID</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">BuildGlobal_Admin</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
          </div>
          
          <div className="relative flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="p-2 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors">
                <ShoppingCart className="w-6 h-6 text-slate-900" />
              </div>
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                12
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Project Cart</span>
              <span className="text-xs font-black text-slate-900">$12,450.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const SubNav = () => (
  <nav className="bg-white border-b border-slate-200 py-3 px-8 overflow-x-auto">
    <div className="max-w-[1920px] mx-auto flex items-center justify-between">
      <div className="flex items-center gap-10 whitespace-nowrap">
        <button className="flex items-center gap-2 font-black text-xs text-slate-900 uppercase tracking-widest">
          <Menu className="w-4 h-4" />
          Project Directory
        </button>
        <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#" className="text-slate-900 border-b-2 border-slate-900 pb-1">Procurement</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Inventory</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Logistics</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Compliance</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Technical Specs</a>
          <a href="#" className="hover:text-slate-900 transition-colors">RFQs</a>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          System Status: Optimal
        </div>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative h-[600px] w-full rounded-2xl overflow-hidden group shadow-2xl">
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent z-10"></div>
    <img 
      src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=2070" 
      alt="Enterprise Infrastructure"
      className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
      referrerPolicy="no-referrer"
    />
    <div className="relative z-20 flex flex-col justify-center h-full px-20 max-w-4xl space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 rounded-full">
          Enterprise Solutions v4.0
        </span>
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-7xl font-black text-white leading-[0.95] tracking-tighter"
      >
        Build <span className="text-slate-400">Faster.</span> <br />
        Procure <span className="text-slate-400">Smarter.</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-300 text-2xl leading-relaxed font-medium max-w-2xl"
      >
        The unified operating system for global infrastructure procurement. 
        Real-time supply chain intelligence for the world's most ambitious projects.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-6 pt-6"
      >
        <button className="bg-white text-slate-950 px-12 py-5 font-black text-sm uppercase tracking-widest rounded-sm hover:bg-slate-200 transition-all shadow-xl hover:translate-y-[-2px] active:translate-y-[0px]">
          Launch Project Workspace
        </button>
        <button className="bg-white/5 backdrop-blur-xl text-white px-12 py-5 font-black text-sm uppercase tracking-widest rounded-sm border border-white/10 hover:bg-white/10 transition-all">
          View Infrastructure Catalog
        </button>
      </motion.div>
    </div>
    <div className="absolute bottom-10 right-10 z-20 hidden lg:flex items-center gap-10">
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Active Projects</span>
        <span className="text-3xl font-black text-white">1,240+</span>
      </div>
      <div className="w-px h-10 bg-white/20"></div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Global Suppliers</span>
        <span className="text-3xl font-black text-white">45,000+</span>
      </div>
    </div>
  </section>
);

const CategoryGrid = () => (
  <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
    <div className="col-span-1 md:col-span-2 row-span-2 bg-slate-950 p-10 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-[2px] bg-slate-400"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Featured Vertical</span>
        </div>
        <h3 className="text-4xl font-black tracking-tighter mb-4 text-white">Structural <br />Components</h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">High-performance structural binders and reinforced materials for global infrastructure.</p>
      </div>
      <div className="relative z-10 mt-8 flex justify-center">
        <img 
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000" 
          alt="Structural Materials" 
          className="w-full h-48 object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
      </div>
      <a href="#" className="relative z-10 text-white text-xs font-black mt-8 flex items-center gap-3 uppercase tracking-widest hover:gap-5 transition-all">
        Explore Vertical <ArrowRight className="w-4 h-4 text-slate-400" />
      </a>
    </div>

    {CATEGORIES.map((cat, idx) => (
      <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm group cursor-pointer hover:shadow-xl hover:translate-y-[-4px] transition-all border border-slate-100 flex flex-col items-start">
        <div className="bg-slate-50 p-4 rounded-xl mb-6 group-hover:bg-slate-950 group-hover:text-white transition-all duration-300">
          <cat.icon className="w-6 h-6" />
        </div>
        <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">{cat.name}</h4>
        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">{cat.desc}</p>
      </div>
    ))}
  </section>
);

const ProductCard: React.FC<{ product: any }> = ({ product }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-100 hover:shadow-2xl hover:translate-y-[-4px] transition-all group">
    <div className="relative h-64 bg-slate-50 flex items-center justify-center p-10">
      <img 
        src={product.image} 
        alt={product.name} 
        className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      {product.discount && (
        <span className="absolute top-4 left-4 bg-slate-950 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
          {product.discount}
        </span>
      )}
      {product.tag && (
        <span className="absolute top-4 left-4 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
          {product.tag}
        </span>
      )}
      <button className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <Search className="w-4 h-4 text-slate-900" />
      </button>
    </div>
    <div className="p-6 flex-1 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">SKU: BM-{(Math.random() * 10000).toFixed(0)}</span>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-slate-900 fill-current" />
          <span className="text-[10px] font-black text-slate-900">{product.rating}</span>
        </div>
      </div>
      <h3 className="font-black text-sm text-slate-900 leading-tight line-clamp-2 h-10">
        {product.name}
      </h3>
      <div className="pt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-slate-400 line-through font-bold">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        {product.bulkInfo && (
          <div className="bg-slate-900 text-white text-[9px] font-black px-2.5 py-1 rounded-sm inline-block mt-3 uppercase tracking-widest">
            {product.bulkInfo}
          </div>
        )}
        {product.claimed && (
          <div className="mt-4">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              <span>Inventory Status</span>
              <span>{product.claimed}% Allocated</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-slate-950 h-full" style={{ width: `${product.claimed}%` }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="pt-6 mt-auto">
        <button className="w-full bg-slate-950 text-white text-[10px] font-black py-4 rounded-xl uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
          {product.isTechnical ? 'Technical Specs' : 'Add to Project'}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
);

const TrustSignals = () => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-y border-slate-100">
    <div className="flex gap-6">
      <div className="bg-slate-50 p-5 rounded-2xl h-fit">
        <ShieldCheck className="w-8 h-8 text-slate-900" />
      </div>
      <div>
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-[0.2em] mb-3">Verified Supply Chain</h4>
        <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-wider">Direct manufacturer sourcing with automated SDS and compliance verification.</p>
      </div>
    </div>
    <div className="flex gap-6">
      <div className="bg-slate-50 p-5 rounded-2xl h-fit">
        <Truck className="w-8 h-8 text-slate-900" />
      </div>
      <div>
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-[0.2em] mb-3">Global Logistics</h4>
        <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-wider">Integrated LTL/FTL tracking with site-ready delivery coordination.</p>
      </div>
    </div>
    <div className="flex gap-6">
      <div className="bg-slate-50 p-5 rounded-2xl h-fit">
        <Headphones className="w-8 h-8 text-slate-900" />
      </div>
      <div>
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-[0.2em] mb-3">Technical Support</h4>
        <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-wider">24/7 engineering consultation for project-specific material requirements.</p>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 border-t border-white/5">
    <div className="max-w-[1920px] mx-auto px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 mb-20">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">BuildMore</span>
          </div>
          <p className="text-xs leading-relaxed max-w-xs font-bold uppercase tracking-wider text-slate-500">
            The unified operating system for global infrastructure procurement. Verified manufacturers, global logistics, and technical precision for the world's most ambitious projects.
          </p>
          <div className="flex gap-6">
            <Globe className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Award className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <BarChart3 className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div className="space-y-6">
          <h5 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">Procurement</h5>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
            <li><a href="#" className="hover:text-white transition-colors">Bulk Orders</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Price Engine</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Technical Specs</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Store Locator</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">Operations</h5>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Rates</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Returns & Orders</a></li>
            <li><a href="#" className="hover:text-white transition-colors">SDS Sheets</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">Governance</h5>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Wholesale Login</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Certifications</a></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h5 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">Intelligence</h5>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Get technical updates and bulk pricing alerts directly to your terminal.</p>
          <div className="flex group">
            <input 
              type="email" 
              placeholder="ENTER ENTERPRISE EMAIL" 
              className="bg-white/5 border border-white/10 rounded-l-sm text-[10px] font-black py-4 px-4 w-full focus:ring-1 focus:ring-white text-white outline-none transition-all"
            />
            <button className="bg-white text-slate-950 px-6 rounded-r-sm hover:bg-slate-200 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <p className="text-[9px] font-black tracking-[0.4em] uppercase text-slate-600">
          © 2026 BuildMore Infrastructure Systems. All rights reserved.
        </p>
        <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
          <span>System Status: Optimal</span>
          <span>v4.2.0-STABLE</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <Header />
      <SubNav />
      
      <main className="max-w-[1920px] mx-auto px-8 py-12 space-y-20 w-full">
        <Hero />
        
        <CategoryGrid />

        <section className="space-y-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-[2px] bg-slate-900"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Procurement Alert</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-slate-900">Infrastructure Drops</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Real-time inventory liquidation for enterprise projects.</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 bg-slate-950 px-6 py-3 rounded-xl shadow-xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Window Closes:</span>
                <span className="text-lg font-mono font-black text-white">08:42:12</span>
              </div>
              <a href="#" className="text-xs font-black text-slate-900 hover:gap-3 transition-all flex items-center gap-2 uppercase tracking-widest">
                Full Inventory <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <TrustSignals />

        <section className="space-y-16 pb-20">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Global Impact</span>
            <h2 className="text-5xl font-black tracking-tighter text-slate-900">The Infrastructure Standard</h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[10px]">Powering the world's most ambitious construction projects across 40+ countries.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                <div className="flex text-slate-900 mb-8">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-wide">"{t.quote}"</p>
                <div className="mt-10 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-lg font-black text-white">{t.author.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{t.author}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{t.role}</p>
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
