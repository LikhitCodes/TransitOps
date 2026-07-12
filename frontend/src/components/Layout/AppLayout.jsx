import { useState, useEffect } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          id="sidebar-overlay"
        />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

