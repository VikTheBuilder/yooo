import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Edit3, CheckCircle2, ShoppingBag, Clock, Mail, Calendar, HelpCircle, Package, ArrowRight, Trash2 } from 'lucide-react';
import type { Listing, Transaction, RequestItem } from '../types';
import { CATEGORY_META, MODE_META } from '../lib/constants';
import api from '../lib/api';

type Tab = 'listings' | 'requests' | 'deals';

function rentalDueBadge(dueDate: string): { label: string; className: string } {
  const [year, month, day] = dueDate.slice(0, 10).split('-').map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { label: 'Overdue', className: 'text-red-300 bg-red-500/10 border-red-500/30' };
  if (days === 0) return { label: 'Due today', className: 'text-amber-300 bg-amber-500/10 border-amber-500/30' };
  return { label: `Due in ${days} ${days === 1 ? 'day' : 'days'}`, className: 'text-amber-300 bg-amber-500/10 border-amber-500/30' };
}

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAll = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setLoadError(false);
    }
    try {
      const [listRes, txRes, reqRes] = await Promise.all([
        api.get('/my/listings'),
        api.get('/my/transactions'),
        api.get('/my/requests'),
      ]);
      setListings(listRes.data.listings || []);
      setTransactions(txRes.data.transactions || []);
      setRequests(reqRes.data.requests || []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'available' ? 'sold' : 'available';
    try {
      await api.patch(`/listings/${id}/status`, { status: nextStatus });
      fetchAll(true);
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to update status');
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/listings/${id}`);
      await fetchAll(true);
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Student Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your active listings, track borrowed items, and view campus requests.
            </p>
          </div>
          <Link to="/create" className="btn-primary self-start sm:self-auto py-2.5 px-4 shadow-lg text-sm">
            <PlusCircle size={16} /> Post New Resource
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1.5 glass rounded-2xl mb-8 border border-white/5 w-full sm:w-auto sm:max-w-fit">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={15} />
            <span>My Listings</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle size={15} />
            <span>My Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'deals'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={15} />
            <span>My Deals</span>
          </button>
        </div>

        {loadError ? (
          <div role="alert" className="glass p-10 text-center rounded-2xl border border-amber-400/20">
            <p className="text-white font-bold">Activity couldn’t load</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Check your connection and retry.</p>
            <button type="button" onClick={() => fetchAll(true)} className="btn-ghost text-xs mx-auto">
              <Clock size={14} /> Retry
            </button>
          </div>
        ) : (
        <>
        {/* Tab 1: My Listings */}
        {activeTab === 'listings' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <span className="text-5xl mb-4 block">📦</span>
                <p className="text-lg font-semibold text-white">No listings posted yet</p>
                <p className="text-slate-400 text-sm mb-6 mt-1">Sell or rent textbooks, notes, and lab gear to peers.</p>
                <Link to="/create" className="btn-primary text-xs mx-auto">
                  Create First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(item => {
                  const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;
                  const modeMeta = MODE_META[item.mode] || MODE_META.sell;
                  const isAvailable = item.status === 'available';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 hover:border-indigo-500/30 transition-all shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${catMeta.gradient} flex items-center justify-center text-2xl shrink-0 shadow-md`}>
                          {catMeta.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="badge text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider"
                              style={{ color: modeMeta.color, background: modeMeta.bg }}
                            >
                              {modeMeta.label}
                            </span>
                            <span
                              className={`badge text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                                isAvailable
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                            {item.course && (
                              <span className="text-slate-400 text-xs font-semibold">
                                {item.course}
                              </span>
                            )}
                          </div>
                          <Link to={`/listing/${item.id}`} className="text-white font-bold hover:text-indigo-300 transition-colors text-base block">
                            {item.title}
                          </Link>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {item.mode === 'sell' && `₹${item.price ?? 0}`}
                            {item.mode === 'rent' && `₹${item.rent_price_per_week ?? 0}/week`}
                            {item.mode === 'swap' && `Swap for: ${item.swap_wanted || 'Other resource'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 self-end sm:self-center">
                        {isAvailable || !item.has_transactions || item.status === 'closed' ? (
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className={`btn-ghost text-xs py-1.5 px-3 ${
                              isAvailable
                                ? 'text-amber-400 border-amber-500/30 hover:border-amber-500'
                                : 'text-emerald-400 border-emerald-500/30 hover:border-emerald-500'
                            }`}
                          >
                            <CheckCircle2 size={13} />
                            {isAvailable ? 'Mark Sold' : 'Mark Available'}
                          </button>
                        ) : (
                          <span className="badge text-[10px] uppercase bg-white/5 text-slate-400">{item.status}</span>
                        )}

                        {!item.has_transactions && (
                          <>
                            <Link to={`/listings/${item.id}/edit`} className="btn-ghost text-xs py-1.5 px-3">
                              <Edit3 size={13} /> Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteListing(item.id)}
                              disabled={deletingId === item.id}
                              className="btn-ghost text-xs py-1.5 px-3 text-red-300 border-red-500/25 hover:border-red-500 disabled:opacity-50"
                              aria-label={`Delete ${item.title}`}
                            >
                              <Trash2 size={13} /> {deletingId === item.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Requests */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="glass h-24 animate-pulse rounded-2xl" />)}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <span className="text-5xl mb-4 block">🙋</span>
                <p className="text-lg font-semibold text-white">No requests posted</p>
                <p className="text-slate-400 text-sm mb-6 mt-1">Your resource requests will appear here.</p>
                <Link to="/requests" className="btn-primary text-xs mx-auto">Open Request Board</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {req.course && <span className="badge text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300">{req.course}</span>}
                        {req.semester && <span className="badge text-[10px] px-2 py-0.5 bg-white/5 text-slate-300">{req.semester}</span>}
                        <span className={`badge text-[10px] px-2 py-0.5 uppercase ${req.status === 'open' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{req.status}</span>
                      </div>
                      <h3 className="text-white font-bold">{req.title}</h3>
                      {req.note && <p className="text-slate-400 text-sm mt-1">{req.note}</p>}
                    </div>
                    <span className="text-xs text-slate-500">{new Date(req.created_at).toLocaleDateString()}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Deals */}
        {activeTab === 'deals' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <span className="text-5xl mb-4 block">🛍️</span>
                <p className="text-lg font-semibold text-white">No items claimed yet</p>
                <p className="text-slate-400 text-sm mb-6 mt-1">Browse campus listings to buy, rent, or swap academic materials.</p>
                <Link to="/" className="btn-primary text-xs mx-auto">
                  Browse Resources
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map(tx => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider border border-indigo-500/30">
                          {tx.type}
                        </span>
                        <span className="badge text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/30">
                          {tx.status}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock size={11} /> {new Date(tx.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-base">{tx.listing_title || `Listing #${tx.listing_id}`}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span>
                          Seller: <strong className="text-slate-200">{tx.seller_name || 'Campus Peer'}</strong>
                        </span>
                        {tx.seller_email && (
                          <a href={`mailto:${tx.seller_email}`} className="flex items-center gap-1 text-indigo-300 hover:text-indigo-200">
                            <Mail size={12} /> {tx.seller_email}
                          </a>
                        )}
                        {tx.due_date && (
                          <span className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded border ${rentalDueBadge(tx.due_date).className}`}>
                            <Calendar size={12} /> {rentalDueBadge(tx.due_date).label} · Return {new Date(`${tx.due_date}T00:00:00`).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link to={`/listing/${tx.listing_id}`} className="btn-ghost text-xs py-1.5 px-3.5 self-end sm:self-center flex items-center gap-1">
                      View Item <ArrowRight size={13} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
