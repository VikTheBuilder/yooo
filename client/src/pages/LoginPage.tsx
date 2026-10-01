import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      toast.success('Welcome back to CampusSwap!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('campus123');
    setError('');
    toast('Demo credentials applied!', { icon: '🔑' });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[620px]"
      >
        {/* Left: Gradient Branding Panel */}
        <div className="hero-atmosphere lg:col-span-5 bg-gradient-to-br from-indigo-900/80 via-indigo-950/70 to-[#0B1020] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">

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

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 mb-4">
              <Sparkles size={12} /> Student Marketplace
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
              Welcome back to your campus hub.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Connect with fellow students, pick up calculators for exams, or sell your past semester books in minutes.
            </p>
          </div>

          {/* Middle: Perks list */}
          <div className="relative z-10 flex flex-col gap-3.5 my-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Hostel-to-Hostel Handover</p>
                <p className="text-[11px] text-slate-400">Zero courier fees, meet in campus quads</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <TrendingDown size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Save Up to 70%</p>
                <p className="text-[11px] text-slate-400">Direct peer-to-peer textbooks and equipment</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Verified Peer Profiles</p>
                <p className="text-[11px] text-slate-400">Hostel room and batch visibility on every listing</p>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08] text-slate-400 text-xs flex items-center gap-2">
            <GraduationCap size={15} className="text-indigo-400 shrink-0" />
            <span>Built exclusively for university campuses</span>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-slate-950/40">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign In</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                Enter your campus credentials to access your listings and activity.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium mb-6 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Campus Email"
                type="email"
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                className="mt-2"
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Logins Pill */}
            <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Demo Accounts (Password: campus123):
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('arjun@campus.edu')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-medium transition-colors cursor-pointer"
                >
                  Arjun (Hostel 4)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('priya@campus.edu')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-medium transition-colors cursor-pointer"
                >
                  Priya (Hostel 7)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('rahul@campus.edu')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-medium transition-colors cursor-pointer"
                >
                  Rahul (Hostel 2)
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              Don’t have an account yet?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
