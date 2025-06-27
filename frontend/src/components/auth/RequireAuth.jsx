// src/components/auth/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route Component
 * Requires authentication and optionally specific roles
 */
const RequireAuth = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/employee-login" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.includes(user.role);
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      const dashboardRoutes = {
        admin: '/admin-dashboard',
        manager: '/manager-dashboard',
        cashier: '/cashier-dashboard',
        employee: '/employee-dashboard'
      };
      
      const redirectTo = dashboardRoutes[user.role] || '/employee-dashboard';
      return <Navigate to={redirectTo} replace />;
    }
  }

  // User is authenticated and has required role
  return children;
};

export default RequireAuth;
