import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAdminAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};