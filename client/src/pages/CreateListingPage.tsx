import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Eye, BookOpen, GraduationCap, Tags } from 'lucide-react';
import { CATEGORY_META, MODE_META, CONDITION_LABELS, SEMESTER_OPTIONS } from '../lib/constants';
import type { Listing, ListingCategory, ListingMode, ListingCondition } from '../types';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import { Input, Select, Button } from '../components/ui';
import api from '../lib/api';

const CATEGORIES = Object.keys(CATEGORY_META) as ListingCategory[];
const MODES = Object.keys(MODE_META) as ListingMode[];
const CONDITIONS = Object.keys(CONDITION_LABELS) as ListingCondition[];

type FormState = {
  title: string;
  description: string;
  category: ListingCategory;
  mode: ListingMode;
  course: string;
  semester: string;
  condition: ListingCondition;
  price: string;
  rent_price_per_week: string;
  swap_wanted: string;
};

type FieldKey = keyof FormState;

const INITIAL: FormState = {
  title: '',
  description: '',
  category: 'book',
  mode: 'sell',
  course: '',
  semester: 'Semester 1',
  condition: 'good',
  price: '',
  rent_price_per_week: '',
  swap_wanted: '',
};

function validateField(key: FieldKey, form: FormState): string | undefined {
  switch (key) {
    case 'title': {
      const t = form.title.trim();
      if (!t) return 'Title is required';
      if (t.length < 3) return 'At least 3 characters';
      if (t.length > 120) return 'Max 120 characters';
      return;
    }
    case 'description': {
      const d = form.description.trim();
      if (!d) return 'Description is required';
      if (d.length < 10) return 'At least 10 characters';
      if (d.length > 1000) return 'Max 1000 characters';
      return;
    }
    case 'course':
      if (form.course.length > 60) return 'Max 60 characters';
      return;
    case 'price':
      if (form.mode !== 'sell') return;
      if (!form.price.trim()) return 'Price is required';
      if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) return 'Enter a valid amount';
      return;
    case 'rent_price_per_week':
      if (form.mode !== 'rent') return;
      if (!form.rent_price_per_week.trim()) return 'Weekly rent is required';
      if (!Number.isFinite(Number(form.rent_price_per_week)) || Number(form.rent_price_per_week) < 0)
        return 'Enter a valid amount';
      return;
    case 'swap_wanted':
      if (form.mode !== 'swap') return;
      if (!form.swap_wanted.trim()) return 'Describe what you want in exchange';
      if (form.swap_wanted.length > 200) return 'Max 200 characters';
      return;
    default:
      return;
  }
}

function validateAll(form: FormState): Partial<Record<FieldKey, string>> {
  const keys: FieldKey[] = [
    'title',
    'description',
    'course',
    'price',
    'rent_price_per_week',
    'swap_wanted',
  ];
  const errors: Partial<Record<FieldKey, string>> = {};
  for (const key of keys) {
    const msg = validateField(key, form);
    if (msg) errors[key] = msg;
  }
  return errors;
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="glass p-6 sm:p-7 rounded-2xl border border-white/10 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-white font-bold text-base">{title}</h2>
          {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [previewCreatedAt] = useState(() => new Date().toISOString());

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key: FieldKey, value: string) => {
    setForm(f => {
      const next = { ...f, [key]: value };
      if (touched[key]) {
        setErrors(e => ({ ...e, [key]: validateField(key, next) }));
      }
      return next;
    });
    setSubmitError('');
  };

  const blurField = (key: FieldKey) => {
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(e => ({ ...e, [key]: validateField(key, form) }));
  };

  const previewListing: Listing = useMemo(
    () => ({
      id: 0,
      seller_id: user?.id ?? 0,
      title: form.title.trim() || 'Your listing title',
      description: form.description.trim() || 'Add a description so buyers know what they are getting.',
      category: form.category,
      course: form.course.trim() || null,
      semester: form.semester || null,
      condition: form.condition,
      mode: form.mode,
      price: form.mode === 'sell' && form.price ? parseFloat(form.price) : form.mode === 'sell' ? null : null,
      rent_price_per_week:
        form.mode === 'rent' && form.rent_price_per_week ? parseFloat(form.rent_price_per_week) : null,
      swap_wanted: form.mode === 'swap' ? form.swap_wanted.trim() || null : null,
      status: 'available',
      created_at: previewCreatedAt,
      seller_name: user?.name ?? 'You',
      seller_hostel: user?.hostel ?? 'Your hostel',
    }),
    [form, user, previewCreatedAt],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateAll(form);
    setErrors(nextErrors);
    setTouched({
      title: true,
      description: true,
      course: true,
      price: true,
      rent_price_per_week: true,
      swap_wanted: true,
    });
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setSubmitError('');
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
      navigate(`/listing/${res.data.listing.id}`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string; errors?: string[] } } };
      setSubmitError(ax.response?.data?.error ?? ax.response?.data?.errors?.[0] ?? 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  const showError = (key: FieldKey) => (touched[key] ? errors[key] : undefined);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-1">Sell / List an Item</h1>
            <p className="text-slate-400 text-sm">
              Post textbooks, notes, calculators, or lab gear for students on your campus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">
              {submitError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}

              <Section icon={BookOpen} title="Basic info" subtitle="What are you listing?">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map(c => {
                      const meta = CATEGORY_META[c];
                      const active = form.category === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setField('category', c)}
                          className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all"
                          style={{
                            background: active ? 'rgba(99,102,241,0.2)' : 'rgba(30,30,53,0.5)',
                            borderColor: active ? '#818cf8' : 'rgba(255,255,255,0.08)',
                            color: active ? '#c7d2fe' : '#94a3b8',
                          }}
                        >
                          <span className="text-2xl">{meta.emoji}</span>
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Title"
                  name="title"
                  placeholder="e.g. Introduction to Algorithms (CLRS)"
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  onBlur={() => blurField('title')}
                  error={showError('title')}
                />

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className={`input resize-none w-full ${showError('description') ? 'border-red-500/60' : ''}`}
                    placeholder="Edition, highlights, completeness, pickup notes…"
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    onBlur={() => blurField('description')}
                  />
                  {showError('description') && (
                    <p className="text-xs text-red-400 font-medium mt-1">{showError('description')}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Condition</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CONDITIONS.map(c => {
                      const active = form.condition === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setField('condition', c)}
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
              </Section>

              <Section icon={GraduationCap} title="Course & semester" subtitle="Help classmates find your item">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Course code"
                    name="course"
                    placeholder="e.g. CS201"
                    value={form.course}
                    onChange={e => setField('course', e.target.value)}
                    onBlur={() => blurField('course')}
                    error={showError('course')}
                  />
                  <Select
                    label="Semester"
                    value={form.semester}
                    onChange={e => setField('semester', e.target.value)}
                    options={SEMESTER_OPTIONS.map(s => ({ value: s, label: s }))}
                  />
                </div>
              </Section>

              <Section icon={Tags} title="Listing mode" subtitle="Choose how you want to offer this item">
                <div className="grid grid-cols-3 gap-2">
                  {MODES.map(m => {
                    const meta = MODE_META[m];
                    const active = form.mode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setForm(f => {
                            const next = { ...f, mode: m };
                            setErrors(prev => ({
                              ...prev,
                              price: validateField('price', next),
                              rent_price_per_week: validateField('rent_price_per_week', next),
                              swap_wanted: validateField('swap_wanted', next),
                            }));
                            return next;
                          });
                        }}
                        className="p-3 rounded-xl border text-sm font-semibold transition-all"
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

                {form.mode === 'sell' && (
                  <Input
                    label="Selling price (₹)"
                    type="number"
                    min={0}
                    step={1}
                    name="price"
                    placeholder="450"
                    value={form.price}
                    onChange={e => setField('price', e.target.value)}
                    onBlur={() => blurField('price')}
                    error={showError('price')}
                  />
                )}

                {form.mode === 'rent' && (
                  <Input
                    label="Rent per week (₹)"
                    type="number"
                    min={0}
                    step={1}
                    name="rent_price_per_week"
                    placeholder="50"
                    value={form.rent_price_per_week}
                    onChange={e => setField('rent_price_per_week', e.target.value)}
                    onBlur={() => blurField('rent_price_per_week')}
                    error={showError('rent_price_per_week')}
                    helperText="Standard campus rental is 7 days with a tracked due date."
                  />
                )}

                {form.mode === 'swap' && (
                  <Input
                    label="Swap wanted"
                    name="swap_wanted"
                    placeholder="e.g. Casio fx-991EX or EE201 textbook"
                    value={form.swap_wanted}
                    onChange={e => setField('swap_wanted', e.target.value)}
                    onBlur={() => blurField('swap_wanted')}
                    error={showError('swap_wanted')}
                  />
                )}
              </Section>

              <Button type="submit" isLoading={loading} leftIcon={<PlusCircle size={18} />} fullWidth size="lg">
                Publish listing
              </Button>
            </form>

            <aside className="lg:col-span-2 lg:sticky lg:top-24 space-y-4">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                <Eye size={16} className="text-indigo-400" />
                Live preview
              </div>
              <ListingCard listing={previewListing} preview />
              <p className="text-slate-500 text-xs text-center px-4">
                This is how your listing appears in the campus browse grid.
              </p>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
