import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingWrapper } from './ui';

// Protects routes that require authentication
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Protects routes that require admin access
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
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
