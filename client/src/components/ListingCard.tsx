import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import type { Listing } from '../types';
import { CATEGORY_META, MODE_META, CONDITION_LABELS } from '../lib/constants';

interface Props {
  listing: Listing;
  index?: number;
}

export default function ListingCard({ listing, index = 0 }: Props) {
  const catMeta = CATEGORY_META[listing.category] || CATEGORY_META.other;
  const modeMeta = MODE_META[listing.mode] || MODE_META.sell;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
    >
      <Link to={`/listings/${listing.id}`} className="block h-full group">
        <div
          className="glass h-full flex flex-col overflow-hidden transition-all duration-300 group-hover:border-indigo-500/40 group-hover:shadow-[0_12px_30px_rgba(99,102,241,0.15)]"
        >
          {/* Category Banner with Gradient */}
          <div
            className={`flex items-center gap-3 p-4 bg-gradient-to-r ${catMeta.gradient} relative overflow-hidden`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {catMeta.emoji}
            </div>
            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <span>{catMeta.label}</span>
                {listing.course && (
                  <>
                    <span>•</span>
                    <span className="bg-black/20 px-1.5 py-0.2 rounded text-white">{listing.course}</span>
                  </>
                )}
              </div>
              <h3 className="text-white font-bold text-sm leading-snug line-clamp-1 group-hover:text-indigo-100 transition-colors">
                {listing.title}
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-4 gap-3">
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{listing.description}</p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="badge text-[11px] px-2 py-0.5 font-semibold"
                style={{ color: modeMeta.color, background: modeMeta.bg, border: `1px solid ${modeMeta.color}30` }}
              >
                {modeMeta.label}
              </span>

              <span className="badge text-[11px] px-2 py-0.5" style={{ color: '#94a3b8', background: 'rgba(148,163,184,0.08)' }}>
                {CONDITION_LABELS[listing.condition]}
              </span>

              {listing.semester && (
                <span className="badge text-[11px] px-2 py-0.5 text-slate-400 bg-slate-800/60">
                  {listing.semester}
                </span>
              )}
            </div>

            {/* Price / Rent / Swap Details */}
            <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
              <div>
                {listing.mode === 'sell' && (
                  <span className="font-extrabold text-base text-emerald-400">
                    {listing.price != null ? `₹${listing.price}` : 'Free'}
                  </span>
                )}
                {listing.mode === 'rent' && (
                  <div>
                    <span className="font-extrabold text-base text-indigo-400">
                      ₹{listing.rent_price_per_week}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">/wk</span>
                  </div>
                )}
                {listing.mode === 'swap' && (
                  <span className="font-bold text-xs text-amber-400 flex items-center gap-1">
                    <RefreshCw size={12} /> Swap
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <MapPin size={11} className="text-indigo-400" />
                <span className="truncate max-w-[120px]">{listing.seller_hostel || 'Campus'}</span>
              </div>
            </div>

            {/* Seller profile footer */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                {listing.seller_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-slate-400 text-xs truncate max-w-[130px]">{listing.seller_name}</span>
              <span className="text-slate-600 text-[10px] ml-auto">
                {new Date(listing.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
