import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

/**
 * AppLayout — Wraps all authenticated pages.
 * Renders Sidebar (fixed left) + Topbar (fixed top) + scrollable content area.
 * Redirects to /login if not authenticated.
 */
export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Topbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
