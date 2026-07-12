import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_DEFAULT_ROUTE } from '../context/AuthContext';
import TransitOpsLogo from '../components/TransitOpsLogo';
import './LoginPage.css';

const ROLES = [
  'Fleet Manager',
  'Dispatcher',
  'Safety Officer',
  'Financial Analyst',
];

const ACCESS_SCOPES = [
  { role: 'Fleet Manager',     modules: 'Fleet, Maintenance' },
  { role: 'Dispatcher',        modules: 'Dashboard, Trips' },
  { role: 'Safety Officer',    modules: 'Drivers, Compliance' },
  { role: 'Financial Analyst', modules: 'Fuel & Expenses, Analytics' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLockedOut, lockoutRemaining } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dispatcher');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const result = login(email, password, role);

    if (result.success) {
      const target = ROLE_DEFAULT_ROUTE[role] || '/dashboard';
      navigate(target);
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  const lockoutMinutes = Math.ceil(lockoutRemaining / 60000);
  const lockoutSeconds = Math.ceil((lockoutRemaining % 60000) / 1000);

  return (
    <div className="login-page">
      {/* ── Left: Branding Panel ── */}
      <aside className="login-branding">
        <div className="login-branding-content">
          <TransitOpsLogo size={56} className="login-logo" />
          <h1 className="login-brand-name">TransitOps</h1>
          <p className="login-brand-tagline">Smart Transport Operations Platform</p>

          <div className="login-roles-section">
            <h2 className="login-roles-title">One login, four roles:</h2>
            <ul className="login-roles-list">
              {ROLES.map((r) => (
                <li key={r}>
                  <span className="login-role-dot" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="login-footer-text">TRANSITOPS © 2026 · RBAC ERA</p>
      </aside>

      {/* ── Right: Sign-in Form Panel ── */}
      <main className="login-form-panel">
        <div className="login-form-container">
          <h2 className="login-heading">Sign in to your account</h2>
          <p className="login-subheading">Enter your credentials to continue</p>

          {/* Error Alert */}
          {error && (
            <div className="login-error" role="alert">
              <span className="login-error-icon">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
                </svg>
              </span>
              <span className="login-error-text">{error}</span>
            </div>
          )}

          {/* Lockout countdown */}
          {isLockedOut && lockoutRemaining > 0 && (
            <div className="login-error" role="alert" style={{ marginTop: error ? '8px' : 0 }}>
              <span className="login-error-icon">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.75 4a.75.75 0 00-1.5 0v4.25l2.78 1.85a.75.75 0 10.83-1.25L8.75 7.46V4z" />
                </svg>
              </span>
              <span className="login-error-text">
                Locked for {lockoutMinutes > 0 ? `${lockoutMinutes}m ` : ''}{lockoutSeconds}s
              </span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                id="login-email"
                type="email"
                className={`form-input${error ? ' input-error' : ''}`}
                placeholder="Raveenk@transitops.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLockedOut}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input${error ? ' input-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLockedOut}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    /* Eye-off icon */
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role (RBAC) */}
            <div className="form-group">
              <label htmlFor="login-role" className="form-label">Role (RBAC)</label>
              <select
                id="login-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLockedOut}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="login-options-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`login-submit-btn${isSubmitting ? ' loading' : ''}`}
              disabled={isLockedOut || isSubmitting}
            >
              Sign In
            </button>
          </form>

          {/* Access Scope Info */}
          <div className="login-access-info">
            <p className="login-access-title">Access is scoped by role after login:</p>
            <ul className="login-access-list">
              {ACCESS_SCOPES.map(({ role: r, modules }) => (
                <li key={r}>
                  <span className="role-name">{r}</span>
                  <span className="arrow">→</span>
                  <span className="modules">{modules}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
