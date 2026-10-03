import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-saffron-hero-gradient flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-ink-secondary">Verifying session credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
