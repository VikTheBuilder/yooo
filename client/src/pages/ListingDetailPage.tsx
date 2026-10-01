import { useEffect, useState, useCallback } from 'react';
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
  ShoppingBag,
  RefreshCw,
  Mail,
  GraduationCap,
  AlertCircle,
  X,
  Copy,
} from 'lucide-react';
import type { Listing, Transaction } from '../types';
import { CATEGORY_META, MODE_META, CONDITION_LABELS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { Button, EmptyState, Skeleton } from '../components/ui';
import api from '../lib/api';
import toast from 'react-hot-toast';

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    transaction: Transaction;
    sellerEmail: string;
  } | null>(null);
  const [actionError, setActionError] = useState('');

  const fetchListing = useCallback((showLoading = true) => {
    if (!id) return;
    if (showLoading) {
      setLoading(true);
      setNotFound(false);
      setLoadError(false);
    }
    api
      .get(`/listings/${id}`)
      .then(r => setListing(r.data.listing))
      .catch(err => {
        if (err.response?.status === 404) {
          setListing(null);
          setNotFound(true);
        } else {
          setListing(null);
          setLoadError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchListing(false);
  }, [fetchListing]);

  const handleDelete = async () => {
    if (!confirm('Delete this listing permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
      navigate('/my-listings');
    } catch {
      toast.error('Failed to delete listing');
      setDeleting(false);
    }
  };

  const closedStatusForMode = (mode: Listing['mode']) => {
    if (mode === 'rent') return 'rented';
    if (mode === 'swap') return 'swapped';
    return 'sold';
  };

  const handleMarkClosed = async () => {
    if (!listing) return;
    try {
      await api.patch(`/listings/${id}/status`, { status: closedStatusForMode(listing.mode) });
      toast.success('Listing marked as unavailable');
      fetchListing();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      toast.error(ax.response?.data?.error ?? 'Failed to update status');
    }
  };

  const handleMarkAvailable = async () => {
    try {
      await api.patch(`/listings/${id}/status`, { status: 'available' });
      toast.success('Listing is live again');
      fetchListing();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      toast.error(ax.response?.data?.error ?? 'Failed to update status');
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
      const tx = res.data.transaction as Transaction;
      const email = tx.seller_email ?? '';
      setConfirmModal({ transaction: tx, sellerEmail: email });
      fetchListing();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setActionError(ax.response?.data?.error ?? 'Could not complete this action.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success('Email copied');
    } catch {
      toast.error('Could not copy email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-10 px-4">
        <DetailSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="Couldn't load this listing"
          description="Check your connection and try again."
          action={
            <Button type="button" onClick={() => fetchListing()} leftIcon={<RefreshCw size={15} />}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <EmptyState
          icon="📭"
          title="Listing not found"
          description="This item may have been removed or the link is incorrect."
          action={
            <Link to="/" className="btn-primary text-sm">
              Back to browse
            </Link>
          }
        />
      </div>
    );
  }

  const catMeta = CATEGORY_META[listing.category] || CATEGORY_META.other;
  const modeMeta = MODE_META[listing.mode] || MODE_META.sell;
  const isOwner = user?.id === listing.seller_id;
  const isAvailable = listing.status === 'available';

  const actionLabel =
    listing.mode === 'sell'
      ? 'Buy now'
      : listing.mode === 'rent'
        ? 'Rent for 7 days'
        : 'Propose swap';

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to browse
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden shadow-2xl border border-white/10">
          <div className={`relative p-8 sm:p-10 bg-gradient-to-br ${catMeta.gradient} overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-5xl shrink-0 shadow-xl">
                {catMeta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">{catMeta.label}</p>
                <h1 className="text-white text-2xl sm:text-4xl font-black leading-tight">{listing.title}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  {listing.course && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/25 text-white">
                      {listing.course}
                    </span>
                  )}
                  {listing.semester && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/25 text-white/90">
                      {listing.semester}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className="badge text-sm px-3 py-1.5 font-semibold"
                style={{ color: modeMeta.color, background: modeMeta.bg, border: `1px solid ${modeMeta.color}40` }}
              >
                {modeMeta.label}
              </span>
              <span className="badge text-sm px-3 py-1.5 text-slate-300 bg-white/5 border border-white/10">
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
              <div className="ml-auto text-right">
                {listing.mode === 'sell' && (
                  <span className="text-3xl font-black text-emerald-400">
                    {listing.price != null ? `₹${listing.price}` : 'Free'}
                  </span>
                )}
                {listing.mode === 'rent' && (
                  <p className="text-3xl font-black text-indigo-400">
                    ₹{listing.rent_price_per_week}
                    <span className="text-sm font-semibold text-slate-400">/week</span>
                  </p>
                )}
                {listing.mode === 'swap' && listing.swap_wanted && (
                  <p className="text-sm font-semibold text-amber-300 max-w-[220px]">
                    Swap for {listing.swap_wanted}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Description</h2>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            <div className="glass p-5 rounded-2xl mb-8 border border-white/10 bg-white/[0.02]">
              <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Seller</h2>
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shrink-0">
                  {listing.seller_name?.[0]?.toUpperCase() ?? 'S'}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-white font-bold text-lg">{listing.seller_name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-indigo-400" />
                      {listing.seller_hostel || 'On campus'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-violet-400" />
                      {listing.seller_batch || 'Student'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} />
                    Posted {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {actionError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30">
                <AlertCircle size={16} />
                {actionError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {isOwner ? (
                <>
                  {!listing.has_transactions && (
                    <Link to={`/listings/${listing.id}/edit`} className="btn-ghost flex-1 justify-center">
                      <Edit3 size={16} /> Edit
                    </Link>
                  )}
                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={handleMarkClosed}
                      className="btn-ghost flex-1 justify-center text-amber-300 border-amber-500/30"
                    >
                      <CheckCircle2 size={16} /> Mark as sold
                    </button>
                  ) : !listing.has_transactions || listing.status === 'closed' ? (
                    <button
                      type="button"
                      onClick={handleMarkAvailable}
                      className="btn-ghost flex-1 justify-center text-emerald-300 border-emerald-500/30"
                    >
                      Mark available again
                    </button>
                  ) : (
                    <p className="flex-1 text-center text-xs text-slate-500 self-center">Deal recorded</p>
                  )}
                  {!listing.has_transactions && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleDelete}
                      isLoading={deleting}
                      className="flex-1"
                      leftIcon={<Trash2 size={16} />}
                    >
                      Delete
                    </Button>
                  )}
                </>
              ) : isAvailable ? (
                <Button
                  type="button"
                  onClick={handleTransact}
                  isLoading={actionLoading}
                  size="lg"
                  fullWidth
                  className="sm:flex-1"
                  leftIcon={
                    listing.mode === 'swap' ? <RefreshCw size={18} /> : <ShoppingBag size={18} />
                  }
                >
                  {actionLabel}
                </Button>
              ) : (
                <p className="flex-1 p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center text-slate-400 text-sm">
                  This listing is no longer available.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {confirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 glass p-6 sm:p-8 rounded-2xl border border-emerald-500/30 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 id="confirm-title" className="text-white font-bold text-lg">
                    Request confirmed
                  </h3>
                  <p className="text-slate-400 text-xs">Coordinate a campus handover with the seller.</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Email the seller to arrange pickup at their hostel or a campus meetup spot.
              </p>

              {confirmModal.sellerEmail ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10 mb-4">
                  <Mail size={16} className="text-indigo-400 shrink-0" />
                  <a
                    href={`mailto:${confirmModal.sellerEmail}`}
                    className="text-indigo-300 font-semibold text-sm truncate flex-1 hover:underline"
                  >
                    {confirmModal.sellerEmail}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyEmail(confirmModal.sellerEmail)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    title="Copy email"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-amber-400 text-sm mb-4">Seller contact is unavailable — check My Activity.</p>
              )}

              {confirmModal.transaction.due_date && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-500/25 mb-4">
                  <Calendar size={14} />
                  Return due {new Date(confirmModal.transaction.due_date).toLocaleDateString()}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Link to="/my-listings" className="btn-primary flex-1 justify-center text-sm py-2.5">
                  View my activity
                </Link>
                <button type="button" onClick={() => setConfirmModal(null)} className="btn-ghost flex-1 justify-center text-sm py-2.5">
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
