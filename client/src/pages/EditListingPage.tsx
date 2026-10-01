import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Listing, ListingCategory, ListingMode, ListingCondition } from '../types';
import { CATEGORY_META, MODE_META, CONDITION_LABELS, SEMESTER_OPTIONS } from '../lib/constants';
import api from '../lib/api';

const CATEGORIES = Object.keys(CATEGORY_META) as ListingCategory[];
const MODES = Object.keys(MODE_META) as ListingMode[];
const CONDITIONS = Object.keys(CONDITION_LABELS) as ListingCondition[];

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
      };
      await api.put(`/listings/${id}`, payload);
      navigate(`/listing/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.errors?.[0] ?? 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8E7]">
        <div className="text-black/50 font-bold uppercase animate-pulse font-mono text-sm">Loading listing details…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 bg-[#FFF8E7]">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black/60 hover:text-black mb-6 transition-colors text-sm font-bold uppercase cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-1">Edit Listing</h1>
            <p className="text-black/60 text-sm font-medium normal-case">Update the details students see on your listing.</p>
          </div>

          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-black text-sm mb-6 p-3 bg-[#FF6B9D] border-[3px] border-black font-bold uppercase"
              >
                <AlertCircle size={15} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title */}
              <div>
                <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Title</label>
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
                  <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Category</label>
                  <select className="input" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CATEGORY_META[c].emoji} {CATEGORY_META[c].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Mode</label>
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
                  <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Course Code</label>
                  <input
                    className="input"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Semester</label>
                  <select className="input" name="semester" value={form.semester} onChange={handleChange}>
                    {SEMESTER_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Condition</label>
                <select className="input" name="condition" value={form.condition} onChange={handleChange}>
                  {CONDITIONS.map(c => (
                    <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {form.mode === 'sell' && (
                <div>
                  <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Selling Price (₹)</label>
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
                  <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Rent Price / Week (₹)</label>
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
                  <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Item Wanted in Swap</label>
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
                <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">Description</label>
                <textarea
                  className="input resize-none"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-2 py-3 text-base inline-flex items-center gap-2">
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
