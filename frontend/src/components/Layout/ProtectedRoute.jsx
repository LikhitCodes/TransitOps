import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, allowedRoutes, defaultRoute } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the current route is allowed
  // Some routes might have sub-paths (e.g. /fleet/123), so we check if the path starts with an allowed route
  const isAllowed = allowedRoutes.some(route => location.pathname.startsWith(route));

  if (!isAllowed) {
    // If not allowed, redirect to their default route
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}
