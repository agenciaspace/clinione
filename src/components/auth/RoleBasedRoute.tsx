
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  requiredRoles 
}) => {
  const { isAuthenticated, userRoles, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state if authentication is still being checked
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-healthblue-600"></div>
    </div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
  
  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};
