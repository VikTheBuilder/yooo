import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Clock, MapPin, AlertCircle, HelpCircle, Send, RefreshCw } from 'lucide-react';
import type { RequestItem } from '../types';
import { SEMESTER_OPTIONS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

function contactRequesterHref(request: RequestItem): string {
  const subject = encodeURIComponent(`I can help with: ${request.title}`);
  const course = request.course ? ` (${request.course})` : '';
  const body = encodeURIComponent(
    `Hi ${request.user_name || 'there'},\n\nI saw your request for ${request.title}${course} and I have this resource. Let me know if you would like to arrange a campus handover.\n\n`,
  );
  return `mailto:${request.user_email}?subject=${subject}&body=${body}`;
}

export default function RequestsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [now, setNow] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // New Request Form
  const [form, setForm] = useState({
    title: '',
    course: '',
    semester: 'Semester 1',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');

  const timeAgo = (value: string) => {
    const minutes = Math.max(0, Math.floor((now - new Date(value).getTime()) / 60000));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(value).toLocaleDateString();
  };

  const openRequestModal = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setTitleError('');
    setError('');
    setShowModal(true);
  };

  const fetchRequests = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests || []);
      setNow(Date.now());
      setListError(false);
    } catch {
      setRequests([]);
      setListError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    if (title.length < 3 || title.length > 120) {
      setTitleError(title.length < 3 ? 'Enter at least 3 characters.' : 'Use 120 characters or fewer.');
      return;
    }
    if (form.course.length > 60 || form.note.length > 500) {
      setError('Course must be 60 characters or fewer and notes 500 characters or fewer.');
      return;
    }
    setTitleError('');
    setSubmitting(true);
    setError('');

    try {
      await api.post('/requests', {
        title: form.title.trim(),
        course: form.course.trim() || null,
        semester: form.semester || null,
        note: form.note.trim() || null,
      });
      setForm({ title: '', course: '', semester: 'Semester 1', note: '' });
      setShowModal(false);
      await fetchRequests(true);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      await api.patch(`/requests/${id}/fulfill`);
      fetchRequests(true);
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to mark fulfilled');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Student Request Board</h1>
            <p className="text-slate-400 text-sm">
              Can't find what you need? Post a request and campus peers will help you out.
            </p>
          </div>

          <button
            onClick={openRequestModal}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto py-2.5 px-4 shadow-lg text-sm"
          >
            <Plus size={16} /> Post a Request
          </button>
        </div>

        {/* Modal / Form for posting request */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-6 sm:p-8 w-full max-w-lg rounded-2xl relative shadow-2xl border border-indigo-500/30"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HelpCircle size={20} className="text-indigo-400" />
                    Request an Academic Resource
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    aria-label="Close request form"
                    className="text-slate-400 hover:text-white text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                      What are you looking for?
                    </label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. Casio fx-991EX Calculator or Sedra & Smith Microelectronics"
                      value={form.title}
                      maxLength={120}
                      onChange={e => {
                        setForm(f => ({ ...f, title: e.target.value }));
                        if (e.target.value.trim().length >= 3) setTitleError('');
                      }}
                      onBlur={() => {
                        if (form.title.trim().length < 3) setTitleError('Enter at least 3 characters.');
                      }}
                      required
                    />
                    {titleError && <p className="text-xs text-red-400 mt-1">{titleError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                        Course Code
                      </label>
                      <input
                        className="input text-sm"
                        placeholder="e.g. CS201, EE102"
                        value={form.course}
                        maxLength={60}
                        onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                        Semester
                      </label>
                      <select
                        className="input text-sm"
                        value={form.semester}
                        onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                      >
                        {SEMESTER_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                      Additional Note / Urgency
                    </label>
                    <textarea
                      className="input text-sm resize-none"
                      rows={3}
                      maxLength={500}
                      placeholder="e.g. Need for mid-term prep this week, happy to pay weekly rent or buy!"
                      value={form.note}
                      onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-ghost text-xs px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary text-xs px-5 flex items-center gap-1.5"
                    >
                      <Send size={14} />
                      {submitting ? 'Submitting…' : 'Publish Request'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Requests List */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass h-28 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : listError ? (
          <div role="alert" className="glass p-10 text-center rounded-2xl max-w-md mx-auto">
            <AlertCircle size={24} className="mx-auto mb-3 text-amber-300" />
            <h3 className="text-white font-bold text-lg">Requests couldn’t load</h3>
            <p className="text-slate-400 text-sm mt-1 mb-4">Check the server connection and try again.</p>
            <button type="button" onClick={() => fetchRequests(true)} className="btn-ghost text-xs mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl max-w-md mx-auto">
            <span className="text-4xl mb-3 block">🙋‍♂️</span>
            <h3 className="text-white font-bold text-lg mb-1">No active requests</h3>
            <p className="text-slate-400 text-sm mb-4">Be the first to post a request for books, equipment, or notes!</p>
            <button onClick={openRequestModal} className="btn-primary text-xs mx-auto">
              Post Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => {
              const isOwner = user?.id === req.user_id;
              const isOpen = req.status === 'open';

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-5 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-indigo-500/30 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {req.course && (
                          <span className="badge text-[11px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                            {req.course}
                          </span>
                        )}
                        {req.semester && (
                          <span className="badge text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300">
                            {req.semester}
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
                      </div>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock size={11} />
                        {timeAgo(req.created_at)}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-base leading-snug mb-2">{req.title}</h3>

                    {req.note && (
                      <p className="text-slate-300 text-xs leading-relaxed mb-4 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                        "{req.note}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                      >
                        {req.user_name?.[0]?.toUpperCase() ?? 'S'}
                      </div>
                      <div>
                        <span className="text-white font-medium block">{req.user_name || 'Student'}</span>
                        <span className="text-slate-500 text-[10px] flex items-center gap-1">
                          <MapPin size={10} />
                          {req.hostel || 'Campus'}
                        </span>
                      </div>
                    </div>

                    {isOwner && isOpen && (
                      <button
                        onClick={() => handleFulfill(req.id)}
                        className="btn-ghost text-xs py-1 px-2.5 text-emerald-400 border-emerald-500/30 hover:border-emerald-500"
                        title="Mark request fulfilled"
                      >
                        <CheckCircle2 size={13} /> Mark Fulfilled
                      </button>
                    )}
                    {!isOwner && isOpen && req.user_email && (
                      <a href={contactRequesterHref(req)} className="btn-primary text-xs py-1.5 px-3 shrink-0">
                        <Send size={13} /> I have this
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
