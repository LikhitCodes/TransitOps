import { useState } from 'react';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

const PAGES = [
  { key: 'trips', label: 'Trips', icon: '🗺️' },
  { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { key: 'expenses', label: 'Expenses', icon: '💰' },
  { key: 'reports', label: 'Reports', icon: '📊' },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <nav className="app-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-text">TRANSIT</span>
        <span className="sidebar-brand-accent">OPS</span>
      </div>

      <div className="sidebar-nav">
        {PAGES.map(p => (
          <button
            key={p.key}
            className={`sidebar-nav-link ${activePage === p.key ? 'active' : ''}`}
            onClick={() => onNavigate(p.key)}
          >
            <span className="sidebar-nav-icon">{p.icon}</span>
            <span className="sidebar-nav-label">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">FM</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Fleet Manager</div>
            <div className="sidebar-user-role">fleet@transitops.com</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [activePage, setActivePage] = useState('trips');

  const renderPage = () => {
    switch (activePage) {
      case 'trips':       return <TripsPage />;
      case 'maintenance': return <MaintenancePage />;
      case 'expenses':    return <ExpensesPage />;
      case 'reports':     return <ReportsPage />;
      default:            return <TripsPage />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
