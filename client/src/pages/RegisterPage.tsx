import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  EyeOff,
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-5xl border-[3px] border-black shadow-[6px_6px_0_0_#000] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]"
      >
        {/* Left: Branding Panel */}
        <div className="lg:col-span-5 bg-[#B79CFF] p-8 sm:p-10 flex flex-col justify-between border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black">

          {/* Top Brand Header */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-10 h-10 bg-black flex items-center justify-center text-[#FFE600] border-[2px] border-black shadow-[2px_2px_0_0_#000] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_0_#000] transition-all duration-100">
                <BookOpen size={20} />
              </div>
              <span className="font-black text-xl text-black tracking-tight uppercase">
                CampusSwap
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black bg-[#FFE600] border-[2px] border-black shadow-[2px_2px_0_0_#000] mb-5 font-mono">
              ✨ Join CampusSwap
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight mb-4 uppercase">
              Your campus peer exchange starts here.
            </h2>
            <p className="text-black/70 text-sm leading-relaxed mb-6 font-medium normal-case tracking-normal">
              Create your verified student account to borrow textbooks, rent lab gear, and share notes with peers.
            </p>
          </div>

          {/* Perks list */}
          <div className="flex flex-col gap-3 my-4">
            {[
              { icon: <CheckCircle size={16} />, title: 'Free & Instant Setup', sub: 'Zero subscription, 100% peer powered', bg: '#FFE600' },
              { icon: <Repeat size={16} />, title: 'Flexible Exchange Modes', sub: 'Sell permanently, rent weekly, or swap', bg: '#4D7CFF' },
              { icon: <Users size={16} />, title: 'Direct Student Trust', sub: 'Hostel room and batch details on listings', bg: '#FF6B9D' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white border-[2px] border-black shadow-[2px_2px_0_0_#000]">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 border-[2px] border-black" style={{ backgroundColor: item.bg }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-black uppercase">{item.title}</p>
                  <p className="text-[11px] text-black/60 font-medium normal-case">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom info */}
          <div className="pt-4 border-t-[2px] border-black text-black/70 text-xs flex items-center gap-2 font-medium">
            <GraduationCap size={15} className="text-black shrink-0" />
            <span>Open to all campus departments and hostels</span>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#FFF8E7]">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">Create Account</h1>
              <p className="text-black/60 text-sm mt-1 font-medium normal-case tracking-normal">
                Join the campus marketplace in under 30 seconds.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-[#FF6B9D] border-[3px] border-black shadow-[3px_3px_0_0_#000] text-black text-xs font-bold mb-5 uppercase tracking-wide">
                {error}
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
                    className="text-black/50 hover:text-black transition-colors cursor-pointer"
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

            <p className="text-center text-xs text-black/60 mt-6 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-black font-black underline hover:no-underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
