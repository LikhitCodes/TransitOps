import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VehiclesPage from './pages/VehiclesPage'
import DriversPage from './pages/DriversPage'
import AppLayout from './components/Layout/AppLayout'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated routes — wrapped in AppLayout (Sidebar + Topbar) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Placeholder routes — will be implemented per wireframe */}
        <Route path="/fleet" element={<VehiclesPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/trips" element={<PlaceholderPage title="Trip Planner" />} />
        <Route path="/maintenance" element={<PlaceholderPage title="Maintenance" />} />
        <Route path="/fuel-expenses" element={<PlaceholderPage title="Fuel & Expenses" />} />
        <Route path="/analytics" element={<PlaceholderPage title="Analytics & Reports" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

/**
 * Temporary placeholder for pages not yet built.
 * Will be replaced with real components as wireframes are provided.
 */
function PlaceholderPage({ title }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '16px',
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: '15px',
        color: 'var(--text-muted)',
      }}>
        Coming soon — provide the wireframe to build this page.
      </p>
    </div>
  )
}

export default App
