import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import RequestsPage from './pages/RequestsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/create" element={
            <PrivateRoute><CreateListingPage /></PrivateRoute>
          } />
          <Route path="/listings/:id/edit" element={
            <PrivateRoute><EditListingPage /></PrivateRoute>
          } />
          <Route path="/my-listings" element={
            <PrivateRoute><MyListingsPage /></PrivateRoute>
          } />
          <Route path="/my-transactions" element={
            <PrivateRoute><MyListingsPage /></PrivateRoute>
          } />
          <Route path="/my-requests" element={
            <PrivateRoute><MyListingsPage /></PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><MyListingsPage /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
