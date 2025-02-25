import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    // Store the current location in localStorage
    if (token && location.pathname !== '/user/dashboard') {
      localStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [token, location.pathname]);

  if (!token) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;