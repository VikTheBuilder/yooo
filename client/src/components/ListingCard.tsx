import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User } from 'lucide-react';
import type { Listing } from '../types';
import { CATEGORY_META, MODE_META, CONDITION_LABELS } from '../lib/constants';
import { Skeleton } from './ui';

interface Props {
  listing: Listing;
  index?: number;
  /** Renders a non-clickable preview (e.g. sell form). */
  preview?: boolean;
}

export function ListingCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/10">
      <Skeleton className="h-20 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-24 mt-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function ListingCard({ listing, index = 0, preview = false }: Props) {
  const catMeta = CATEGORY_META[listing.category] || CATEGORY_META.other;
  const modeMeta = MODE_META[listing.mode] || MODE_META.sell;

  const cardInner = (
        <div className={`glass h-full flex flex-col overflow-hidden transition-all duration-300 ${preview ? 'border border-dashed border-indigo-500/30' : 'group-hover:border-indigo-500/40 group-hover:shadow-[0_12px_30px_rgba(99,102,241,0.15)]'}`}>
          <div className={`flex items-center gap-3 p-4 bg-gradient-to-r ${catMeta.gradient} relative overflow-hidden`}>
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-3xl shrink-0 shadow-inner border border-white/20">
              {catMeta.emoji}
            </div>
            <div className="flex-1 min-w-0 z-10">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">{catMeta.label}</p>
              <h3 className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-50 transition-colors">
                {listing.title}
              </h3>
            </div>
          </div>

          <div className="flex flex-col flex-1 p-4 gap-3">
            {(listing.course || listing.semester) && (
              <div className="flex flex-wrap gap-1.5">
                {listing.course && (
                  <span className="badge text-[11px] px-2.5 py-0.5 font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25">
                    {listing.course}
                  </span>
                )}
                {listing.semester && (
                  <span className="badge text-[11px] px-2.5 py-0.5 text-violet-300 bg-violet-500/10 border border-violet-500/20">
                    {listing.semester}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="badge text-[11px] px-2 py-0.5 font-semibold"
                style={{ color: modeMeta.color, background: modeMeta.bg, border: `1px solid ${modeMeta.color}30` }}
              >
                {modeMeta.label}
              </span>
              <span
                className="badge text-[11px] px-2 py-0.5"
                style={{ color: '#94a3b8', background: 'rgba(148,163,184,0.08)' }}
              >
                {CONDITION_LABELS[listing.condition]}
              </span>
            </div>

            <div className="mt-auto pt-2 border-t border-white/5">
              {listing.mode === 'sell' && (
                <p className="font-extrabold text-lg text-emerald-400">
                  {listing.price != null ? `₹${listing.price}` : 'Free'}
                </p>
              )}
              {listing.mode === 'rent' && (
                <p className="font-extrabold text-lg text-indigo-400">
                  ₹{listing.rent_price_per_week ?? '—'}
                  <span className="text-sm font-semibold text-slate-500">/week</span>
                </p>
              )}
              {listing.mode === 'swap' && (
                <p className="font-semibold text-sm text-amber-400 line-clamp-2 leading-snug">
                  Swap for {listing.swap_wanted?.trim() || '—'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <User size={12} className="text-indigo-400 shrink-0" />
              <span className="truncate font-medium text-slate-300">{listing.seller_name ?? 'Student'}</span>
              <span className="text-slate-600">·</span>
              <MapPin size={12} className="text-violet-400 shrink-0" />
              <span className="truncate">{listing.seller_hostel || 'On campus'}</span>
            </div>
          </div>
        </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: preview ? 0 : Math.min(index * 0.06, 0.45) }}
      whileHover={preview ? undefined : { y: -4, transition: { duration: 0.18 } }}
    >
      {preview ? (
        <div className="block h-full">{cardInner}</div>
      ) : (
        <Link to={`/listing/${listing.id}`} className="block h-full group">
          {cardInner}
        </Link>
      )}
    </motion.div>
  );
}
