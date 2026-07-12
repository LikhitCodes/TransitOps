import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

/**
 * Top navigation bar — search input + user info with role badge.
 * Fixed at top, offset by sidebar width.
 */
export default function Topbar({ onToggleSidebar }) {
  const { user } = useAuth();

  const displayName = user?.email
    ? user.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Guest';

  // Generate initials from display name
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const role = user?.role || 'Guest';

  return (
    <header className="topbar">
      <button 
        className="topbar-hamburger" 
        onClick={onToggleSidebar} 
        aria-label="Toggle navigation menu"
        id="topbar-hamburger"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="topbar-search-area">
        <div className="topbar-search">
          <svg className="topbar-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search..."
            id="topbar-search"
          />
        </div>
      </div>

      <div className="topbar-user">
        <span className="topbar-user-name">{displayName}</span>
        <div className="topbar-user-badge">
          <span className="topbar-role-label">{role}</span>
          <span className="topbar-avatar">{initials}</span>
        </div>
      </div>
    </header>
  );
}
