import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../data/mockData';
import './Sidebar.css';

/**
 * Navigation icon components — inline SVGs for each nav item.
 */
const ICONS = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="8" rx="1.5" />
      <rect x="11" y="2" width="7" height="5" rx="1.5" />
      <rect x="2" y="12" width="7" height="6" rx="1.5" />
      <rect x="11" y="9" width="7" height="9" rx="1.5" />
    </svg>
  ),
  fleet: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="12" height="8" rx="2" />
      <path d="M13 8h3l3 3v3h-6V8z" />
      <circle cx="5" cy="15" r="2" />
      <circle cx="16" cy="15" r="2" />
    </svg>
  ),
  drivers: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="4" />
      <path d="M2 18c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  ),
  trips: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10h14" />
      <path d="M13 6l4 4-4 4" />
      <circle cx="3" cy="10" r="1.5" fill="currentColor" />
    </svg>
  ),
  maintenance: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000-1.4l-.6-.6a1 1 0 00-1.4 0L4 13v3h3l8.7-9.7z" />
      <path d="M11 5l4 4" />
    </svg>
  ),
  fuel: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="10" height="16" rx="2" />
      <path d="M13 7h2a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path d="M7 6h2" />
    </svg>
  ),
  analytics: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16H2V2" />
      <path d="M5 13l4-4 3 3 5-6" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1v2M10 17v2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M1 10h2M17 10h2M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
    </svg>
  ),
};

export default function Sidebar() {
  const { logout, allowedRoutes } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-brand">TransitOps</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          // Check if this item's path is allowed for the user
          // We check `item.path` against the `allowedRoutes` array
          // Since some routes might be nested (like /fleet/new), we just check if it's in the array.
          // In AuthContext, allowedRoutes contains exact base paths like '/fleet'
          if (!allowedRoutes.includes(item.path)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span className="sidebar-icon">{ICONS[item.icon]}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h3" />
            <path d="M14 14l4-4-4-4" />
            <path d="M18 10H8" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
