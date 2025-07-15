import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Usage: <RoleRoute role="admin">...</RoleRoute>
export default function RoleRoute({ role: requiredRole, children }) {
  const location = useLocation();
  const userRole = localStorage.getItem('role');
  if (!userRole) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
