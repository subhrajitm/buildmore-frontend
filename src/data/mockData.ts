import { Hammer, Zap, HardHat, Droplets, Trash2, Wrench, Paintbrush, Grid3X3 } from 'lucide-react';

export const CATEGORIES = [
  { 
    name: 'Industrial Tools', 
    icon: Hammer, 
    desc: 'Power & hand tools',
    count: 1240,
    subcategories: ['Drills', 'Wrenches', 'Saws', 'Sanders']
  },
  { 
    name: 'Electrical Systems', 
    icon: Zap, 
    desc: 'Wiring & control',
    count: 850,
    subcategories: ['Circuit Breakers', 'Wiring', 'Panels', 'Conduit']
  },
  { 
    name: 'Safety Gear', 
    icon: HardHat, 
    desc: 'PPE & site safety',
    count: 2100,
    subcategories: ['Helmets', 'Gloves', 'Boots', 'Vests']
  },
  { 
    name: 'Fluid Dynamics', 
    icon: Droplets, 
    desc: 'Pipes & valves',
    count: 420,
    subcategories: ['Valves', 'Pipes', 'Pumps', 'Fittings']
  },
  { 
    name: 'Janitorial', 
    icon: Trash2, 
    desc: 'Professional sanitation',
    count: 310,
    subcategories: ['Cleaning Agents', 'Bins', 'Tools', 'Paper']
  },
  { 
    name: 'Hardware', 
    icon: Wrench, 
    desc: 'Fasteners & fixtures',
    count: 5400,
    subcategories: ['Bolts', 'Nails', 'Screws', 'Washers']
  },
  { 
    name: 'Coatings', 
    icon: Paintbrush, 
    desc: 'Paints & finishes',
    count: 730,
    subcategories: ['Exterior', 'Interior', 'Primers', 'Stains']
  },
  { 
    name: 'Tiling', 
    icon: Grid3X3, 
    desc: 'Ceramic & stone',
    count: 1100,
    subcategories: ['Ceramic', 'Porcelain', 'Marble', 'Slate']
  },
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'BuildMore X-Series Industrial Hammer Drill w/ Dual 5.0Ah Lithium-Ion Packs',
    price: 284.99,
    originalPrice: 429.00,
    rating: 4.8,
    reviews: 1248,
    discount: '-34% OFF',
    bulkInfo: 'Bulk Price: $245.00 (10+ units)',
    category: 'Industrial Tools',
    tier: 'Bulk Distribution',
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
    category: 'Safety Gear',
    tier: 'Standard Export',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkzKaySc_Bypd2WdDptO-0pUTEpUkfM4kymoT16b2QS1LJahsbFDxYHRVug2bg-xBz0ZwQ0opJo1IUjvT_RApdwdV3s2hXqZ3m6t7XZTpAei2HeTzvufZKvC0Itz5Yam-h8742_aS413j3Wy0fl62vOhgeipVE_r6pfdGmyVmrcfRnUnIZQamnSyqFwB1phH3OmzGJpfGfhwAJBl9ACK0pAeP9pU5nxz_4pAoSbzy7u7tHkAy1-FRHbCV0bLW4qa4nx-IRHbP2Xm9j',
  },
  {
    id: 3,
    name: 'BuildMore GridMaster 400A Main Breaker Load Center, 42-Circuit NEMA 3R',
    price: 1120.00,
    rating: 4.5,
    reviews: 42,
    bulkInfo: 'Ships LTL Freight',
    category: 'Electrical Systems',
    tier: 'LTL Freight Only',
    isTechnical: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxSP2J0A5FTZyHutfJWxJJujpDGdIWZ60RCgQ4iOn7hJiBqNhFlCHIJyEtyrgXMG9zrJhji7V12lrOCcOXESMgz7BMBbhxNOvuFp8A1hZOLIbaNmHG_2qNobksY__lw5c5VImitDHzQFQAUdrui0i1N5pJI1W2Ciepa1XcnJ8i44pFT3EB2RmXCVz_GjH_YpudTSNMgGjpvujbsSZ4Iph0aYcaMPBU2uw72T9XI6TNbe4XJic9clu3ln2KWZZ77o_qdATVT34VAJ3X',
  },
  {
    id: 4,
    name: 'BuildMore Titan-Step Waterproof Composite Toe 8" Logger Boots',
    price: 189.95,
    rating: 5.0,
    reviews: 12,
    tag: 'NEW ARRIVAL',
    shipping: 'Free Expedited Shipping',
    category: 'Safety Gear',
    tier: 'Standard Export',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr5sGNOnvg7EtRLX7wk5rbQFWEnlPM4w-08o1W2T8EUqBGVYswvKnW5eo96dh60Kyc5Oi2QiojElp-u7z3Jjq9waSaNcsz8F3c5iuOiKsgjKZxKaTwmofl_pfr_pbc4eFhNUza5LVvx9rKSi08zCdWYmOeWbgqSo2WDDeBkIgnkyGm8kZ7V_4TF_bVP00Q_KzcKHqAag_oRyns4iFO_1sIbY2978bcsfo3qYI9sQ6xq7kLORBpTYa8ix0s7siZRUgnrkEHKWfLRHsy',
  },
  {
    id: 5,
    name: 'BuildMore ProGrip 3/4" Impact Wrench 1,100 Ft-Lbs Breakaway Torque',
    price: 549.00,
    originalPrice: 699.00,
    rating: 4.7,
    reviews: 328,
    discount: '-21% OFF',
    bulkInfo: 'Bulk Price: $495.00 (5+ units)',
    category: 'Industrial Tools',
    tier: 'Bulk Distribution',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtasAoLJZNB18AMNnGiCcN1kr_G4sfoYoUhfr-QIktvdulhjzqnXlBtaQc-4xMTs7M4p5rwoauGl5sb600bAtYnfvQ6_PVX9VUpFmbRKfKrtz2L3ebL0ZpHpxp3k9_1ik8ZqbDt_RpOH7SCzRlHc6aXNsXKFFAQ5GJ_7PN4YxwQvQEJCjnK9JiXm4qdLCym9hhOtH0I7xn7VIxk1bBMDx8AnjPINumAaHftYUA29c4qHLJFJEMlMYCyxyin3AKOWGrIuaOn1nCvcTb',
  },
  {
    id: 6,
    name: 'BuildMore EN-ISO Anti-Cut Level D Kevlar Work Gloves — 12-Pair Pack',
    price: 68.00,
    rating: 4.6,
    reviews: 541,
    tag: 'VERIFIED',
    category: 'Safety Gear',
    tier: 'Standard Export',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkzKaySc_Bypd2WdDptO-0pUTEpUkfM4kymoT16b2QS1LJahsbFDxYHRVug2bg-xBz0ZwQ0opJo1IUjvT_RApdwdV3s2hXqZ3m6t7XZTpAei2HeTzvufZKvC0Itz5Yam-h8742_aS413j3Wy0fl62vOhgeipVE_r6pfdGmyVmrcfRnUnIZQamnSyqFwB1phH3OmzGJpfGfhwAJBl9ACK0pAeP9pU5nxz_4pAoSbzy7u7tHkAy1-FRHbCV0bLW4qa4nx-IRHbP2Xm9j',
  },
  {
    id: 7,
    name: 'BuildMore HeavySet 50T Hydraulic Press Frame w/ Electric Pump & Gauge',
    price: 2840.00,
    rating: 4.4,
    reviews: 18,
    bulkInfo: 'Ships LTL Freight',
    category: 'Industrial Tools',
    tier: 'LTL Freight Only',
    isTechnical: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxSP2J0A5FTZyHutfJWxJJujpDGdIWZ60RCgQ4iOn7hJiBqNhFlCHIJyEtyrgXMG9zrJhji7V12lrOCcOXESMgz7BMBbhxNOvuFp8A1hZOLIbaNmHG_2qNobksY__lw5c5VImitDHzQFQAUdrui0i1N5pJI1W2Ciepa1XcnJ8i44pFT3EB2RmXCVz_GjH_YpudTSNMgGjpvujbsSZ4Iph0aYcaMPBU2uw72T9XI6TNbe4XJic9clu3ln2KWZZ77o_qdATVT34VAJ3X',
  },
  {
    id: 8,
    name: 'BuildMore Grade-8 Zinc Hex Bolt Assortment Kit — 1,200 Piece',
    price: 94.99,
    originalPrice: 129.00,
    rating: 4.9,
    reviews: 2103,
    discount: '-26% OFF',
    bulkInfo: 'Bulk Price: $78.00 (10+ kits)',
    category: 'Hardware',
    tier: 'Bulk Distribution',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtasAoLJZNB18AMNnGiCcN1kr_G4sfoYoUhfr-QIktvdulhjzqnXlBtaQc-4xMTs7M4p5rwoauGl5sb600bAtYnfvQ6_PVX9VUpFmbRKfKrtz2L3ebL0ZpHpxp3k9_1ik8ZqbDt_RpOH7SCzRlHc6aXNsXKFFAQ5GJ_7PN4YxwQvQEJCjnK9JiXm4qdLCym9hhOtH0I7xn7VIxk1bBMDx8AnjPINumAaHftYUA29c4qHLJFJEMlMYCyxyin3AKOWGrIuaOn1nCvcTb',
  },
];

export const FLASH_OFFERS = [
  {
    id: 1,
    title: 'Weekend Construction Bumper',
    tag: 'Limited Time',
    discount: 'Extra 15% OFF',
    desc: 'Get an additional discount on all structural steel and power tools over $500.',
    color: 'from-orange-600 to-red-700',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Bulk Infrastructure Blowout',
    tag: 'Bumper Offer',
    discount: 'Buy 5, Get 1 FREE',
    desc: 'On all safety equipment and sitewide hardware kits. Stock up for your next project.',
    color: 'from-blue-700 to-indigo-900',
    image: 'https://images.unsplash.com/photo-1581094120973-10d9be8a1290?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Premium Project Pack',
    tag: 'Flash Deal',
    discount: 'Flat $500 Cashback',
    desc: 'When you finalize your first procurement order over $5,000 this month.',
    color: 'from-emerald-700 to-teal-900',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000&auto=format&fit=crop'
  }
];

export const TESTIMONIALS = [
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
