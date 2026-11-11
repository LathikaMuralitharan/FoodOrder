import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../features/auth/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
