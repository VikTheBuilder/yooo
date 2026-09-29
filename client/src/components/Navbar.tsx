import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Compass,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAvatarMenuOpen(false);
  }, [location.pathname]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { to: '/listings', label: 'Browse', icon: Compass },
    { to: '/requests', label: 'Requests', icon: HelpCircle },
    { to: '/create', label: 'Sell', icon: PlusCircle, highlight: true },
    ...(isAuthenticated ? [{ to: '/my-listings', label: 'My Activity', icon: LayoutDashboard }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Background glass bar */}
      <div className="w-full bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-200">
                <BookOpen size={20} className="transform -rotate-3" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  Campus<span className="gradient-text font-black">Swap</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider block -mt-1 uppercase">
                  Student Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.06] backdrop-blur-md">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;

                if (link.highlight) {
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-all duration-200"
                    >
                      <PlusCircle size={15} />
                      <span>{link.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/10 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action / Avatar Area */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative" ref={avatarMenuRef}>
                  <button
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${avatarMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Avatar Dropdown Menu */}
                  <AnimatePresence>
                    {avatarMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F172A]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 z-50 overflow-hidden"
                      >
                        {/* Profile Header */}
                        <div className="p-3 border-b border-white/[0.06] mb-1">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-indigo-400 font-medium truncate mt-0.5">{user.email}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-indigo-400" />
                              <span className="truncate max-w-[90px]">{user.hostel}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap size={11} className="text-purple-400" />
                              <span className="truncate max-w-[90px]">{user.batch}</span>
                            </span>
                          </div>
                        </div>

                        {/* Menu Options */}
                        <div className="flex flex-col gap-0.5 py-1">
                          <Link
                            to="/my-listings"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                          >
                            <LayoutDashboard size={14} className="text-indigo-400" />
                            <span>My Dashboard & Activity</span>
                          </Link>

                          <Link
                            to="/create"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                          >
                            <PlusCircle size={14} className="text-emerald-400" />
                            <span>Post New Resource</span>
                          </Link>
                        </div>

                        {/* Sign Out Button */}
                        <div className="pt-1 border-t border-white/[0.06] mt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden w-full bg-[#0B1020]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-3">
              {isAuthenticated && user && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.hostel} • {user.batch}</p>
                  </div>
                </div>
              )}

              <Link
                to="/listings"
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <Compass size={18} className="text-indigo-400" />
                <span>Browse Campus Resources</span>
              </Link>

              <Link
                to="/requests"
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <HelpCircle size={18} className="text-amber-400" />
                <span>Student Request Board</span>
              </Link>

              <Link
                to="/create"
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20"
              >
                <PlusCircle size={18} />
                <span>Sell or Rent an Item</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-listings"
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <LayoutDashboard size={18} className="text-purple-400" />
                    <span>My Activity & Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all text-left mt-2 border-t border-white/[0.06]"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08] mt-2">
                  <Link
                    to="/login"
                    className="p-3 text-center rounded-xl text-sm font-semibold text-slate-200 bg-white/5 border border-white/10"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="p-3 text-center rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
