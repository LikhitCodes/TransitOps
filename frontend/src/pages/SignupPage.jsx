import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TransitOpsLogo from '../components/TransitOpsLogo';
import { api } from '../api/client';
import './LoginPage.css';

const ROLES = [
  'Fleet Manager',
  'Dispatcher',
  'Safety Officer',
  'Financial Analyst',
];

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dispatcher');
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

    try {
      await api.post('/auth/register/', { email, password, role });
      // Successfully registered, navigate to login
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Left: Branding Panel ── */}
      <aside className="login-branding">
        <div className="login-branding-content">
          <TransitOpsLogo size={56} className="login-logo" />
          <h1 className="login-brand-name">TransitOps</h1>
          <p className="login-brand-tagline">Smart Transport Operations Platform</p>
        </div>

        <p className="login-footer-text">TRANSITOPS © 2026 · RBAC ERA</p>
      </aside>

      {/* ── Right: Sign-up Form Panel ── */}
      <main className="login-form-panel">
        <div className="login-form-container">
          <h2 className="login-heading">Create an account</h2>
          <p className="login-subheading">Join TransitOps to manage your fleet</p>

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

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">Email</label>
              <input
                id="signup-email"
                type="email"
                className={`form-input${error ? ' input-error' : ''}`}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">Password</label>
              <input
                id="signup-password"
                type="password"
                className={`form-input${error ? ' input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            {/* Role (RBAC) */}
            <div className="form-group">
              <label htmlFor="signup-role" className="form-label">Role</label>
              <select
                id="signup-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`login-submit-btn${isSubmitting ? ' loading' : ''}`}
              disabled={isSubmitting}
            >
              Sign Up
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontFamily: 'var(--font-primary)', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sign in here</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
