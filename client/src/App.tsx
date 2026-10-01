import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import RequestsPage from './pages/RequestsPage';
import NotFoundPage from './pages/NotFoundPage';

function LegacyListingRedirect() {
  const { id } = useParams();
  return <Navigate to={`/listing/${id}`} replace />;
}

function RouteContent() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const path = location.pathname;
    let title = 'CampusSwap | Campus Marketplace';
    if (path === '/login') title = 'Log in | CampusSwap';
    else if (path === '/register') title = 'Create account | CampusSwap';
    else if (path === '/requests') title = 'Request Board | CampusSwap';
    else if (path === '/create') title = 'List an item | CampusSwap';
    else if (path === '/my-listings' || path === '/my-requests' || path === '/my-transactions' || path === '/dashboard') title = 'My Activity | CampusSwap';
    else if (/^\/listings\/\d+\/edit$/.test(path)) title = 'Edit listing | CampusSwap';
    else if (/^\/listing\/\d+$/.test(path) || /^\/listings\/\d+$/.test(path)) title = 'Listing details | CampusSwap';
    else if (path !== '/' && path !== '/listings') title = 'Page not found | CampusSwap';
    else if (path === '/listings') title = 'Browse listings | CampusSwap';
    document.title = title;
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/listings/:id" element={<LegacyListingRedirect />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/my-transactions" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '12px 16px',
            fontSize: '0.85rem',
            fontWeight: 500,
            boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.15)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#ffffff' } },
        }}
      />
      <Navbar />
      <main className="flex-1 min-w-0">
        <RouteContent />
      </main>
    </div>
  );
}
