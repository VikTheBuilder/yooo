import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Mail,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import type { Listing } from '../types';
import { CATEGORY_META, MODE_META, CONDITION_LABELS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successTx, setSuccessTx] = useState<{
    id: number;
    type: string;
    due_date?: string | null;
  } | null>(null);
  const [actionError, setActionError] = useState('');

  const fetchListing = () => {
    api.get(`/listings/${id}`)
      .then(r => setListing(r.data.listing))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/my-listings');
    } catch {
      alert('Failed to delete listing.');
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (newStatus: 'available' | 'sold') => {
    try {
      await api.patch(`/listings/${id}/status`, { status: newStatus });
      fetchListing();
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to update status');
    }
  };

  const handleTransact = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post('/transactions', { listingId: Number(id) });
      setSuccessTx(res.data.transaction);
      fetchListing();
    } catch (err: any) {
      setActionError(err.response?.data?.error ?? 'Transaction could not be completed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-lg">Loading resource...</div>
      </div>
    );
  }

  if (!listing) return null;

  const catMeta = CATEGORY_META[listing.category] || CATEGORY_META.other;
  const modeMeta = MODE_META[listing.mode] || MODE_META.sell;
  const isOwner = user?.id === listing.seller_id;
  const isAvailable = listing.status === 'available';

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Browse
        </motion.button>

        {/* Success Transaction Banner */}
        <AnimatePresence>
          {successTx && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 rounded-2xl mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
                borderColor: '#10b981',
              }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-emerald-300 font-bold text-lg">
                    {successTx.type === 'rent' ? 'Rental Request Confirmed!' : 'Exchange Initiated!'}
                  </h3>
                  <p className="text-slate-300 text-sm mt-1">
                    You have successfully claimed this resource. Reach out to the student seller at{' '}
                    <span className="text-white font-semibold underline">{listing.seller_email}</span> to arrange campus handover!
                  </p>
                  {successTx.due_date && (
                    <div className="flex items-center gap-2 mt-3 text-emerald-400 text-xs font-semibold bg-emerald-950/40 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/30">
                      <Calendar size={14} />
                      <span>Return Due Date: {new Date(successTx.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="mt-4 flex gap-3">
                    <Link to="/my-transactions" className="btn-primary text-xs py-2 px-4">
                      View In My Activity →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass overflow-hidden shadow-2xl"
        >
          {/* Hero header */}
          <div className={`flex flex-col sm:flex-row sm:items-center gap-5 p-8 bg-gradient-to-r ${catMeta.gradient} relative overflow-hidden`}>
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-5xl shrink-0 shadow-inner">
              {catMeta.emoji}
            </div>
            <div className="flex-1 z-10">
              <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                <span>{catMeta.label}</span>
                {listing.course && (
                  <>
                    <span>•</span>
                    <span className="bg-black/20 px-2 py-0.5 rounded text-white">{listing.course}</span>
                  </>
                )}
                {listing.semester && (
                  <>
                    <span>•</span>
                    <span>{listing.semester}</span>
                  </>
                )}
              </div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">{listing.title}</h1>
            </div>
          </div>

          <div className="p-8">
            {/* Status / Mode / Condition badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className="badge text-sm px-3.5 py-1.5 font-semibold"
                style={{ color: modeMeta.color, background: modeMeta.bg, border: `1px solid ${modeMeta.color}40` }}
              >
                {modeMeta.label}
              </span>

              <span className="badge text-sm px-3.5 py-1.5" style={{ color: '#94a3b8', background: 'rgba(148,163,184,0.08)' }}>
                {CONDITION_LABELS[listing.condition]}
              </span>

              <span
                className={`badge text-xs px-3 py-1 font-semibold uppercase tracking-wider ${
                  isAvailable
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                }`}
              >
                {listing.status}
              </span>

              {/* Price / Rent / Swap display */}
              <div className="ml-auto text-right">
                {listing.mode === 'sell' && (
                  <span className="text-3xl font-black text-emerald-400">
                    {listing.price != null ? `₹${listing.price}` : 'Free'}
                  </span>
                )}
                {listing.mode === 'rent' && (
                  <div>
                    <span className="text-3xl font-black text-indigo-400">
                      ₹{listing.rent_price_per_week}
                    </span>
                    <span className="text-slate-400 text-xs block">per week</span>
                  </div>
                )}
                {listing.mode === 'swap' && (
                  <span className="text-xl font-bold text-amber-400 flex items-center gap-1.5">
                    <RefreshCw size={18} /> Swap Resource
                  </span>
                )}
              </div>
            </div>

            {/* Swap Wanted callout */}
            {listing.mode === 'swap' && listing.swap_wanted && (
              <div className="p-4 rounded-xl mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
                <p className="font-semibold text-xs uppercase tracking-wider text-amber-400 mb-1">Looking to Swap For:</p>
                <p className="font-medium text-white">{listing.swap_wanted}</p>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Item Description</h2>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line text-base">{listing.description}</p>
            </div>

            {/* Seller profile card */}
            <div className="glass p-5 rounded-2xl mb-8 border border-white/5 bg-slate-900/60">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Campus Student Info</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  {listing.seller_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-base">{listing.seller_name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-indigo-400" />
                      {listing.seller_hostel || 'Campus Hostel'}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} className="text-indigo-400" />
                      {listing.seller_batch || 'Student'}
                    </span>
                    {listing.seller_email && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Mail size={13} className="text-indigo-400" />
                        {listing.seller_email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <Clock size={12} />
                  <span>Posted {new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Error if any */}
            {actionError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30">
                <AlertCircle size={16} />
                {actionError}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isOwner ? (
                <>
                  <Link to={`/listings/${listing.id}/edit`} className="btn-ghost flex-1 justify-center">
                    <Edit3 size={16} /> Edit Listing
                  </Link>

                  {isAvailable ? (
                    <button
                      onClick={() => handleToggleStatus('sold')}
                      className="btn-ghost flex-1 justify-center text-amber-300 border-amber-500/30 hover:border-amber-500"
                    >
                      <CheckCircle2 size={16} /> Mark as Sold/Rented
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus('available')}
                      className="btn-ghost flex-1 justify-center text-emerald-300 border-emerald-500/30 hover:border-emerald-500"
                    >
                      <Sparkles size={16} /> Mark Available Again
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn-ghost flex-1 justify-center text-red-400 border-red-500/30 hover:border-red-500"
                  >
                    <Trash2 size={16} />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : isAvailable ? (
                <button
                  onClick={handleTransact}
                  disabled={actionLoading}
                  className="btn-primary flex-1 justify-center py-3.5 text-base font-bold shadow-lg"
                >
                  <ShoppingBag size={18} />
                  {actionLoading
                    ? 'Processing...'
                    : listing.mode === 'sell'
                    ? `Claim & Buy (₹${listing.price})`
                    : listing.mode === 'rent'
                    ? `Rent for 7 Days (₹${listing.rent_price_per_week}/wk)`
                    : 'Request This Swap'}
                </button>
              ) : (
                <div className="flex-1 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-slate-400 text-sm font-medium">
                  This resource has been {listing.status}. Check back later or browse other listings!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
