import type { FC } from 'react';
import {
  Layers, Grid3X3, Paintbrush, FlaskConical, Columns2,
  Zap, Lamp, Cable, Pipette, Droplets, Wrench, UtensilsCrossed,
  DoorOpen, Hammer, Package, HardHat, Sofa,
} from 'lucide-react';

export interface CategoryMeta {
  name: string;
  icon: FC<{ className?: string }>;
  desc: string;
  subcategories: string[];
}

export interface TopCategory {
  name: string;
  slug: string;
  shortName: string;
  icon: FC<{ className?: string }>;
  categories: string[];
}

// ─── Top-level groupings ───────────────────────────────────────────────────────
export const TOP_CATEGORIES: TopCategory[] = [
  {
    name: 'Civil & Interiors',
    shortName: 'Civil & Interiors',
    slug: 'civil-interiors',
    icon: HardHat,
    categories: [
      'Cement & Concrete',
      'Tiles & Flooring',
      'Paints & Finishes',
      'Construction Chemicals',
      'Plywood, Laminates & Boards',
      'Doors & Windows',
    ],
  },
  {
    name: 'Furniture & Architectural Hardware',
    shortName: 'Furniture & Hardware',
    slug: 'furniture-architectural-hardware',
    icon: Sofa,
    categories: [
      'Hardware & Fittings',
      'Kitchen & Wardrobe Solutions',
      'Tools & Equipment',
    ],
  },
  {
    name: 'Electrical',
    shortName: 'Electrical',
    slug: 'electrical',
    icon: Zap,
    categories: [
      'Electrical',
      'Lighting & Fans',
      'Electrical Infrastructure',
    ],
  },
  {
    name: 'Plumbing, Sanitary & Bath',
    shortName: 'Plumbing & Bath',
    slug: 'plumbing-sanitary-bath',
    icon: Pipette,
    categories: [
      'Plumbing',
      'Sanitary & Bath',
    ],
  },
];

// Flat ordered list of all 14 leaf categories
export const ALL_CATEGORIES: string[] = TOP_CATEGORIES.flatMap(t => t.categories);

// ─── Leaf-category metadata ────────────────────────────────────────────────────
const KNOWN: Record<string, Omit<CategoryMeta, 'name'>> = {
  'Cement & Concrete': {
    icon: Layers,
    desc: 'Cement, blocks & structural base',
    subcategories: ['Cement', 'Ready Mix Concrete', 'AAC Blocks', 'Concrete Blocks', 'Plasters', 'Wall Reinforcement'],
  },
  'Tiles & Flooring': {
    icon: Grid3X3,
    desc: 'Tiles, marble, granite & adhesives',
    subcategories: ['Floor Tiles', 'Wall Tiles', 'Vitrified Tiles', 'Ceramic Tiles', 'Marble', 'Granite', 'Tile Adhesives', 'Tile Grouts', 'Tile Cleaners', 'Tiling Tools'],
  },
  'Paints & Finishes': {
    icon: Paintbrush,
    desc: 'Interior, exterior & specialty coatings',
    subcategories: ['Interior Paints', 'Exterior Paints', 'Primers', 'Putty', 'Wood Coatings', 'Enamels', 'Texture Finishes', 'Waterproof Primers', 'Damp Proofing', 'Brushes', 'Rollers', 'Masking Tape'],
  },
  'Construction Chemicals': {
    icon: FlaskConical,
    desc: 'Adhesives, sealants & waterproofing',
    subcategories: ['Tile Adhesives', 'Wood Adhesives', 'Epoxy Adhesives', 'Sealants', 'Grouts', 'SBR Latex', 'Crack Fillers', 'Waterproof Coatings'],
  },
  'Plywood, Laminates & Boards': {
    icon: Columns2,
    desc: 'Plywood, MDF, laminates & veneers',
    subcategories: ['Plywood', 'MDF Boards', 'HDHMR Boards', 'Block Boards', 'Particle Boards', 'Boiling Water Resistant Boards', 'Laminates', 'Veneers'],
  },
  'Doors & Windows': {
    icon: DoorOpen,
    desc: 'Flush doors, UPVC & aluminium windows',
    subcategories: ['Flush Doors', 'Panel Doors', 'UPVC Windows', 'Aluminium Windows', 'Glass Panels'],
  },
  'Hardware & Fittings': {
    icon: Wrench,
    desc: 'Door hardware, locks & fasteners',
    subcategories: ['Door Hardware', 'Cabinet Hardware', 'Hinges', 'Drawer Slides', 'Telescopic Channels', 'Handles', 'Locks', 'Fasteners', 'General Hardware'],
  },
  'Kitchen & Wardrobe Solutions': {
    icon: UtensilsCrossed,
    desc: 'Modular cabinet & storage systems',
    subcategories: ['Cabinet Hardware', 'Drawer Systems', 'Door Systems', 'Sliding Systems', 'Wardrobe Accessories', 'Wardrobe Rails', 'Pantry Units', 'Pullout Systems', 'Storage Systems', 'Waste Management', 'Gas Lifts'],
  },
  'Tools & Equipment': {
    icon: Hammer,
    desc: 'Hand tools, power tools & PPE',
    subcategories: ['Hand Tools', 'Power Tools', 'Measurement Tools', 'Protective Equipment', 'Mounting Accessories', 'Maintenance Products'],
  },
  'Electrical': {
    icon: Zap,
    desc: 'Wires, switches & distribution boards',
    subcategories: ['Wires & Cables', 'Switches', 'Sockets', 'Plates & Frames', 'Distribution Boards', 'Circuit Breakers', 'Regulators', 'Electrical Accessories'],
  },
  'Lighting & Fans': {
    icon: Lamp,
    desc: 'LED lighting & ventilation fans',
    subcategories: ['Downlights', 'COB Lights', 'Strip Lights', 'Surface Lights', 'Tube Lights', 'Ceiling Fans', 'Exhaust Fans'],
  },
  'Electrical Infrastructure': {
    icon: Cable,
    desc: 'Conduits, boxes & cable accessories',
    subcategories: ['Conduit Pipes', 'Conduit Fittings', 'Casing & Capping', 'Junction Boxes', 'Back Boxes', 'GI Boxes', 'Cable Accessories'],
  },
  'Plumbing': {
    icon: Pipette,
    desc: 'Pipes, fittings, valves & tanks',
    subcategories: ['CPVC Pipes', 'UPVC Pipes', 'Pipe Fittings', 'Valves', 'Water Tanks', 'Drainage Systems'],
  },
  'Sanitary & Bath': {
    icon: Droplets,
    desc: 'Faucets, sanitary ware & bath fittings',
    subcategories: ['Faucets & Taps', 'Sanitary Ware', 'Bathroom Fittings'],
  },
};

const DEFAULT: Omit<CategoryMeta, 'name'> = {
  icon: Package,
  desc: 'Construction supplies',
  subcategories: ['Browse All'],
};

export function getCategoryMeta(name: string): CategoryMeta {
  return { name, ...(KNOWN[name] ?? DEFAULT) };
}

/** Returns the top category that owns the given leaf category name, or undefined. */
export function getTopCategory(leafName: string): TopCategory | undefined {
  return TOP_CATEGORIES.find(t => t.categories.includes(leafName));
}
