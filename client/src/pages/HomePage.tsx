import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  FlaskConical,
  Calculator,
  FileText,
  Package,
  Filter,
  X,
  SlidersHorizontal,
  PlusCircle,
  TrendingUp,
  HelpCircle,
  Handshake,
  RefreshCw,
} from 'lucide-react';
import type { Listing, ListingCategory, ListingMode, Stats } from '../types';
import { CATEGORY_META, MODE_META, SEMESTER_OPTIONS } from '../lib/constants';
import ListingCard, { ListingCardSkeleton } from '../components/ListingCard';
import { EmptyState } from '../components/ui';
import api from '../lib/api';

const CATEGORIES = Object.keys(CATEGORY_META) as ListingCategory[];
const MODES = Object.keys(MODE_META) as ListingMode[];

const HERO_CATEGORIES = [
  { key: 'book' as const, icon: BookOpen, label: 'Textbooks' },
  { key: 'notes' as const, icon: FileText, label: 'Notes' },
  { key: 'calculator' as const, icon: Calculator, label: 'Calculators' },
  { key: 'lab-equipment' as const, icon: FlaskConical, label: 'Lab Gear' },
  { key: 'other' as const, icon: Package, label: 'Other' },
];

const MODE_FILTER_LABEL: Record<ListingMode, string> = {
  sell: 'Buy',
  rent: 'Rent',
  swap: 'Swap',
};

const SEARCH_DEBOUNCE_MS = 400;

function AnimatedStat({
  value,
  label,
  color,
  icon,
  delay,
}: {
  value: number;
  label: string;
  color: string;
  icon: ReactNode;
  delay: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const steps = 24;
    const step = value / steps;
    const id = window.setInterval(() => {
      frame += 1;
      setDisplay(frame >= steps ? value : Math.round(step * frame));
      if (frame >= steps) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
        style={{ color, background: `${color}18` }}
      >
        {icon}
      </div>
      <motion.span
        key={value}
        initial={{ scale: 0.92, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl sm:text-4xl font-black tabular-nums"
        style={{ color }}
      >
        {display}
      </motion.span>
      <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider text-center leading-snug">
        {label}
      </span>
    </motion.div>
  );
}

interface FilterPanelProps {
  category: string;
  mode: string;
  semester: string;
  maxPrice: string;
  sort: string;
  setFilter: (key: string, value: string) => void;
  clearAll: () => void;
  hasFilters: boolean;
  onClose?: () => void;
  className?: string;
}

function FilterPanel({
  category,
  mode,
  semester,
  maxPrice,
  sort,
  setFilter,
  clearAll,
  hasFilters,
  onClose,
  className = '',
}: FilterPanelProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <SlidersHorizontal size={16} className="text-indigo-400" />
          Filters
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('category', '')}
            className={`badge text-xs px-3 py-1.5 cursor-pointer transition-all ${
              !category ? 'bg-indigo-500 text-white font-semibold' : 'text-slate-400 bg-slate-800/60 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(c => {
            const meta = CATEGORY_META[c];
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter('category', active ? '' : c)}
                className={`badge text-xs px-3 py-1.5 cursor-pointer transition-all flex items-center gap-1 ${
                  active ? 'bg-indigo-500 text-white font-semibold' : 'text-slate-400 bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Semester</p>
        <select
          className="input py-2.5 text-sm w-full"
          value={semester}
          onChange={e => setFilter('semester', e.target.value)}
        >
          <option value="">All semesters</option>
          {SEMESTER_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Mode</p>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(m => {
            const meta = MODE_META[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setFilter('mode', active ? '' : m)}
                className="px-2 py-2 rounded-xl border text-xs font-semibold transition-all"
                style={{
                  background: active ? meta.bg : 'transparent',
                  borderColor: active ? meta.color : 'rgba(255,255,255,0.08)',
                  color: active ? meta.color : '#94a3b8',
                }}
              >
                {MODE_FILTER_LABEL[m]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Max price (₹)</p>
        <input
          type="number"
          min={0}
          className="input py-2.5 text-sm w-full"
          placeholder="Any budget"
          value={maxPrice}
          onChange={e => setFilter('maxPrice', e.target.value)}
        />
        <p className="text-[10px] text-slate-500 mt-1.5">Applies to items listed for sale</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Sort by</p>
        <select
          className="input py-2.5 text-sm w-full"
          value={sort}
          onChange={e => setFilter('sort', e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {hasFilters && (
        <button type="button" onClick={clearAll} className="btn-ghost text-xs w-full border-red-500/20 text-red-400">
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingError, setListingError] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    openRequests: 0,
    completedTransactions: 0,
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const category = params.get('category') ?? '';
  const mode = params.get('mode') ?? '';
  const semester = params.get('semester') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const q = params.get('q') ?? '';

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const setFilter = useCallback(
    (key: string, value: string) => {
      setLoading(true);
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      setParams(next);
    },
    [params, setParams],
  );

  const clearAll = useCallback(() => {
    setLoading(true);
    setSearchInput('');
    setParams({});
    setFilterDrawerOpen(false);
  }, [setParams]);

  const hasFilters = !!(category || mode || semester || maxPrice || q || sort !== 'newest');

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === q) return;
      setFilter('q', trimmed);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput, q, setFilter]);

  const fetchListings = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/listings', {
        params: {
          ...(category && { category }),
          ...(mode && { mode }),
          ...(semester && { semester }),
          ...(maxPrice && { maxPrice }),
          ...(sort && { sort }),
          ...(q && { q }),
        },
      });
      setListings(res.data.listings || []);
      setListingError(false);
    } catch {
      setListings([]);
      setListingError(true);
    } finally {
      setLoading(false);
    }
  }, [category, mode, semester, maxPrice, sort, q]);

  useEffect(() => {
    fetchListings(false);
  }, [fetchListings]);

  useEffect(() => {
    api
      .get('/stats')
      .then(r => setStats(r.data.stats))
      .catch(() => {});
  }, []);

  const toggleCategoryChip = (key: ListingCategory) => {
    setFilter('category', category === key ? '' : key);
  };

  const filterPanelProps: FilterPanelProps = {
    category,
    mode,
    semester,
    maxPrice,
    sort,
    setFilter,
    clearAll,
    hasFilters,
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-atmosphere relative overflow-hidden pt-12 pb-8 px-4 sm:pt-16 sm:pb-10">

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-white leading-tight mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300">
                Buy, rent &amp; swap academic resources
              </span>
              <br />
              <span className="text-white">within your campus</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
              Textbooks, notes, calculators, and lab gear from students in your hostels and batch — no shipping, no
              strangers.
            </p>

            <div className="relative max-w-2xl mx-auto mb-6">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by title, course code, or topic…"
                className="input w-full pl-12 pr-12 py-4 sm:py-4.5 text-base rounded-2xl border-indigo-500/20 focus:border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                aria-label="Search listings"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {HERO_CATEGORIES.map(({ key, label, icon: Icon }, i) => {
                const meta = CATEGORY_META[key];
                const active = category === key;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.04 }}
                    onClick={() => toggleCategoryChip(key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-indigo-500/25 border-indigo-400/50 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-indigo-500/30 hover:text-white'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-indigo-300' : 'text-slate-500'} />
                    <span>{meta.emoji}</span>
                    {label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-4 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto glass p-4 sm:p-5 rounded-2xl border border-white/10"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <AnimatedStat
              value={stats.totalListings}
              label="Listings live"
              color="#818cf8"
              icon={<TrendingUp size={18} />}
              delay={0.1}
            />
            <AnimatedStat
              value={stats.openRequests}
              label="Open requests"
              color="#fbbf24"
              icon={<HelpCircle size={18} />}
              delay={0.18}
            />
            <AnimatedStat
              value={stats.completedTransactions}
              label="Deals done"
              color="#34d399"
              icon={<Handshake size={18} />}
              delay={0.26}
            />
          </div>
        </motion.div>
      </section>

      {/* Browse grid + filters */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Campus marketplace</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {loading
                  ? 'Loading resources…'
                  : `${listings.length} item${listings.length === 1 ? '' : 's'} match your filters`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden btn-ghost text-xs py-2.5 px-4 flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-400" aria-hidden />
              )}
            </button>
          </div>

          <div className="flex gap-8 items-start">
            <aside className="hidden lg:block w-72 shrink-0 sticky top-24 glass p-5 rounded-2xl border border-white/10">
              <FilterPanel {...filterPanelProps} />
            </aside>

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ListingCardSkeleton key={i} />
                  ))}
                </div>
              ) : listingError ? (
                <EmptyState
                  icon={<RefreshCw size={24} />}
                  title="Listings couldn’t load"
                  description="Check the server connection and try again."
                  action={
                    <button type="button" onClick={() => fetchListings(true)} className="btn-ghost text-sm">
                      <RefreshCw size={15} /> Retry
                    </button>
                  }
                />
              ) : listings.length === 0 ? (
                <EmptyState
                  title="No listings found"
                  description="Try different keywords or filters, or be the first to list what you have."
                  action={
                    <Link to="/create" className="btn-primary text-sm inline-flex items-center gap-2">
                      <PlusCircle size={16} />
                      List an item
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings.map((listing, i) => (
                    <ListingCard key={listing.id} listing={listing} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              aria-label="Close filters overlay"
              onClick={() => setFilterDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[#0B1020]/98 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto lg:hidden"
            >
              <FilterPanel {...filterPanelProps} onClose={() => setFilterDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
