import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingWrapper } from './ui';

// Protects routes that require authentication
// Waits for server-side token validation before making a redirect decision
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuth();

  // Still validating token against server — show spinner to avoid flash redirect
  if (!authChecked) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Protects routes that require admin access
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, authChecked } = useAuth();

  if (!authChecked) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};
