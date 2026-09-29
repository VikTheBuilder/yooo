import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { CATEGORY_META, MODE_META, CONDITION_LABELS, SEMESTER_OPTIONS } from '../lib/constants';
import type { ListingCategory, ListingMode, ListingCondition } from '../types';
import api from '../lib/api';

const CATEGORIES = Object.keys(CATEGORY_META) as ListingCategory[];
const MODES = Object.keys(MODE_META) as ListingMode[];
const CONDITIONS = Object.keys(CONDITION_LABELS) as ListingCondition[];

export default function CreateListingPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'book' as ListingCategory,
    mode: 'sell' as ListingMode,
    course: '',
    semester: 'Semester 1',
    condition: 'good' as ListingCondition,
    price: '',
    rent_price_per_week: '',
    swap_wanted: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-validation
    if (form.mode === 'sell' && (!form.price || parseFloat(form.price) < 0)) {
      setError('Please provide a valid selling price');
      setLoading(false);
      return;
    }
    if (form.mode === 'rent' && (!form.rent_price_per_week || parseFloat(form.rent_price_per_week) < 0)) {
      setError('Please provide a valid weekly rental price');
      setLoading(false);
      return;
    }
    if (form.mode === 'swap' && !form.swap_wanted.trim()) {
      setError('Please specify what item you want in exchange');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        mode: form.mode,
        course: form.course.trim() || null,
        semester: form.semester || null,
        condition: form.condition,
        price: form.mode === 'sell' ? parseFloat(form.price) : null,
        rent_price_per_week: form.mode === 'rent' ? parseFloat(form.rent_price_per_week) : null,
        swap_wanted: form.mode === 'swap' ? form.swap_wanted.trim() : null,
      };

      const res = await api.post('/listings', payload);
      navigate(`/listings/${res.data.listing.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.errors?.[0] ?? 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-1">Post a Resource</h1>
            <p className="text-slate-400 text-sm">Sell, rent, or swap academic materials with students on your campus.</p>
          </div>

          <div className="glass p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-red-400 text-sm mb-6 p-3 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertCircle size={15} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Category Selector */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CATEGORIES.map(c => {
                    const meta = CATEGORY_META[c];
                    const active = form.category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, category: c }))}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all border text-xs font-medium"
                        style={{
                          background: active ? 'rgba(99,102,241,0.2)' : 'rgba(30,30,53,0.5)',
                          borderColor: active ? '#818cf8' : 'rgba(255,255,255,0.08)',
                          color: active ? '#c7d2fe' : '#94a3b8',
                        }}
                      >
                        <span className="text-2xl">{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selector (Sell / Rent / Swap) */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Listing Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {MODES.map(m => {
                    const meta = MODE_META[m];
                    const active = form.mode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, mode: m }))}
                        className="p-3 rounded-xl transition-all border text-sm font-semibold text-center"
                        style={{
                          background: active ? meta.bg : 'rgba(30,30,53,0.5)',
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

              {/* Title */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Listing Title</label>
                <input
                  className="input"
                  name="title"
                  placeholder="e.g. Introduction to Algorithms (CLRS) 4th Edition"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Course + Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Course Code / Subject</label>
                  <input
                    className="input"
                    name="course"
                    placeholder="e.g. CS201 or MA101"
                    value={form.course}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Semester</label>
                  <select className="input" name="semester" value={form.semester} onChange={handleChange}>
                    {SEMESTER_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Condition</label>
                <div className="grid grid-cols-3 gap-3">
                  {CONDITIONS.map(c => {
                    const active = form.condition === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, condition: c }))}
                        className="p-2.5 rounded-xl border text-xs font-medium transition-all"
                        style={{
                          background: active ? 'rgba(99,102,241,0.2)' : 'rgba(30,30,53,0.5)',
                          borderColor: active ? '#818cf8' : 'rgba(255,255,255,0.08)',
                          color: active ? '#ffffff' : '#94a3b8',
                        }}
                      >
                        {CONDITION_LABELS[c]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode-specific pricing/exchange fields */}
              {form.mode === 'sell' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Selling Price (₹)</label>
                  <input
                    className="input"
                    type="number"
                    name="price"
                    placeholder="e.g. 450"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {form.mode === 'rent' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Rent Price Per Week (₹)</label>
                  <input
                    className="input"
                    type="number"
                    name="rent_price_per_week"
                    placeholder="e.g. 50"
                    min="0"
                    step="1"
                    value={form.rent_price_per_week}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-slate-500 text-xs mt-1">Standard rental duration is 7 days with due-date tracking.</p>
                </div>
              )}

              {form.mode === 'swap' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Item Wanted in Exchange</label>
                  <input
                    className="input"
                    name="swap_wanted"
                    placeholder="e.g. Casio Scientific Calculator or EE201 book"
                    value={form.swap_wanted}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  className="input resize-none"
                  name="description"
                  rows={4}
                  placeholder="Mention edition, highlighting, completeness, or any specific details..."
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2 py-3 text-base">
                <PlusCircle size={18} />
                {loading ? 'Posting...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
