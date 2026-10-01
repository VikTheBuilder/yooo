import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-5xl border-[3px] border-black shadow-[6px_6px_0_0_#000] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]"
      >
        {/* Left: Branding Panel */}
        <div className="lg:col-span-5 bg-[#4D7CFF] p-8 sm:p-10 flex flex-col justify-between border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black">

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
              🎓 Student Marketplace
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight mb-4 uppercase">
              Welcome back to your campus hub.
            </h2>
            <p className="text-black/70 text-sm leading-relaxed mb-6 font-medium normal-case tracking-normal">
              Connect with fellow students, pick up calculators for exams, or sell your past semester books in minutes.
            </p>
          </div>

          {/* Perks list */}
          <div className="flex flex-col gap-3 my-4">
            {[
              { icon: <Zap size={16} />, title: 'Hostel-to-Hostel Handover', sub: 'Zero courier fees, meet in campus quads', bg: '#FFE600' },
              { icon: <TrendingDown size={16} />, title: 'Save Up to 70%', sub: 'Direct peer-to-peer textbooks and equipment', bg: '#00D26A' },
              { icon: <ShieldCheck size={16} />, title: 'Verified Peer Profiles', sub: 'Hostel room and batch visibility on every listing', bg: '#FF6B9D' },
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

          {/* Bottom badge */}
          <div className="pt-4 border-t-[2px] border-black text-black/70 text-xs flex items-center gap-2 font-medium">
            <GraduationCap size={15} className="text-black shrink-0" />
            <span>Built exclusively for university campuses</span>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#FFF8E7]">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">Sign In</h1>
              <p className="text-black/60 text-sm mt-1.5 font-medium normal-case tracking-normal">
                Enter your campus credentials to access your listings and activity.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-[#FF6B9D] border-[3px] border-black shadow-[3px_3px_0_0_#000] text-black text-xs font-bold mb-6 uppercase tracking-wide">
                {error}
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
                className="mt-2"
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-8 p-4 bg-white border-[3px] border-black shadow-[3px_3px_0_0_#000]">
              <p className="text-[10px] font-black text-black uppercase tracking-widest mb-3 font-mono">
                Quick Demo Accounts (Password: campus123):
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { email: 'arjun@campus.edu', label: 'Arjun (Hostel 4)', bg: '#B79CFF' },
                  { email: 'priya@campus.edu', label: 'Priya (Hostel 7)', bg: '#FF6B9D' },
                  { email: 'rahul@campus.edu', label: 'Rahul (Hostel 2)', bg: '#00D26A' },
                ].map(({ email: demoEmail, label, bg }) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => handleDemoFill(demoEmail)}
                    className="px-2.5 py-1 text-xs font-black text-black border-[2px] border-black shadow-[2px_2px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] transition-all duration-100 cursor-pointer uppercase"
                    style={{ backgroundColor: bg }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-black/60 mt-6 font-medium">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-black font-black underline hover:no-underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
