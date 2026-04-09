import type { FC } from 'react';
import { Hammer, Zap, HardHat, Droplets, Trash2, Wrench, Paintbrush, Grid3X3, Package, Cog, Box, Layers } from 'lucide-react';

export interface CategoryMeta {
  name: string;
  icon: FC<{ className?: string }>;
  desc: string;
  subcategories: string[];
}

// Static lookup for well-known categories — icon, desc, subcategories
const KNOWN: Record<string, Omit<CategoryMeta, 'name'>> = { // eslint-disable-line
  'Industrial Tools':   { icon: Hammer,      desc: 'Power & hand tools',        subcategories: ['Drills', 'Wrenches', 'Saws', 'Sanders'] },
  'Electrical Systems': { icon: Zap,          desc: 'Wiring & control',          subcategories: ['Circuit Breakers', 'Wiring', 'Panels', 'Conduit'] },
  'Safety Gear':        { icon: HardHat,      desc: 'PPE & site safety',         subcategories: ['Helmets', 'Gloves', 'Boots', 'Vests'] },
  'Fluid Dynamics':     { icon: Droplets,     desc: 'Pipes & valves',            subcategories: ['Valves', 'Pipes', 'Pumps', 'Fittings'] },
  'Janitorial':         { icon: Trash2,       desc: 'Professional sanitation',   subcategories: ['Cleaning Agents', 'Bins', 'Tools', 'Paper'] },
  'Hardware':           { icon: Wrench,       desc: 'Fasteners & fixtures',      subcategories: ['Bolts', 'Nails', 'Screws', 'Washers'] },
  'Coatings':           { icon: Paintbrush,   desc: 'Paints & finishes',         subcategories: ['Exterior', 'Interior', 'Primers', 'Stains'] },
  'Tiling':             { icon: Grid3X3,      desc: 'Ceramic & stone',           subcategories: ['Ceramic', 'Porcelain', 'Marble', 'Slate'] },
  'Mechanical':         { icon: Cog,          desc: 'Mechanical components',     subcategories: ['Gears', 'Bearings', 'Shafts', 'Couplings'] },
  'Packaging':          { icon: Box,          desc: 'Packaging materials',       subcategories: ['Boxes', 'Tape', 'Foam', 'Wraps'] },
  'Structural':         { icon: Layers,       desc: 'Structural materials',      subcategories: ['Steel', 'Concrete', 'Timber', 'Composites'] },
};

const DEFAULT: Omit<CategoryMeta, 'name'> = {
  icon: Package,
  desc: 'Industrial supplies',
  subcategories: ['Browse All'],
};

export function getCategoryMeta(name: string): CategoryMeta {
  const found = KNOWN[name];
  return { name, ...(found ?? DEFAULT) };
}
