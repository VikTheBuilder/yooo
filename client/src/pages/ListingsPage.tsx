import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import type { Listing, ListingCategory, ListingMode } from '../types';
import { CATEGORY_META, MODE_META, SEMESTER_OPTIONS } from '../lib/constants';
import ListingCard from '../components/ListingCard';
import api from '../lib/api';

const CATEGORIES = Object.keys(CATEGORY_META) as ListingCategory[];
const MODES = Object.keys(MODE_META) as ListingMode[];

export default function ListingsPage() {
  const [params, setParams] = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const category = params.get('category') ?? '';
  const mode = params.get('mode') ?? '';
  const semester = params.get('semester') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const q = params.get('q') ?? '';

  const [search, setSearch] = useState(q);

  const fetchListings = useCallback(async () => {
    setLoading(true);
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
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [category, mode, semester, maxPrice, sort, q]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (search.trim()) next.set('q', search.trim());
    else next.delete('q');
    setParams(next);
  };

  const clearAll = () => {
    setSearch('');
    setParams({});
  };

  const hasFilters = !!(category || mode || semester || maxPrice || q || sort !== 'newest');

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-1">Browse Campus Resources</h1>
          <p className="text-slate-400 text-sm">
            {loading ? 'Searching campus inventory…' : `${listings.length} available academic resource${listings.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>

        {/* Search + Filters Bar */}
        <div className="glass p-5 mb-8 flex flex-col gap-4 shadow-xl">
          {/* Search bar & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input pl-10"
                  placeholder="Search by course code (CS201), book title, or topic..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary px-5 whitespace-nowrap">
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <ArrowUpDown size={15} className="text-slate-400 shrink-0" />
              <select
                className="input py-2 text-xs"
                value={sort}
                onChange={e => setFilter('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="btn-ghost px-3 text-xs text-red-400 border-red-500/20 hover:border-red-500/40"
                  title="Clear all filters"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">
              <Filter size={13} /> Categories:
            </span>

            <button
              onClick={() => setFilter('category', '')}
              className={`badge text-xs px-3 py-1 cursor-pointer transition-all ${
                !category ? 'bg-indigo-500 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
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
                  onClick={() => setFilter('category', active ? '' : c)}
                  className={`badge text-xs px-3 py-1 cursor-pointer transition-all flex items-center gap-1 ${
                    active ? 'bg-indigo-500 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mode & Semester Filter chips */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase font-semibold text-[11px]">Mode:</span>
              <div className="flex gap-1.5">
                {MODES.map(m => {
                  const meta = MODE_META[m];
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setFilter('mode', active ? '' : m)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
                      style={{
                        background: active ? meta.bg : 'transparent',
                        borderColor: active ? meta.color : 'rgba(255,255,255,0.08)',
                        color: active ? meta.color : '#94a3b8',
                      }}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase font-semibold text-[11px]">Semester:</span>
              <select
                className="input py-1 px-2.5 text-xs max-w-[140px]"
                value={semester}
                onChange={e => setFilter('semester', e.target.value)}
              >
                <option value="">All Semesters</option>
                {SEMESTER_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass h-64 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass p-12 text-center max-w-md mx-auto"
          >
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-white font-bold text-lg mb-2">No matching resources</h3>
            <p className="text-slate-400 text-sm mb-6">
              Try adjusting your search terms or filters to find what you need.
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="btn-primary text-xs mx-auto">
                Reset All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
