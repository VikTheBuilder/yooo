import type { ListingCategory, ListingMode, ListingCondition } from '../types';

/** Neo-Brutalism flat color fill used as card header background */
export const CATEGORY_META: Record<ListingCategory, { label: string; emoji: string; color: string; textColor: string }> = {
  book:            { label: 'Textbooks',      emoji: '📚', color: '#B79CFF', textColor: '#000' },
  notes:           { label: 'Lecture Notes',  emoji: '📝', color: '#4D7CFF', textColor: '#000' },
  calculator:      { label: 'Calculators',    emoji: '🔢', color: '#FFE600', textColor: '#000' },
  'lab-equipment': { label: 'Lab Equipment',  emoji: '🔬', color: '#00D26A', textColor: '#000' },
  other:           { label: 'Other Academic', emoji: '📦', color: '#FF6B9D', textColor: '#000' },
};

export const MODE_META: Record<ListingMode, { label: string; color: string; bg: string; action: string }> = {
  sell: { label: 'For Sale',  color: '#000', bg: '#00D26A', action: 'Buy Now' },
  rent: { label: 'For Rent',  color: '#000', bg: '#4D7CFF', action: 'Rent (7 Days)' },
  swap: { label: 'For Swap',  color: '#000', bg: '#FFE600', action: 'Request Swap' },
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
