import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingSpinner message="Gutegereza..." />;

  if (!isAuthenticated) return <Navigate to="/injira" replace />;

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/injira" replace />;
  }

  return children;
};

export default ProtectedRoute;
