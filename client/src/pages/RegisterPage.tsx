import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  GraduationCap,
  CheckCircle,
  Users,
  Repeat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    hostel: '',
    batch: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.hostel.trim() || !form.batch.trim()) {
      setError('Please fill in all required campus fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        hostel: form.hostel.trim(),
        batch: form.batch.trim(),
      });
      toast.success('Account created successfully! Welcome to CampusSwap 🎉');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error ?? err.response?.data?.errors?.[0] ?? 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[660px]"
      >
        {/* Left: Gradient Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-purple-950/70 to-[#0B1020] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
          {/* Ambient glow */}
          <div className="glow-blob w-72 h-72 bg-purple-500/25 -top-20 -left-20" />
          <div className="glow-blob w-60 h-60 bg-indigo-600/20 -bottom-20 -right-20" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <BookOpen size={20} />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Campus<span className="gradient-text font-black">Swap</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/25 mb-4">
              <Sparkles size={12} /> Join CampusSwap
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
              Your campus peer exchange starts here.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Create your verified student account to borrow textbooks, rent lab gear, and share notes with peers.
            </p>
          </div>

          {/* Middle: Perks list */}
          <div className="relative z-10 flex flex-col gap-3.5 my-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <CheckCircle size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Free & Instant Setup</p>
                <p className="text-[11px] text-slate-400">Zero subscription, 100% peer powered</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Repeat size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Flexible Exchange Modes</p>
                <p className="text-[11px] text-slate-400">Sell permanently, rent weekly, or swap</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Direct Student Trust</p>
                <p className="text-[11px] text-slate-400">Hostel room and batch details on listings</p>
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] text-slate-400 text-xs flex items-center gap-2">
            <GraduationCap size={15} className="text-purple-400 shrink-0" />
            <span>Open to all campus departments and hostels</span>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-slate-950/40">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Join the campus marketplace in under 30 seconds.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium mb-5 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Campus Email"
                name="email"
                type="email"
                placeholder="you@campus.edu"
                value={form.email}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Hostel / Hall"
                  name="hostel"
                  placeholder="e.g. Hostel 4, Rm 212"
                  value={form.hostel}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Batch / Year"
                  name="batch"
                  placeholder="e.g. Batch of 2025"
                  value={form.batch}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                fullWidth
                rightIcon={<ArrowRight size={16} />}
                className="mt-3"
              >
                Create Account
              </Button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
