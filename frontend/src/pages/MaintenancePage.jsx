import { useState, useMemo, useCallback } from 'react';
import './MaintenancePage.css';

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_VEHICLES = [
  { id: 1, registration_number: 'VAN-05', model_name: 'Ford Transit', status: 'Available' },
  { id: 2, registration_number: 'TRK-12', model_name: 'Volvo FH16', status: 'Available' },
  { id: 3, registration_number: 'PKP-03', model_name: 'Toyota Hilux', status: 'In Shop' },
  { id: 4, registration_number: 'VAN-08', model_name: 'Mercedes Sprinter', status: 'On Trip' },
  { id: 5, registration_number: 'SEM-01', model_name: 'Scania R450', status: 'In Shop' },
  { id: 6, registration_number: 'TRK-07', model_name: 'MAN TGX', status: 'Available' },
];

const INITIAL_LOGS = [
  { id: 1, vehicle_id: 3, description: 'Engine Oil Change', cost: 4500, scheduled_date: '2026-07-10', completed_date: null, status: 'Active', notes: 'Scheduled routine maintenance. Using synthetic 5W-30 oil.', created_at: '2026-07-10T08:00:00' },
  { id: 2, vehicle_id: 5, description: 'Brake Pad Replacement', cost: 12000, scheduled_date: '2026-07-09', completed_date: null, status: 'Active', notes: 'Front and rear brake pads worn below minimum thickness.', created_at: '2026-07-09T10:00:00' },
  { id: 3, vehicle_id: 1, description: 'Tire Rotation & Alignment', cost: 3200, scheduled_date: '2026-07-05', completed_date: '2026-07-06', status: 'Closed', notes: 'All four tires rotated. Alignment adjusted.', created_at: '2026-07-04T14:00:00' },
  { id: 4, vehicle_id: 2, description: 'Transmission Fluid Flush', cost: 8500, scheduled_date: '2026-07-03', completed_date: '2026-07-04', status: 'Closed', notes: 'Full transmission flush and filter replacement.', created_at: '2026-07-02T09:00:00' },
  { id: 5, vehicle_id: 4, description: 'AC Compressor Repair', cost: 15000, scheduled_date: '2026-07-01', completed_date: '2026-07-02', status: 'Closed', notes: 'Compressor replaced. Refrigerant recharged.', created_at: '2026-06-30T11:00:00' },
  { id: 6, vehicle_id: 6, description: 'Battery Replacement', cost: 6000, scheduled_date: '2026-06-28', completed_date: '2026-06-28', status: 'Closed', notes: 'Old battery failed load test. Replaced with new 75Ah unit.', created_at: '2026-06-27T16:00:00' },
  { id: 7, vehicle_id: 1, description: 'Windshield Wiper Replacement', cost: 800, scheduled_date: '2026-06-25', completed_date: '2026-06-25', status: 'Closed', notes: '', created_at: '2026-06-25T08:00:00' },
];

const getVehicle = (id) => MOCK_VEHICLES.find(v => v.id === id);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const daysSince = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// ─── Sub-Components ──────────────────────────────────────────

function MaintenanceCard({ log, onClose }) {
  const vehicle = getVehicle(log.vehicle_id);
  const isActive = log.status === 'Active';
  const days = isActive ? daysSince(log.scheduled_date) : null;

  return (
    <div className={`maint-card maint-card--${isActive ? 'active' : 'closed'}`}>
      <div className="maint-card-header">
        <div>
          <div className="maint-card-title">{log.description}</div>
          <div className="maint-card-vehicle">{vehicle?.registration_number} — {vehicle?.model_name}</div>
        </div>
        <span className={`badge ${isActive ? 'badge-in-shop' : 'badge-completed'}`}>
          {log.status}
        </span>
      </div>

      <div className="maint-card-body">
        <div className="maint-card-field">
          <span className="maint-card-field-label">Scheduled</span>
          <span className="maint-card-field-value">{formatDate(log.scheduled_date)}</span>
        </div>
        <div className="maint-card-field">
          <span className="maint-card-field-label">{isActive ? 'Est. Cost' : 'Final Cost'}</span>
          <span className="maint-card-field-value mono">₹{log.cost.toLocaleString()}</span>
        </div>
        {log.completed_date && (
          <div className="maint-card-field">
            <span className="maint-card-field-label">Completed</span>
            <span className="maint-card-field-value">{formatDate(log.completed_date)}</span>
          </div>
        )}
        {isActive && (
          <div className="maint-card-field">
            <span className="maint-card-field-label">Duration</span>
            <div className="maint-duration">
              <span className="maint-duration-dot maint-duration-dot--active" />
              <span>{days} day{days !== 1 ? 's' : ''} in shop</span>
            </div>
          </div>
        )}
      </div>

      {log.notes && (
        <div className="maint-card-notes">{log.notes}</div>
      )}

      {isActive && (
        <div className="maint-card-footer">
          <span className="maint-vehicle-status maint-vehicle-status--in-shop">
            🔧 Vehicle In Shop
          </span>
          <button className="btn-primary btn-sm" onClick={() => onClose(log)}>
            Close Maintenance
          </button>
        </div>
      )}
    </div>
  );
}

function NewMaintenanceModal({ onClose, onSubmit, vehicles }) {
  const [form, setForm] = useState({
    vehicle_id: '', description: '', cost: '', scheduled_date: '', notes: ''
  });
  const [errors, setErrors] = useState({});

  // Filter out retired vehicles for the dropdown
  const availableForMaint = vehicles.filter(v => v.status !== 'Retired');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicle_id) errs.vehicle_id = 'Select a vehicle';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.cost || Number(form.cost) <= 0) errs.cost = 'Enter estimated cost';
    if (!form.scheduled_date) errs.scheduled_date = 'Select a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      vehicle_id: Number(form.vehicle_id),
      cost: Number(form.cost),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Log Maintenance</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Vehicle</label>
            <select className="input-field" value={form.vehicle_id} onChange={e => handleChange('vehicle_id', e.target.value)}>
              <option value="">Select vehicle...</option>
              {availableForMaint.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registration_number} — {v.model_name} ({v.status})
                </option>
              ))}
            </select>
            {errors.vehicle_id && <div className="form-error">{errors.vehicle_id}</div>}
          </div>

          <div className="form-group">
            <label className="input-label">Description</label>
            <input
              className="input-field"
              placeholder="e.g. Engine Oil Change, Brake Repair..."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Estimated Cost (₹)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={form.cost}
                onChange={e => handleChange('cost', e.target.value)}
              />
              {errors.cost && <div className="form-error">{errors.cost}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Scheduled Date</label>
              <input
                className="input-field"
                type="date"
                value={form.scheduled_date}
                onChange={e => handleChange('scheduled_date', e.target.value)}
              />
              {errors.scheduled_date && <div className="form-error">{errors.scheduled_date}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Notes (Optional)</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Additional details about the maintenance..."
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">Log Maintenance</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseMaintenanceModal({ log, onClose, onSubmit }) {
  const vehicle = getVehicle(log.vehicle_id);
  const [form, setForm] = useState({
    cost: log.cost || '',
    completed_date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.cost || Number(form.cost) <= 0) errs.cost = 'Enter final cost';
    if (!form.completed_date) errs.completed_date = 'Select completion date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(log.id, { cost: Number(form.cost), completed_date: form.completed_date });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 'var(--modal-width-sm)' }}>
        <div className="modal-header">
          <h2 className="modal-title">Close Maintenance</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="close-maint-summary">
          <div className="close-maint-summary-row">
            <span className="close-maint-summary-label">Vehicle</span>
            <span className="close-maint-summary-value">{vehicle?.registration_number}</span>
          </div>
          <div className="close-maint-summary-row">
            <span className="close-maint-summary-label">Description</span>
            <span className="close-maint-summary-value">{log.description}</span>
          </div>
          <div className="close-maint-summary-row">
            <span className="close-maint-summary-label">Scheduled</span>
            <span className="close-maint-summary-value">{formatDate(log.scheduled_date)}</span>
          </div>
          <div className="close-maint-summary-row">
            <span className="close-maint-summary-label">Duration</span>
            <span className="close-maint-summary-value">{daysSince(log.scheduled_date)} days</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Final Cost (₹)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                value={form.cost}
                onChange={e => handleChange('cost', e.target.value)}
              />
              {errors.cost && <div className="form-error">{errors.cost}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Completion Date</label>
              <input
                className="input-field"
                type="date"
                value={form.completed_date}
                onChange={e => handleChange('completed_date', e.target.value)}
              />
              {errors.completed_date && <div className="form-error">{errors.completed_date}</div>}
            </div>
          </div>

          <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--accent-green-muted)', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-3)', fontSize: '13px', color: 'var(--accent-green)' }}>
            ✓ Vehicle will be restored to <strong>Available</strong> status
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">Close Maintenance</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-message">{t.message}</span>
          <button className="toast-close" onClick={() => onRemove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN MAINTENANCE PAGE
// ═══════════════════════════════════════════════════════════════

export default function MaintenancePage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [closingLog, setClosingLog] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const activeLogs = useMemo(() => logs.filter(l => l.status === 'Active'), [logs]);
  const closedLogs = useMemo(() => logs.filter(l => l.status === 'Closed'), [logs]);

  const kpis = useMemo(() => ({
    active: activeLogs.length,
    closed: closedLogs.length,
    totalCost: logs.reduce((sum, l) => sum + l.cost, 0),
    vehiclesInShop: new Set(activeLogs.map(l => l.vehicle_id)).size,
  }), [logs, activeLogs, closedLogs]);

  const handleCreateMaintenance = useCallback((formData) => {
    const newLog = {
      id: Date.now(),
      vehicle_id: formData.vehicle_id,
      description: formData.description,
      cost: formData.cost,
      scheduled_date: formData.scheduled_date,
      completed_date: null,
      status: 'Active',
      notes: formData.notes || '',
      created_at: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);
    setShowNewModal(false);
    const vehicle = getVehicle(formData.vehicle_id);
    addToast(`Maintenance logged for ${vehicle?.registration_number} — Vehicle now In Shop`, 'success');
  }, [addToast]);

  const handleCloseMaintenance = useCallback((logId, data) => {
    setLogs(prev => prev.map(l =>
      l.id === logId
        ? { ...l, status: 'Closed', cost: data.cost, completed_date: data.completed_date }
        : l
    ));
    setClosingLog(null);
    addToast('Maintenance closed — Vehicle restored to Available', 'success');
  }, [addToast]);

  return (
    <div className="maintenance-page grid-bg">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Maintenance</h1>
            <p className="page-subtitle">Track vehicle maintenance schedules and service history</p>
          </div>
          <button className="btn-primary" onClick={() => setShowNewModal(true)}>
            + Log Maintenance
          </button>
        </div>

        {/* KPIs */}
        <div className="maint-kpi-strip">
          <div className="maint-kpi-card maint-kpi-card--active">
            <div className="maint-kpi-value">{kpis.active}</div>
            <div className="maint-kpi-label">Active</div>
          </div>
          <div className="maint-kpi-card maint-kpi-card--closed">
            <div className="maint-kpi-value">{kpis.closed}</div>
            <div className="maint-kpi-label">Closed</div>
          </div>
          <div className="maint-kpi-card maint-kpi-card--cost">
            <div className="maint-kpi-value">₹{(kpis.totalCost / 1000).toFixed(1)}K</div>
            <div className="maint-kpi-label">Total Cost</div>
          </div>
          <div className="maint-kpi-card maint-kpi-card--vehicles">
            <div className="maint-kpi-value">{kpis.vehiclesInShop}</div>
            <div className="maint-kpi-label">Vehicles In Shop</div>
          </div>
        </div>

        {/* Split Layout */}
        <div className="maint-layout">
          {/* Active Logs */}
          <div className="maint-section">
            <div className="maint-section-header">
              <span className="maint-section-title">🔧 Active Maintenance</span>
              <span className="maint-section-count">{activeLogs.length}</span>
            </div>
            <div className="maint-section-body">
              {activeLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px 24px' }}>
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-title">All Clear</div>
                  <div className="empty-state-text">No vehicles currently in maintenance</div>
                </div>
              ) : (
                activeLogs.map(log => (
                  <MaintenanceCard key={log.id} log={log} onClose={setClosingLog} />
                ))
              )}
            </div>
          </div>

          {/* History */}
          <div className="maint-section">
            <div className="maint-section-header">
              <span className="maint-section-title">📋 History</span>
              <span className="maint-section-count">{closedLogs.length}</span>
            </div>
            <div className="maint-section-body">
              {closedLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px 24px' }}>
                  <div className="empty-state-icon">📭</div>
                  <div className="empty-state-text">No maintenance history</div>
                </div>
              ) : (
                closedLogs.map(log => (
                  <MaintenanceCard key={log.id} log={log} onClose={() => {}} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewMaintenanceModal
          onClose={() => setShowNewModal(false)}
          onSubmit={handleCreateMaintenance}
          vehicles={MOCK_VEHICLES}
        />
      )}
      {closingLog && (
        <CloseMaintenanceModal
          log={closingLog}
          onClose={() => setClosingLog(null)}
          onSubmit={handleCloseMaintenance}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
