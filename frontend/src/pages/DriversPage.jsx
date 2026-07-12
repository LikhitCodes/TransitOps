import { useState, useMemo } from 'react';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { DRIVERS } from '../data/mockData';
import './DriversPage.css';

const DRIVER_STATUSES = ['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'];
const LICENSE_CATEGORIES = ['LMV', 'HMV'];

const INITIAL_FORM = {
  name: '',
  license_number: '',
  license_category: 'LMV',
  license_expiry: '',
  contact: '',
  safety_score: '',
};

/**
 * Returns the safety score color class based on score thresholds.
 * Green (≥85), Amber (70–84), Red (<70)
 */
function getSafetyClass(score) {
  if (score >= 85) return 'safety-green';
  if (score >= 70) return 'safety-amber';
  return 'safety-red';
}

/**
 * Format expiry date — shows "EXPIRED" tag if past today.
 */
function formatExpiry(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formatted = `${month}/${year}`;

  if (date < now) {
    return { text: formatted, expired: true };
  }
  return { text: formatted, expired: false };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState(DRIVERS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');

  // Filtered & searched drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesSearch = searchQuery === '' ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.license_number.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [drivers, statusFilter, searchQuery]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleToggleStatus = (driverId, newStatus) => {
    setDrivers(prev =>
      prev.map(d =>
        d.id === driverId ? { ...d, status: newStatus } : d
      )
    );
  };

  const handleAddDriver = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Driver name is required.');
      return;
    }

    if (!formData.license_number.trim()) {
      setFormError('License number is required.');
      return;
    }

    // Check uniqueness
    const exists = drivers.some(
      d => d.license_number.toLowerCase() === formData.license_number.trim().toLowerCase()
    );
    if (exists) {
      setFormError('License number must be unique.');
      return;
    }

    if (!formData.license_expiry) {
      setFormError('License expiry date is required.');
      return;
    }

    if (!formData.contact.trim()) {
      setFormError('Contact number is required.');
      return;
    }

    const newDriver = {
      id: drivers.length + 1,
      name: formData.name.trim(),
      license_number: formData.license_number.trim().toUpperCase(),
      license_category: formData.license_category,
      license_expiry: formData.license_expiry,
      contact: formData.contact.trim(),
      safety_score: Number(formData.safety_score) || 100,
      status: 'Available',
      trips_completed: 0,
    };

    setDrivers(prev => [newDriver, ...prev]);
    setFormData(INITIAL_FORM);
    setFormError('');
    setIsModalOpen(false);
  };

  return (
    <div className="drivers-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Drivers Directory</h1>
          <p className="page-subtitle">Manage driver profiles and track safety metrics</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Driver
        </button>
      </div>

      {/* ── Action Bar ── */}
      <div className="drivers-action-bar">
        <div className="drivers-filters">
          {/* Search */}
          <div className="drivers-search">
            <svg className="drivers-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            <input
              type="text"
              className="drivers-search-input"
              placeholder="Search driver or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="drivers-table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>License No</th>
              <th>Category</th>
              <th>Expiry</th>
              <th>Contact</th>
              <th>Trip Compl.</th>
              <th>Safety</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver, index) => {
                const expiry = formatExpiry(driver.license_expiry);
                return (
                  <tr key={driver.id} style={{ animationDelay: `${index * 40}ms` }}>
                    <td className="cell-name">{driver.name}</td>
                    <td className="cell-mono">{driver.license_number}</td>
                    <td>{driver.license_category}</td>
                    <td className={`cell-expiry${expiry.expired ? ' expired' : ''}`}>
                      {expiry.text}
                      {expiry.expired && <span className="expiry-tag">EXPIRED</span>}
                    </td>
                    <td className="cell-contact">{driver.contact}</td>
                    <td className="cell-mono">{driver.trips_completed}</td>
                    <td>
                      <span className={`safety-badge ${getSafetyClass(driver.safety_score)}`}>
                        {driver.safety_score}%
                      </span>
                    </td>
                    <td><StatusBadge status={driver.status} /></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="drivers-empty">
                  No drivers found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Toggle Status Section ── */}
      <div className="drivers-toggle-section">
        <span className="drivers-toggle-label">Toggle Status:</span>
        <div className="drivers-toggle-pills">
          {DRIVER_STATUSES.filter(s => s !== 'All').map((status) => (
            <button
              key={status}
              className={`toggle-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(prev => prev === status ? 'All' : status)}
            >
              <StatusBadge status={status} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Rule Note ──
      <p className="drivers-rule-note">
        <span className="rule-prefix">Rule:</span> Expired license or Suspended status → blocked from trip assignment
      </p> */}

      {/* ── Add Driver Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormError(''); setFormData(INITIAL_FORM); }}
        title="Register New Driver"
      >
        <form className="modal-form" onSubmit={handleAddDriver}>
          {formError && (
            <div className="drivers-form-error">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
              </svg>
              {formError}
            </div>
          )}

          <div className="modal-form-row">
            <div className="form-group">
              <label className="modal-label" htmlFor="d-name">Full Name</label>
              <input
                id="d-name"
                className="modal-input"
                type="text"
                placeholder="e.g. Alex Kumar"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="modal-label" htmlFor="d-license">License Number</label>
              <input
                id="d-license"
                className="modal-input"
                type="text"
                placeholder="e.g. DL-88213"
                value={formData.license_number}
                onChange={(e) => handleFormChange('license_number', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="form-group">
              <label className="modal-label" htmlFor="d-category">License Category</label>
              <select
                id="d-category"
                className="modal-select"
                value={formData.license_category}
                onChange={(e) => handleFormChange('license_category', e.target.value)}
              >
                {LICENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="modal-label" htmlFor="d-expiry">License Expiry</label>
              <input
                id="d-expiry"
                className="modal-input"
                type="date"
                value={formData.license_expiry}
                onChange={(e) => handleFormChange('license_expiry', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="form-group">
              <label className="modal-label" htmlFor="d-contact">Contact Number</label>
              <input
                id="d-contact"
                className="modal-input"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.contact}
                onChange={(e) => handleFormChange('contact', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="modal-label" htmlFor="d-safety">Initial Safety Score (0–100)</label>
              <input
                id="d-safety"
                className="modal-input"
                type="number"
                placeholder="100"
                min="0"
                max="100"
                value={formData.safety_score}
                onChange={(e) => handleFormChange('safety_score', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={() => { setIsModalOpen(false); setFormError(''); setFormData(INITIAL_FORM); }}
            >
              Cancel
            </button>
            <button type="submit" className="modal-btn-primary">
              Register Driver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
