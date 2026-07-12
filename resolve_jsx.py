import os

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

# Resolve Topbar.jsx
topbar_path = 'frontend/src/components/Layout/Topbar.jsx'
with open(topbar_path, 'r') as f:
    topbar_content = f.read()

# Replace conflicts in Topbar.jsx
topbar_content = topbar_content.replace(
"""<<<<<<< HEAD
export default function Topbar() {
=======
export default function Topbar({ onToggleSidebar }) {
>>>>>>> AccountAndFleetBackend""",
"""export default function Topbar({ onToggleSidebar }) {""")

topbar_content = topbar_content.replace(
"""<<<<<<< HEAD
=======
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

>>>>>>> AccountAndFleetBackend""",
"""      <button 
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
      </button>""")

write_file(topbar_path, topbar_content)
print("Resolved Topbar.jsx")

# Resolve AppLayout.jsx
applayout_path = 'frontend/src/components/Layout/AppLayout.jsx'
with open(applayout_path, 'r') as f:
    app_content = f.read()

app_content = app_content.replace(
"""<<<<<<< HEAD
=======
import { useState, useEffect } from 'react';
>>>>>>> AccountAndFleetBackend""",
"""import { useState, useEffect } from 'react';""")

app_content = app_content.replace(
"""<<<<<<< HEAD
=======
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
>>>>>>> AccountAndFleetBackend""",
"""  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  }, [isSidebarOpen]);""")

app_content = app_content.replace(
"""<<<<<<< HEAD
      <Sidebar />
      <Topbar />
=======
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          id="sidebar-overlay"
        />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
>>>>>>> AccountAndFleetBackend""",
"""      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          id="sidebar-overlay"
        />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />""")

app_content = app_content.replace(
"""<<<<<<< HEAD
=======

>>>>>>> AccountAndFleetBackend""",
"")

write_file(applayout_path, app_content)
print("Resolved AppLayout.jsx")

# Resolve Sidebar.jsx
sidebar_path = 'frontend/src/components/Layout/Sidebar.jsx'
with open(sidebar_path, 'r') as f:
    side_content = f.read()

side_content = side_content.replace(
"""<<<<<<< HEAD
export default function Sidebar() {
  const { logout, allowedRoutes } = useAuth();
=======
export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
>>>>>>> AccountAndFleetBackend""",
"""export default function Sidebar({ isOpen, onClose }) {
  const { logout, allowedRoutes } = useAuth();""")

side_content = side_content.replace(
"""<<<<<<< HEAD
=======
    if (onClose) onClose();
>>>>>>> AccountAndFleetBackend""",
"""    if (onClose) onClose();""")

side_content = side_content.replace(
"""<<<<<<< HEAD
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
=======
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-brand">TransitOps</span>
        <button 
          className="sidebar-close-btn" 
          onClick={onClose} 
          aria-label="Close sidebar"
          id="sidebar-close-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar-icon">{ICONS[item.icon]}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
>>>>>>> AccountAndFleetBackend""",
"""    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-brand">TransitOps</span>
        <button 
          className="sidebar-close-btn" 
          onClick={onClose} 
          aria-label="Close sidebar"
          id="sidebar-close-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          if (!allowedRoutes.includes(item.path)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span className="sidebar-icon">{ICONS[item.icon]}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}""")

write_file(sidebar_path, side_content)
print("Resolved Sidebar.jsx")
