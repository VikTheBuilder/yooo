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
    <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
      <Skeleton className="h-20 w-full border-0" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4 border-0" />
        <Skeleton className="h-3 w-full border-0" />
        <Skeleton className="h-3 w-5/6 border-0" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 border-0" />
          <Skeleton className="h-5 w-20 border-0" />
        </div>
        <Skeleton className="h-8 w-24 mt-2 border-0" />
        <Skeleton className="h-4 w-2/3 border-0" />
      </div>
    </div>
  );
}

export default function ListingCard({ listing, index = 0, preview = false }: Props) {
  const catMeta = CATEGORY_META[listing.category] || CATEGORY_META.other;
  const modeMeta = MODE_META[listing.mode] || MODE_META.sell;

  const cardInner = (
    <div
      className={`h-full flex flex-col overflow-hidden bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] transition-all duration-100 ${
        preview
          ? 'border-dashed'
          : 'group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_0_#000]'
      }`}
    >
      {/* Category header bar */}
      <div
        className="flex items-center gap-3 p-4 border-b-[3px] border-black"
        style={{ backgroundColor: catMeta.color }}
      >
        <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0_0_#000]">
          {catMeta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-black text-[10px] font-black uppercase tracking-widest mb-0.5 font-mono">
            {catMeta.label}
          </p>
          <h3 className="text-black font-black text-sm sm:text-base leading-snug line-clamp-2 uppercase tracking-tight">
            {listing.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {(listing.course || listing.semester) && (
          <div className="flex flex-wrap gap-1.5">
            {listing.course && (
              <span className="badge bg-[#B79CFF] text-black border-black text-[10px] px-2 py-0.5">
                {listing.course}
              </span>
            )}
            {listing.semester && (
              <span className="badge bg-[#4D7CFF] text-black border-black text-[10px] px-2 py-0.5">
                {listing.semester}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="badge text-[10px] px-2 py-0.5 border-black font-mono"
            style={{ backgroundColor: modeMeta.bg, color: modeMeta.color }}
          >
            {modeMeta.label}
          </span>
          <span className="badge bg-white text-black border-black text-[10px] px-2 py-0.5 font-mono">
            {CONDITION_LABELS[listing.condition]}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t-[2px] border-black/20">
          {listing.mode === 'sell' && (
            <p className="font-black text-xl text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
              {listing.price != null ? `₹${listing.price}` : 'Free'}
            </p>
          )}
          {listing.mode === 'rent' && (
            <p className="font-black text-xl text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
              ₹{listing.rent_price_per_week ?? '—'}
              <span className="text-sm font-bold text-black/50">/wk</span>
            </p>
          )}
          {listing.mode === 'swap' && (
            <p className="font-bold text-sm text-black line-clamp-2 leading-snug normal-case">
              Swap for {listing.swap_wanted?.trim() || '—'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-black/70 pt-1">
          <User size={12} className="text-black shrink-0" />
          <span className="truncate font-bold">{listing.seller_name ?? 'Student'}</span>
          <span className="text-black/30">·</span>
          <MapPin size={12} className="text-black shrink-0" />
          <span className="truncate font-medium">{listing.seller_hostel || 'On campus'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: preview ? 0 : Math.min(index * 0.05, 0.35) }}
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
