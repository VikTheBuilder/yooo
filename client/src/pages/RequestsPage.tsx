import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Clock, MapPin, AlertCircle, HelpCircle, Send, RefreshCw, X } from 'lucide-react';
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
    <div className="min-h-screen py-10 px-4 bg-[#FFF8E7]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-1">Student Request Board</h1>
            <p className="text-black/60 text-sm font-medium normal-case tracking-normal">
              Can't find what you need? Post a request and campus peers will help you out.
            </p>
          </div>

          <button
            onClick={openRequestModal}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto py-2.5 px-4 text-sm"
          >
            <Plus size={16} /> Post a Request
          </button>
        </div>

        {/* Modal / Form for posting request */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="bg-[#FFF8E7] border-[3px] border-black shadow-[6px_6px_0_0_#000] p-6 sm:p-8 w-full max-w-lg relative"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-black uppercase flex items-center gap-2">
                    <HelpCircle size={20} className="text-black" />
                    Request a Resource
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    aria-label="Close request form"
                    className="p-1.5 border-[2px] border-black bg-[#FF6B9D] hover:shadow-[2px_2px_0_0_#000] transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-black text-xs mb-4 p-3 bg-[#FF6B9D] border-[2px] border-black font-bold uppercase">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">
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
                    {titleError && <p className="text-xs font-bold text-[#FF6B9D] mt-1 uppercase">{titleError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">
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
                      <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">
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
                    <label className="block text-black text-xs font-black mb-1.5 uppercase tracking-widest">
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
              <div key={i} className="bg-white border-[3px] border-black/20 h-28 animate-pulse" />
            ))}
          </div>
        ) : listError ? (
          <div role="alert" className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-10 text-center max-w-md mx-auto">
            <AlertCircle size={24} className="mx-auto mb-3 text-black" />
            <h3 className="text-black font-black text-lg uppercase">Requests couldn't load</h3>
            <p className="text-black/60 text-sm mt-1 mb-4 font-medium normal-case">Check the server connection and try again.</p>
            <button type="button" onClick={() => fetchRequests(true)} className="btn-ghost text-xs mx-auto flex items-center gap-1">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-12 text-center max-w-md mx-auto">
            <span className="text-4xl mb-3 block">🙋‍♂️</span>
            <h3 className="text-black font-black text-lg mb-1 uppercase">No active requests</h3>
            <p className="text-black/60 text-sm mb-4 font-medium normal-case">Be the first to post a request for books, equipment, or notes!</p>
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
                  className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-5 flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000] transition-all duration-100"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {req.course && (
                          <span className="badge bg-[#B79CFF] text-black border-black text-[10px] px-2 py-0.5">
                            {req.course}
                          </span>
                        )}
                        {req.semester && (
                          <span className="badge bg-white text-black border-black text-[10px] px-2 py-0.5">
                            {req.semester}
                          </span>
                        )}
                        <span
                          className={`badge text-[10px] px-2 py-0.5 border-black ${
                            isOpen ? 'bg-[#FFE600] text-black' : 'bg-[#00D26A] text-black'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <span className="text-[11px] text-black/50 flex items-center gap-1 shrink-0 font-mono">
                        <Clock size={11} />
                        {timeAgo(req.created_at)}
                      </span>
                    </div>

                    <h3 className="text-black font-black text-base leading-snug mb-2 uppercase">{req.title}</h3>

                    {req.note && (
                      <p className="text-black/70 text-xs leading-relaxed mb-4 bg-[#FFF8E7] p-3 border-[2px] border-black/20 font-medium normal-case italic">
                        "{req.note}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t-[2px] border-black/20 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-7 h-7 bg-black text-[#FFE600] flex items-center justify-center text-[11px] font-black">
                        {req.user_name?.[0]?.toUpperCase() ?? 'S'}
                      </div>
                      <div>
                        <span className="text-black font-bold block uppercase text-[11px]">{req.user_name || 'Student'}</span>
                        <span className="text-black/50 text-[10px] flex items-center gap-1 font-medium">
                          <MapPin size={10} />
                          {req.hostel || 'Campus'}
                        </span>
                      </div>
                    </div>

                    {isOwner && isOpen && (
                      <button
                        onClick={() => handleFulfill(req.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black text-black uppercase border-[2px] border-black bg-[#00D26A] shadow-[2px_2px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] transition-all duration-100 cursor-pointer"
                        title="Mark request fulfilled"
                      >
                        <CheckCircle2 size={13} /> Fulfilled
                      </button>
                    )}
                    {!isOwner && isOpen && req.user_email && (
                      <a href={contactRequesterHref(req)} className="btn-primary text-xs py-1.5 px-3 shrink-0 inline-flex items-center gap-1">
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
