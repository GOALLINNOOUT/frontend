import React from 'react';
import { Navigate } from 'react-router-dom';

// Usage: <RoleRoute role="admin">...</RoleRoute>
export default function RoleRoute({ role: requiredRole, children }) {
  const userRole = localStorage.getItem('role');
  if (!userRole) return <Navigate to="/login" replace />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
