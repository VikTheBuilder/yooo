import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Listing, ListingCategory, ListingMode, ListingCondition, ListingStatus } from '../types';
import { CATEGORY_META, MODE_META, CONDITION_LABELS, SEMESTER_OPTIONS } from '../lib/constants';
import api from '../lib/api';

const CATEGORIES = Object.keys(CATEGORY_META) as ListingCategory[];
const MODES = Object.keys(MODE_META) as ListingMode[];
const CONDITIONS = Object.keys(CONDITION_LABELS) as ListingCondition[];
const STATUSES: { value: ListingStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
  { value: 'swapped', label: 'Swapped' },
  { value: 'closed', label: 'Closed / Inactive' },
];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
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
    status: 'available' as ListingStatus,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => {
        const l: Listing = r.data.listing;
        setForm({
          title: l.title,
          description: l.description,
          category: l.category,
          mode: l.mode,
          course: l.course ?? '',
          semester: l.semester ?? 'Semester 1',
          condition: l.condition,
          price: l.price != null ? String(l.price) : '',
          rent_price_per_week: l.rent_price_per_week != null ? String(l.rent_price_per_week) : '',
          swap_wanted: l.swap_wanted ?? '',
          status: l.status,
        });
      })
      .catch(() => navigate('/my-listings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        mode: form.mode,
        course: form.course.trim() || null,
        semester: form.semester || null,
        condition: form.condition,
        price: form.mode === 'sell' && form.price !== '' ? parseFloat(form.price) : null,
        rent_price_per_week: form.mode === 'rent' && form.rent_price_per_week !== '' ? parseFloat(form.rent_price_per_week) : null,
        swap_wanted: form.mode === 'swap' ? form.swap_wanted.trim() : null,
        status: form.status,
      };
      await api.put(`/listings/${id}`, payload);
      navigate(`/listings/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.errors?.[0] ?? 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading listing details…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-1">Edit Listing</h1>
            <p className="text-slate-400 text-sm">Update item details or manage status.</p>
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
              {/* Status */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Listing Status</label>
                <select className="input" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Title</label>
                <input
                  className="input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category + Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Category</label>
                  <select className="input" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CATEGORY_META[c].emoji} {CATEGORY_META[c].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Mode</label>
                  <select className="input" name="mode" value={form.mode} onChange={handleChange}>
                    {MODES.map(m => (
                      <option key={m} value={m}>{MODE_META[m].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course + Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Course Code</label>
                  <input
                    className="input"
                    name="course"
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
                <select className="input" name="condition" value={form.condition} onChange={handleChange}>
                  {CONDITIONS.map(c => (
                    <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {/* Price / Rent / Swap based on mode */}
              {form.mode === 'sell' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Selling Price (₹)</label>
                  <input
                    className="input"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>
              )}

              {form.mode === 'rent' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Rent Price / Week (₹)</label>
                  <input
                    className="input"
                    type="number"
                    name="rent_price_per_week"
                    value={form.rent_price_per_week}
                    onChange={handleChange}
                  />
                </div>
              )}

              {form.mode === 'swap' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Item Wanted in Swap</label>
                  <input
                    className="input"
                    name="swap_wanted"
                    value={form.swap_wanted}
                    onChange={handleChange}
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
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-2 py-3 text-base">
                <Save size={18} />
                {saving ? 'Saving changes…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
