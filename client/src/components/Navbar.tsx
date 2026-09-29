import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLink = (to: string, label: string, icon?: ReactNode) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-2 py-1 rounded-lg ${
          active
            ? 'text-indigo-400 bg-indigo-500/10'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(15,15,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg shadow-md"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              <BookOpen size={18} />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Campus<span className="text-indigo-400">Swap</span>
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-4">
            {navLink('/', 'Home')}
            {navLink('/listings', 'Browse Resources')}
            {navLink('/requests', 'Request Board')}
            {isAuthenticated && navLink('/my-listings', 'Dashboard')}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/create" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-md">
                  <PlusCircle size={15} />
                  <span>Post Listing</span>
                </Link>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 py-1 px-2.5 rounded-full border border-white/5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  >
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:block text-slate-200 font-medium max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn-ghost text-xs py-2 px-2.5 text-slate-400 hover:text-red-400 hover:border-red-500/30"
                  title="Log out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-xs py-2 px-3.5">Log in</Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4 shadow-md">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
