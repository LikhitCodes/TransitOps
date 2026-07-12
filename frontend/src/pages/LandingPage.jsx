import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="16" height="11" rx="2.5" />
        <path d="M18 11h4l4 4v4h-8V11z" />
        <circle cx="7" cy="20" r="2.5" />
        <circle cx="22" cy="20" r="2.5" />
      </svg>
    ),
    accent: 'green',
    title: 'Fleet Registry',
    desc: 'Register and track every vehicle with real-time status. Capacity limits, odometer, acquisition cost — all in one place.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="8" r="5" />
        <path d="M4 24c0-5.5 4.5-8 10-8s10 2.5 10 8" />
      </svg>
    ),
    accent: 'blue',
    title: 'Driver Profiles',
    desc: 'Maintain driver licenses, safety scores, and duty status. Expired licenses are automatically blocked from assignments.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14h20" />
        <path d="M18 8l6 6-6 6" />
        <circle cx="4" cy="14" r="2" fill="currentColor" />
      </svg>
    ),
    accent: 'amber',
    title: 'Trip Dispatch',
    desc: 'Plan, dispatch and track trips in real-time. Cargo weight validation, vehicle availability checks, ETA tracking.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 8.5a4 4 0 00-5.7 0L14 8.8l-.3-.3A4 4 0 108 14.1l6 6 6-6a4 4 0 000-5.6z" />
      </svg>
    ),
    accent: 'orange',
    title: 'Maintenance Tracking',
    desc: 'Schedule and close maintenance jobs. In-shop vehicles are automatically hidden from the dispatch board.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="14" height="20" rx="2" />
        <path d="M18 8h4a2 2 0 012 2v7a2 2 0 01-2 2h-4" />
        <path d="M9 9h4" />
      </svg>
    ),
    accent: 'green',
    title: 'Fuel & Expenses',
    desc: 'Log fuel fills, track per-km costs, and monitor operational spend across your entire fleet.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 22H4V4" />
        <path d="M7 18l5-5 4 4 7-8" />
      </svg>
    ),
    accent: 'blue',
    title: 'Analytics & Reports',
    desc: 'Fleet utilization, fuel efficiency, ROI breakdowns, and cost analysis — all exportable to CSV.',
  },
];

const STATS = [
  { value: '53+', label: 'Vehicles Tracked', accent: 'green' },
  { value: '99.9%', label: 'Uptime SLA', accent: 'blue' },
  { value: '4', label: 'Role-based Access Levels', accent: 'amber' },
  { value: '0', label: 'Manual Spreadsheets Needed', accent: 'orange' },
];

const STEPS = [
  { step: '01', title: 'Register your fleet', desc: 'Add vehicles with registration numbers, capacities, and current odometer readings.' },
  { step: '02', title: 'Onboard your drivers', desc: 'Upload driver profiles with license categories and safety scores. System auto-validates expiry.' },
  { step: '03', title: 'Dispatch trips instantly', desc: 'Select vehicle, driver, cargo weight — the platform validates capacity and availability in real time.' },
  { step: '04', title: 'Monitor and analyze', desc: 'Track live fleet status on your dashboard and pull detailed reports for stakeholders.' },
];

const ROLES = [
  { title: 'Fleet Manager', desc: 'Full control over vehicles and maintenance scheduling.', icon: '🚛', color: 'orange', pages: 'Fleet · Maintenance' },
  { title: 'Dispatcher', desc: 'Plan routes, dispatch trips, and monitor live status.', icon: '📡', color: 'green', pages: 'Dashboard · Trips' },
  { title: 'Safety Officer', desc: 'Manage driver profiles and compliance monitoring.', icon: '🛡️', color: 'red', pages: 'Drivers · Compliance' },
  { title: 'Financial Analyst', desc: 'Track fuel costs, expenses, and ROI analytics.', icon: '📊', color: 'blue', pages: 'Fuel & Expenses · Analytics' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <span className="landing-nav-brand">TransitOps</span>
          <div className="landing-nav-actions">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How it works</a>
            <a href="#roles" className="landing-nav-link">Roles</a>
            <button
              className="landing-nav-cta"
              onClick={() => navigate('/login')}
            >
              Sign In →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg-orb landing-orb-1" />
        <div className="landing-hero-bg-orb landing-orb-2" />
        <div className="landing-hero-bg-orb landing-orb-3" />

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            Smart Fleet Operations Platform
          </div>

          <h1 className="landing-hero-headline">
            Run your entire
            <span className="landing-hero-highlight"> fleet operation</span>
            <br />from a single dashboard.
          </h1>

          <p className="landing-hero-subtext">
            TransitOps gives fleet managers, dispatchers, safety officers, and
            financial analysts one unified platform — replacing spreadsheets with
            real-time data, smart validations, and role-based access.
          </p>

          <div className="landing-hero-actions">
            <button
              className="landing-btn-primary"
              onClick={() => navigate('/login')}
            >
              Get Started Free
            </button>
            <a href="#how-it-works" className="landing-btn-ghost">
              See how it works ↓
            </a>
          </div>

          {/* Mini fleet status preview */}
          <div className="landing-hero-preview">
            <div className="preview-bar">
              <span className="preview-label">Fleet Utilization</span>
              <span className="preview-pct">81%</span>
            </div>
            <div className="preview-track">
              <div className="preview-fill" style={{ width: '81%' }} />
            </div>
            <div className="preview-stats">
              <span className="preview-stat green">42 Available</span>
              <span className="preview-stat blue">6 On Trip</span>
              <span className="preview-stat amber">3 In Shop</span>
              <span className="preview-stat muted">2 Retired</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="landing-stats">
        {STATS.map(({ value, label, accent }) => (
          <div key={label} className={`landing-stat landing-stat--${accent}`}>
            <span className="landing-stat-value">{value}</span>
            <span className="landing-stat-label">{label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="landing-features" id="features">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-overline">Features</span>
            <h2 className="landing-section-title">Everything your fleet needs</h2>
            <p className="landing-section-sub">
              From vehicle registration to financial reporting — TransitOps covers the full operations lifecycle.
            </p>
          </div>

          <div className="landing-features-grid">
            {FEATURES.map(({ icon, accent, title, desc }) => (
              <div key={title} className={`landing-feature-card feature-card--${accent}`}>
                <div className={`feature-icon feature-icon--${accent}`}>{icon}</div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-overline">How it works</span>
            <h2 className="landing-section-title">Up and running in minutes</h2>
          </div>

          <div className="landing-steps">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="landing-step">
                <div className="step-number">{step}</div>
                <div className="step-connector" />
                <div className="step-body">
                  <h3 className="step-title">{title}</h3>
                  <p className="step-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="landing-roles" id="roles">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-overline">Role-Based Access</span>
            <h2 className="landing-section-title landing-title-dark">One platform, four roles</h2>
            <p className="landing-section-sub landing-sub-dark">
              Every team member sees exactly what they need — nothing more, nothing less.
            </p>
          </div>

          <div className="landing-roles-grid">
            {ROLES.map(({ title, desc, icon, color, pages }) => (
              <div key={title} className={`landing-role-card role-card--${color}`}>
                <span className="role-icon">{icon}</span>
                <h3 className="role-title">{title}</h3>
                <p className="role-desc">{desc}</p>
                <div className="role-pages">
                  {pages.split(' · ').map(p => (
                    <span key={p} className="role-page-tag">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta">
        <div className="landing-cta-orb-left" />
        <div className="landing-cta-orb-right" />
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Ready to modernize your fleet?</h2>
          <p className="landing-cta-sub">
            Replace your spreadsheets today. Sign in with a demo account — no setup required.
          </p>
          <button
            className="landing-btn-primary landing-btn-large"
            onClick={() => navigate('/login')}
          >
            Start Now — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span className="landing-footer-brand">TransitOps</span>
        <span className="landing-footer-copy">© 2026 · Smart Transport Operations Platform</span>
      </footer>
    </div>
  );
}
