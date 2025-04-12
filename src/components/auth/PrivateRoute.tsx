import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  adminOnly?: boolean;
}

export default function PrivateRoute({ adminOnly = false }: PrivateRouteProps) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If user is not logged in, redirect to login with current location for redirect after login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If adminOnly is true, check if user has admin role
  if (adminOnly && currentUser.role !== 'admin') {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and has proper permissions, render the protected route
  return <Outlet />;
} 