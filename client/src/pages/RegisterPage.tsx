import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', hostel: '', batch: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="glow-blob w-96 h-96 bg-purple-500 top-0 right-0" style={{ position: 'absolute' }} />
      <div className="glow-blob w-72 h-72 bg-cyan-600 bottom-0 left-0" style={{ position: 'absolute' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="glass p-8">
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              <GraduationCap size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join CampusSwap</h1>
            <p className="text-slate-400 text-sm mt-1">Campus student-to-student marketplace</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={15} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Full Name</label>
              <input
                className="input"
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Campus Email</label>
              <input
                className="input"
                type="email"
                name="email"
                placeholder="you@campus.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Hostel / Hall</label>
                <input
                  className="input"
                  type="text"
                  name="hostel"
                  placeholder="e.g. Hostel 4, Rm 212"
                  value={form.hostel}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Batch / Year</label>
                <input
                  className="input"
                  type="text"
                  name="batch"
                  placeholder="e.g. Batch 2025"
                  value={form.batch}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
