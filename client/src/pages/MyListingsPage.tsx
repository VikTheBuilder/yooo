import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Edit3, CheckCircle2, ShoppingBag, Clock, Mail, Calendar, HelpCircle, Package, ArrowRight } from 'lucide-react';
import type { Listing, Transaction, RequestItem } from '../types';
import { CATEGORY_META, MODE_META } from '../lib/constants';
import api from '../lib/api';

type Tab = 'listings' | 'transactions' | 'requests';

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [listRes, txRes, reqRes] = await Promise.all([
        api.get('/my/listings').catch(() => ({ data: { listings: [] } })),
        api.get('/my/transactions').catch(() => ({ data: { transactions: [] } })),
        api.get('/my/requests').catch(() => ({ data: { requests: [] } })),
      ]);
      setListings(listRes.data.listings || []);
      setTransactions(txRes.data.transactions || []);
      setRequests(reqRes.data.requests || []);
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
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to update status');
    }
  };

  const handleFulfillRequest = async (id: number) => {
    try {
      await api.patch(`/requests/${id}/fulfill`);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to fulfill request');
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
        <div className="flex items-center gap-2 p-1.5 glass rounded-2xl mb-8 border border-white/5 max-w-fit">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={15} />
            <span>My Listings ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transactions'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={15} />
            <span>Claimed & Borrowed ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle size={15} />
            <span>My Requests ({requests.length})</span>
          </button>
        </div>

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
                          <Link to={`/listings/${item.id}`} className="text-white font-bold hover:text-indigo-300 transition-colors text-base block">
                            {item.title}
                          </Link>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {item.mode === 'sell' && `₹${item.price ?? 0}`}
                            {item.mode === 'rent' && `₹${item.rent_price_per_week ?? 0}/week`}
                            {item.mode === 'swap' && `Swap for: ${item.swap_wanted || 'Other resource'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
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

                        <Link to={`/listings/${item.id}/edit`} className="btn-ghost text-xs py-1.5 px-3">
                          <Edit3 size={13} /> Edit
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Transactions */}
        {activeTab === 'transactions' && (
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
                <Link to="/listings" className="btn-primary text-xs mx-auto">
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
                          <span className="flex items-center gap-1 text-indigo-300">
                            <Mail size={12} /> {tx.seller_email}
                          </span>
                        )}
                        {tx.due_date && (
                          <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                            <Calendar size={12} /> Return Due: {new Date(tx.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link to={`/listings/${tx.listing_id}`} className="btn-ghost text-xs py-1.5 px-3.5 self-end sm:self-center flex items-center gap-1">
                      View Item <ArrowRight size={13} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Requests */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <span className="text-5xl mb-4 block">🙋‍♂️</span>
                <p className="text-lg font-semibold text-white">No requests posted</p>
                <p className="text-slate-400 text-sm mb-6 mt-1">Need a specific textbook or calculator? Post a request!</p>
                <Link to="/requests" className="btn-primary text-xs mx-auto">
                  Go to Request Board
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => {
                  const isOpen = req.status === 'open';
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {req.course && (
                            <span className="badge text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                              {req.course}
                            </span>
                          )}
                          <span
                            className={`badge text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                              isOpen
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-white font-bold text-base">{req.title}</h3>
                        {req.note && <p className="text-slate-400 text-xs mt-1">"{req.note}"</p>}
                      </div>

                      {isOpen && (
                        <button
                          onClick={() => handleFulfillRequest(req.id)}
                          className="btn-ghost text-xs py-1.5 px-3 text-emerald-400 border-emerald-500/30 hover:border-emerald-500 self-end sm:self-center"
                        >
                          <CheckCircle2 size={13} /> Mark Fulfilled
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
