import { useState } from 'react';
import './SettingsPage.css';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    depotName: 'Gandhinagar Depot GJ4',
    currency: 'INR (Rs)',
    distanceUnit: 'Kilometers'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    console.log('Saved settings:', formData);
    alert('Settings saved successfully!');
  };

  const rbacData = [
    { role: 'Fleet Manager', fleet: 'check', driver: 'check', trips: 'dash', fuel: 'dash', analytics: 'check' },
    { role: 'Dispatcher', fleet: 'view', driver: 'dash', trips: 'check', fuel: 'dash', analytics: 'dash' },
    { role: 'Safety Officer', fleet: 'dash', driver: 'check', trips: 'view', fuel: 'dash', analytics: 'dash' },
    { role: 'Financial Analyst', fleet: 'view', driver: 'dash', trips: 'dash', fuel: 'check', analytics: 'check' },
  ];

  const renderRbacValue = (val) => {
    if (val === 'check') return <span className="rbac-value check">✓</span>;
    if (val === 'dash') return <span className="rbac-value dash">—</span>;
    if (val === 'view') return <span className="rbac-value view">view</span>;
    return val;
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & RBAC</h1>
          <p className="page-subtitle">Configure system preferences and role-based access control</p>
        </div>
      </div>

      <div className="settings-content">
        
        {/* ── General Settings ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">General</h2>
          
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="settings-form-group">
              <label className="settings-label">Depot Name</label>
              <input 
                type="text" 
                name="depotName"
                className="settings-input" 
                value={formData.depotName}
                onChange={handleChange}
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-label">Currency</label>
              <select 
                name="currency"
                className="settings-select"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="INR (Rs)">INR (Rs)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>

            <div className="settings-form-group">
              <label className="settings-label">Distance Unit</label>
              <select 
                name="distanceUnit"
                className="settings-select"
                value={formData.distanceUnit}
                onChange={handleChange}
              >
                <option value="Kilometers">Kilometers</option>
                <option value="Miles">Miles</option>
              </select>
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn-primary">
                Save changes
              </button>
            </div>
          </form>
        </section>

        {/* ── RBAC Table ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">Role-Based Access (RBAC)</h2>
          
          <div className="rbac-table-container">
            <table className="rbac-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Fleet</th>
                  <th>Driver</th>
                  <th>Trips</th>
                  <th>Fuel/Exp.</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {rbacData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="rbac-role-name">{row.role}</td>
                    <td>{renderRbacValue(row.fleet)}</td>
                    <td>{renderRbacValue(row.driver)}</td>
                    <td>{renderRbacValue(row.trips)}</td>
                    <td>{renderRbacValue(row.fuel)}</td>
                    <td>{renderRbacValue(row.analytics)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
