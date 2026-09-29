import type { ListingCategory, ListingMode, ListingCondition } from '../types';

export const CATEGORY_META: Record<ListingCategory, { label: string; emoji: string; gradient: string }> = {
  book:            { label: 'Textbooks',      emoji: '📚', gradient: 'from-indigo-500 to-purple-600' },
  notes:           { label: 'Lecture Notes',  emoji: '📝', gradient: 'from-cyan-500 to-blue-600' },
  calculator:      { label: 'Calculators',    emoji: '🔢', gradient: 'from-amber-500 to-orange-600' },
  'lab-equipment': { label: 'Lab Equipment',  emoji: '🔬', gradient: 'from-emerald-500 to-teal-600' },
  other:           { label: 'Other Academic', emoji: '📦', gradient: 'from-rose-500 to-pink-600' },
};

export const MODE_META: Record<ListingMode, { label: string; color: string; bg: string; action: string }> = {
  sell: { label: 'For Sale',  color: '#10b981', bg: 'rgba(16,185,129,0.12)', action: 'Buy Now' },
  rent: { label: 'For Rent',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)', action: 'Rent (7 Days)' },
  swap: { label: 'For Swap',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', action: 'Request Swap' },
};

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new:  'Brand New',
  good: 'Good Condition',
  fair: 'Fair / Usable',
};

export const SEMESTER_OPTIONS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];
