import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Search,
  BookOpen,
  FlaskConical,
  Calculator,
  FileText,
  Package,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Zap,
  Repeat
} from 'lucide-react';
import type { Listing, Stats } from '../types';
import { CATEGORY_META } from '../lib/constants';
import ListingCard from '../components/ListingCard';
import api from '../lib/api';

const HERO_CATEGORIES = [
  { key: 'book',          icon: BookOpen,     label: 'Textbooks' },
  { key: 'notes',         icon: FileText,     label: 'Lecture Notes' },
  { key: 'calculator',    icon: Calculator,   label: 'Calculators' },
  { key: 'lab-equipment', icon: FlaskConical, label: 'Lab Equipment' },
  { key: 'other',         icon: Package,      label: 'Other Academic' },
] as const;

export default function HomePage() {
  const [recent, setRecent] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Stats>({ totalListings: 0, openRequests: 0, completedTransactions: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/listings').then(r => setRecent((r.data.listings || []).slice(0, 4))).catch(() => {}),
      api.get('/stats').then(r => setStats(r.data.stats)).catch(() => {}),
    ]);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Glow blobs */}
        <div className="glow-blob w-96 h-96 bg-indigo-500 top-0 left-1/4" style={{ position: 'absolute' }} />
        <div className="glow-blob w-80 h-80 bg-purple-600 bottom-0 right-1/4" style={{ position: 'absolute' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
            >
              <Sparkles size={13} className="text-indigo-400" />
              Campus-Only Student Marketplace • Fast, Local & Safe
            </span>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              Trade Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Study Better on Campus.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Buy, sell, rent, or swap textbooks, lecture notes, scientific calculators, and lab gear directly with students in your hostels and batches.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/listings" className="btn-primary text-base px-8 py-3.5 shadow-xl">
                <Search size={18} />
                Browse Campus Resources
              </Link>
              <Link to="/requests" className="btn-ghost text-base px-7 py-3.5 border-indigo-500/30 hover:border-indigo-500">
                <HelpCircle size={18} className="text-indigo-400" />
                Request an Item
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Campus Live Stats Bar ─── */}
      <section className="py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 border border-white/5 shadow-lg text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-black text-indigo-400">
                {stats.totalListings}
              </div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                Active Listings
              </span>
            </div>

            <div className="flex flex-col items-center border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0">
              <div className="text-3xl font-black text-amber-400">
                {stats.openRequests}
              </div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                Open Student Requests
              </span>
            </div>

            <div className="flex flex-col items-center border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0">
              <div className="text-3xl font-black text-emerald-400">
                {stats.completedTransactions}
              </div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                Completed Exchanges
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category Cards ─── */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Explore by Academic Category</h2>
            <p className="text-slate-400 text-sm">Find exactly what you need for this semester’s courses.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {HERO_CATEGORIES.map(({ key, label }, i) => {
              const meta = CATEGORY_META[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Link
                    to={`/listings?category=${key}`}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${meta.gradient} bg-opacity-20 border border-white/10 hover:border-indigo-400/50 shadow-md transition-all group`}
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                      {meta.emoji}
                    </span>
                    <span className="text-white font-bold text-sm text-center">{label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Why CampusSwap Features ─── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Hostel-to-Hostel Delivery</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              No shipping delays. Meet fellow students at your hostel, library, or cafeteria in minutes.
            </p>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Repeat size={20} />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Buy, Rent, or Swap</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Rent calculators for exam week, swap old books for new semester guides, or buy second-hand at 70% off.
            </p>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Verified Campus Peers</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every member belongs to your campus community with hostel and batch details verified.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Recent Listings ─── */}
      {recent.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Featured Campus Listings</h2>
                <p className="text-slate-400 text-xs">Fresh resources posted by campus students</p>
              </div>
              <Link to="/listings" className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 flex items-center gap-1">
                View all ({stats.totalListings}) <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recent.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Bottom CTA ─── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center glass p-10 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
          <div className="glow-blob w-64 h-64 bg-indigo-600/30 -top-20 -left-20" style={{ position: 'absolute' }} />
          <h2 className="text-3xl font-black text-white mb-3">Have academic items lying around?</h2>
          <p className="text-slate-300 text-sm mb-8 max-w-lg mx-auto">
            Help out junior batches with your old textbooks, lab coats, and calculators. Post in seconds!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create" className="btn-primary text-sm px-8 py-3.5 shadow-lg">
              Post a Listing <ArrowRight size={16} />
            </Link>
            <Link to="/requests" className="btn-ghost text-sm px-8 py-3.5">
              Check Student Requests
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
