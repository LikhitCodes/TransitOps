import { useState, useMemo, useCallback } from 'react';
import './TripsPage.css';

// ─── Mock Data ───────────────────────────────────────────────
// Replace with API calls when backend is connected

const MOCK_VEHICLES = [
  { id: 1, registration_number: 'VAN-05', model_name: 'Ford Transit', vehicle_type: 'Van', max_load_capacity: 500, status: 'Available' },
  { id: 2, registration_number: 'TRK-12', model_name: 'Volvo FH16', vehicle_type: 'Truck', max_load_capacity: 8000, status: 'Available' },
  { id: 3, registration_number: 'PKP-03', model_name: 'Toyota Hilux', vehicle_type: 'Pickup', max_load_capacity: 1200, status: 'Available' },
  { id: 4, registration_number: 'VAN-08', model_name: 'Mercedes Sprinter', vehicle_type: 'Van', max_load_capacity: 650, status: 'On Trip' },
  { id: 5, registration_number: 'SEM-01', model_name: 'Scania R450', vehicle_type: 'Semi Trailer', max_load_capacity: 25000, status: 'In Shop' },
];

const MOCK_DRIVERS = [
  { id: 1, name: 'Alex Johnson', license_number: 'DL-2024-001', license_expiry: '2027-06-15', safety_score: 95, status: 'Available' },
  { id: 2, name: 'Maria Garcia', license_number: 'DL-2024-002', license_expiry: '2026-12-31', safety_score: 88, status: 'Available' },
  { id: 3, name: 'James Wilson', license_number: 'DL-2024-003', license_expiry: '2025-03-20', safety_score: 72, status: 'On Trip' },
  { id: 4, name: 'Sarah Chen', license_number: 'DL-2024-004', license_expiry: '2027-09-10', safety_score: 91, status: 'Available' },
  { id: 5, name: 'Mike Brown', license_number: 'DL-2024-005', license_expiry: '2024-01-15', safety_score: 65, status: 'Suspended' },
];

const generateTripNumber = () => `TRP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

const INITIAL_TRIPS = [
  { id: 1, trip_number: 'TRP-A1B2C3D4', source: 'Mumbai', destination: 'Pune', vehicle_id: 1, driver_id: 1, cargo_weight: 350, planned_distance: 150, actual_distance: null, fuel_consumed: null, revenue: 12000, status: 'Draft', created_at: '2026-07-10T08:00:00', dispatched_at: null, completed_at: null },
  { id: 2, trip_number: 'TRP-E5F6G7H8', source: 'Delhi', destination: 'Jaipur', vehicle_id: 2, driver_id: 2, cargo_weight: 5000, planned_distance: 280, actual_distance: null, fuel_consumed: null, revenue: 45000, status: 'Dispatched', created_at: '2026-07-09T10:30:00', dispatched_at: '2026-07-09T11:00:00', completed_at: null },
  { id: 3, trip_number: 'TRP-I9J0K1L2', source: 'Bangalore', destination: 'Chennai', vehicle_id: 3, driver_id: 3, cargo_weight: 800, planned_distance: 350, actual_distance: 345, fuel_consumed: 42, revenue: 28000, status: 'Completed', created_at: '2026-07-08T06:00:00', dispatched_at: '2026-07-08T07:00:00', completed_at: '2026-07-08T18:30:00' },
  { id: 4, trip_number: 'TRP-M3N4O5P6', source: 'Hyderabad', destination: 'Vizag', vehicle_id: 1, driver_id: 4, cargo_weight: 400, planned_distance: 620, actual_distance: 615, fuel_consumed: 68, revenue: 35000, status: 'Completed', created_at: '2026-07-07T09:00:00', dispatched_at: '2026-07-07T10:00:00', completed_at: '2026-07-07T22:00:00' },
  { id: 5, trip_number: 'TRP-Q7R8S9T0', source: 'Kolkata', destination: 'Patna', vehicle_id: 2, driver_id: 1, cargo_weight: 6000, planned_distance: 590, actual_distance: null, fuel_consumed: null, revenue: 52000, status: 'Draft', created_at: '2026-07-11T14:00:00', dispatched_at: null, completed_at: null },
  { id: 6, trip_number: 'TRP-U1V2W3X4', source: 'Ahmedabad', destination: 'Surat', vehicle_id: 3, driver_id: 2, cargo_weight: 950, planned_distance: 265, actual_distance: null, fuel_consumed: null, revenue: 18000, status: 'Cancelled', created_at: '2026-07-06T07:00:00', dispatched_at: '2026-07-06T08:00:00', completed_at: null },
  { id: 7, trip_number: 'TRP-Y5Z6A7B8', source: 'Lucknow', destination: 'Varanasi', vehicle_id: 2, driver_id: 4, cargo_weight: 3200, planned_distance: 320, actual_distance: null, fuel_consumed: null, revenue: 29000, status: 'Dispatched', created_at: '2026-07-11T16:00:00', dispatched_at: '2026-07-11T17:00:00', completed_at: null },
  { id: 8, trip_number: 'TRP-C9D0E1F2', source: 'Pune', destination: 'Goa', vehicle_id: 1, driver_id: 1, cargo_weight: 280, planned_distance: 460, actual_distance: 455, fuel_consumed: 50, revenue: 22000, status: 'Completed', created_at: '2026-07-05T05:30:00', dispatched_at: '2026-07-05T06:30:00', completed_at: '2026-07-05T19:00:00' },
];

// ─── Helper Functions ────────────────────────────────────────

const getVehicle = (id) => MOCK_VEHICLES.find(v => v.id === id);
const getDriver = (id) => MOCK_DRIVERS.find(d => d.id === id);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const statusBadgeClass = (status) => {
  const map = {
    'Draft': 'badge-draft',
    'Dispatched': 'badge-dispatched',
    'Completed': 'badge-completed',
    'Cancelled': 'badge-cancelled',
  };
  return `badge ${map[status] || 'badge-draft'}`;
};

// ─── Sub-Components ──────────────────────────────────────────

function TripCard({ trip, onDispatch, onComplete, onCancel, onClick }) {
  const vehicle = getVehicle(trip.vehicle_id);
  const driver = getDriver(trip.driver_id);

  return (
    <div className="trip-card" onClick={() => onClick(trip)} style={{ animationDelay: `${(trip.id % 5) * 60}ms` }}>
      <div className="trip-card-header">
        <span className="trip-card-id">{trip.trip_number}</span>
        <span className="trip-card-date">{formatDateTime(trip.created_at)}</span>
      </div>

      <div className="trip-card-route">
        <span>{trip.source}</span>
        <span className="trip-card-route-arrow">→</span>
        <span>{trip.destination}</span>
      </div>

      <div className="trip-card-details">
        <div className="trip-card-detail">
          <span className="trip-card-detail-icon">🚛</span>
          <span className="trip-card-detail-value">{vehicle?.registration_number || '—'}</span>
        </div>
        <div className="trip-card-detail">
          <span className="trip-card-detail-icon">👤</span>
          <span>{driver?.name || '—'}</span>
        </div>
        <div className="trip-card-detail">
          <span className="trip-card-detail-icon">📏</span>
          <span className="trip-card-detail-value">{trip.planned_distance} km</span>
        </div>
      </div>

      <div className="trip-card-footer">
        <span className="trip-card-weight">
          <strong>{trip.cargo_weight} kg</strong> / {vehicle?.max_load_capacity || '—'} kg
        </span>
        <div className="trip-card-actions" onClick={e => e.stopPropagation()}>
          {trip.status === 'Draft' && (
            <>
              <button className="trip-action-btn trip-action-btn--dispatch" onClick={() => onDispatch(trip)}>Dispatch</button>
              <button className="trip-action-btn trip-action-btn--cancel" onClick={() => onCancel(trip)}>Cancel</button>
            </>
          )}
          {trip.status === 'Dispatched' && (
            <>
              <button className="trip-action-btn trip-action-btn--complete" onClick={() => onComplete(trip)}>Complete</button>
              <button className="trip-action-btn trip-action-btn--cancel" onClick={() => onCancel(trip)}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ status, trips, colorClass, onDispatch, onComplete, onCancel, onCardClick }) {
  return (
    <div className={`kanban-column kanban-column--${colorClass}`}>
      <div className="kanban-column-header">
        <span className="kanban-column-title">{status}</span>
        <span className="kanban-column-count">{trips.length}</span>
      </div>
      <div className="kanban-column-body">
        {trips.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No {status.toLowerCase()} trips</div>
          </div>
        ) : (
          trips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDispatch={onDispatch}
              onComplete={onComplete}
              onCancel={onCancel}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NewTripModal({ onClose, onSubmit, vehicles, drivers }) {
  const [form, setForm] = useState({
    source: '', destination: '', vehicle_id: '', driver_id: '',
    cargo_weight: '', planned_distance: '', revenue: ''
  });
  const [errors, setErrors] = useState({});

  const selectedVehicle = vehicles.find(v => v.id === Number(form.vehicle_id));
  const cargoWeight = Number(form.cargo_weight) || 0;
  const maxCapacity = selectedVehicle?.max_load_capacity || 0;
  const capacityRatio = maxCapacity ? (cargoWeight / maxCapacity) : 0;

  const capacityStatus = capacityRatio === 0 ? null
    : capacityRatio <= 0.75 ? 'ok'
    : capacityRatio <= 1 ? 'warn'
    : 'error';

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const eligibleDrivers = drivers.filter(d => {
    if (d.status !== 'Available') return false;
    if (new Date(d.license_expiry) < new Date()) return false;
    return true;
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.source.trim()) errs.source = 'Source is required';
    if (!form.destination.trim()) errs.destination = 'Destination is required';
    if (!form.vehicle_id) errs.vehicle_id = 'Select a vehicle';
    if (!form.driver_id) errs.driver_id = 'Select a driver';
    if (!form.cargo_weight || Number(form.cargo_weight) <= 0) errs.cargo_weight = 'Enter valid cargo weight';
    if (!form.planned_distance || Number(form.planned_distance) <= 0) errs.planned_distance = 'Enter planned distance';
    if (selectedVehicle && cargoWeight > selectedVehicle.max_load_capacity) {
      errs.cargo_weight = `Exceeds max capacity (${selectedVehicle.max_load_capacity} kg)`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      vehicle_id: Number(form.vehicle_id),
      driver_id: Number(form.driver_id),
      cargo_weight: Number(form.cargo_weight),
      planned_distance: Number(form.planned_distance),
      revenue: Number(form.revenue) || 0,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Trip</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Route Section */}
          <div className="trip-form-route-section">
            <div className="form-group">
              <label className="input-label">Source</label>
              <input
                className="input-field"
                placeholder="e.g. Mumbai"
                value={form.source}
                onChange={e => handleChange('source', e.target.value)}
              />
              {errors.source && <div className="form-error">{errors.source}</div>}
            </div>
            <div className="trip-form-route-arrow">→</div>
            <div className="form-group">
              <label className="input-label">Destination</label>
              <input
                className="input-field"
                placeholder="e.g. Pune"
                value={form.destination}
                onChange={e => handleChange('destination', e.target.value)}
              />
              {errors.destination && <div className="form-error">{errors.destination}</div>}
            </div>
          </div>

          {/* Vehicle & Driver */}
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Vehicle</label>
              <select
                className="input-field"
                value={form.vehicle_id}
                onChange={e => handleChange('vehicle_id', e.target.value)}
              >
                <option value="">Select vehicle...</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number} — {v.model_name} ({v.max_load_capacity} kg)
                  </option>
                ))}
              </select>
              {errors.vehicle_id && <div className="form-error">{errors.vehicle_id}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Driver</label>
              <select
                className="input-field"
                value={form.driver_id}
                onChange={e => handleChange('driver_id', e.target.value)}
              >
                <option value="">Select driver...</option>
                {eligibleDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — Score: {d.safety_score}
                  </option>
                ))}
              </select>
              {errors.driver_id && <div className="form-error">{errors.driver_id}</div>}
            </div>
          </div>

          {/* Cargo & Distance */}
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Cargo Weight (kg)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                placeholder="e.g. 450"
                value={form.cargo_weight}
                onChange={e => handleChange('cargo_weight', e.target.value)}
              />
              {errors.cargo_weight && <div className="form-error">{errors.cargo_weight}</div>}
              {/* Capacity Indicator */}
              {selectedVehicle && cargoWeight > 0 && (
                <>
                  <div className="capacity-bar">
                    <div
                      className={`capacity-bar-fill capacity-bar-fill--${capacityStatus}`}
                      style={{ width: `${Math.min(capacityRatio * 100, 100)}%` }}
                    />
                  </div>
                  <div className={`trip-form-capacity-indicator trip-form-capacity-indicator--${capacityStatus}`}>
                    {capacityStatus === 'ok' && '✓'}
                    {capacityStatus === 'warn' && '⚠'}
                    {capacityStatus === 'error' && '✕'}
                    <span>
                      {Math.round(capacityRatio * 100)}% of {maxCapacity} kg capacity
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="form-group">
              <label className="input-label">Planned Distance (km)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={form.planned_distance}
                onChange={e => handleChange('planned_distance', e.target.value)}
              />
              {errors.planned_distance && <div className="form-error">{errors.planned_distance}</div>}
            </div>
          </div>

          {/* Revenue */}
          <div className="form-group">
            <label className="input-label">Expected Revenue (₹) — Optional</label>
            <input
              className="input-field"
              type="number"
              min="0"
              placeholder="e.g. 15000"
              value={form.revenue}
              onChange={e => handleChange('revenue', e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">Create Trip</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompleteTripModal({ trip, onClose, onSubmit }) {
  const vehicle = getVehicle(trip.vehicle_id);
  const driver = getDriver(trip.driver_id);
  const [form, setForm] = useState({
    actual_distance: trip.planned_distance || '',
    fuel_consumed: '',
    fuel_cost: '',
    final_odometer: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.actual_distance || Number(form.actual_distance) <= 0) errs.actual_distance = 'Enter actual distance';
    if (!form.fuel_consumed || Number(form.fuel_consumed) <= 0) errs.fuel_consumed = 'Enter fuel consumed';
    if (!form.fuel_cost || Number(form.fuel_cost) <= 0) errs.fuel_cost = 'Enter fuel cost';
    if (!form.final_odometer || Number(form.final_odometer) <= 0) errs.final_odometer = 'Enter final odometer reading';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(trip.id, {
      actual_distance: Number(form.actual_distance),
      fuel_consumed: Number(form.fuel_consumed),
      fuel_cost: Number(form.fuel_cost),
      final_odometer: Number(form.final_odometer),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Complete Trip</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Trip Summary */}
        <div className="complete-trip-summary">
          <div className="complete-trip-summary-item">
            <span className="complete-trip-summary-label">Trip</span>
            <span className="complete-trip-summary-value">{trip.trip_number}</span>
          </div>
          <div className="complete-trip-summary-item">
            <span className="complete-trip-summary-label">Route</span>
            <span className="complete-trip-summary-value" style={{ fontFamily: 'var(--font-primary)' }}>
              {trip.source} → {trip.destination}
            </span>
          </div>
          <div className="complete-trip-summary-item">
            <span className="complete-trip-summary-label">Vehicle</span>
            <span className="complete-trip-summary-value">{vehicle?.registration_number}</span>
          </div>
          <div className="complete-trip-summary-item">
            <span className="complete-trip-summary-label">Driver</span>
            <span className="complete-trip-summary-value" style={{ fontFamily: 'var(--font-primary)' }}>
              {driver?.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Actual Distance (km)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                value={form.actual_distance}
                onChange={e => handleChange('actual_distance', e.target.value)}
              />
              {errors.actual_distance && <div className="form-error">{errors.actual_distance}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Final Odometer (km)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                placeholder="e.g. 45230"
                value={form.final_odometer}
                onChange={e => handleChange('final_odometer', e.target.value)}
              />
              {errors.final_odometer && <div className="form-error">{errors.final_odometer}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Fuel Consumed (liters)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 42.5"
                value={form.fuel_consumed}
                onChange={e => handleChange('fuel_consumed', e.target.value)}
              />
              {errors.fuel_consumed && <div className="form-error">{errors.fuel_consumed}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Fuel Cost (₹)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                placeholder="e.g. 4500"
                value={form.fuel_cost}
                onChange={e => handleChange('fuel_cost', e.target.value)}
              />
              {errors.fuel_cost && <div className="form-error">{errors.fuel_cost}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">Complete Trip</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, icon, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay confirm-dialog" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">{icon}</div>
        <h2 className="modal-title" style={{ marginBottom: '12px', textAlign: 'center' }}>{title}</h2>
        <div className="confirm-message">{message}</div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          <button className={`${confirmClass} btn-sm`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function TripDetailPanel({ trip, onClose, onDispatch, onComplete, onCancel }) {
  const vehicle = getVehicle(trip.vehicle_id);
  const driver = getDriver(trip.driver_id);

  const timelineEvents = [
    { label: 'Created', date: trip.created_at, active: true },
    { label: 'Dispatched', date: trip.dispatched_at, active: !!trip.dispatched_at },
    { label: trip.status === 'Cancelled' ? 'Cancelled' : 'Completed', date: trip.completed_at, active: trip.status === 'Completed' || trip.status === 'Cancelled' },
  ];

  return (
    <>
      <div className="trip-detail-overlay" onClick={onClose} />
      <div className="trip-detail-panel">
        <div className="trip-detail-header">
          <div>
            <div className="trip-detail-id">{trip.trip_number}</div>
            <div style={{ marginTop: '8px' }}>
              <span className={statusBadgeClass(trip.status)}>{trip.status}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Route */}
        <div className="trip-detail-section">
          <div className="trip-detail-section-title">Route</div>
          <div className="trip-detail-route">
            <div className="trip-detail-route-point">
              <div className="trip-detail-route-label">Origin</div>
              <div className="trip-detail-route-city">{trip.source}</div>
            </div>
            <div className="trip-detail-route-divider">
              <div className="trip-detail-route-line" />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {trip.actual_distance || trip.planned_distance} km
              </span>
            </div>
            <div className="trip-detail-route-point">
              <div className="trip-detail-route-label">Destination</div>
              <div className="trip-detail-route-city">{trip.destination}</div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="trip-detail-section">
          <div className="trip-detail-section-title">Details</div>
          <div className="trip-detail-grid">
            <div className="trip-detail-item">
              <div className="trip-detail-item-label">Vehicle</div>
              <div className="trip-detail-item-value mono">{vehicle?.registration_number || '—'}</div>
            </div>
            <div className="trip-detail-item">
              <div className="trip-detail-item-label">Driver</div>
              <div className="trip-detail-item-value">{driver?.name || '—'}</div>
            </div>
            <div className="trip-detail-item">
              <div className="trip-detail-item-label">Cargo Weight</div>
              <div className="trip-detail-item-value mono">{trip.cargo_weight} kg</div>
            </div>
            <div className="trip-detail-item">
              <div className="trip-detail-item-label">Planned Distance</div>
              <div className="trip-detail-item-value mono">{trip.planned_distance} km</div>
            </div>
            {trip.actual_distance && (
              <div className="trip-detail-item">
                <div className="trip-detail-item-label">Actual Distance</div>
                <div className="trip-detail-item-value mono">{trip.actual_distance} km</div>
              </div>
            )}
            {trip.fuel_consumed && (
              <div className="trip-detail-item">
                <div className="trip-detail-item-label">Fuel Consumed</div>
                <div className="trip-detail-item-value mono">{trip.fuel_consumed} L</div>
              </div>
            )}
            <div className="trip-detail-item">
              <div className="trip-detail-item-label">Revenue</div>
              <div className="trip-detail-item-value mono">₹{trip.revenue?.toLocaleString() || '—'}</div>
            </div>
            {trip.fuel_consumed && trip.actual_distance && (
              <div className="trip-detail-item">
                <div className="trip-detail-item-label">Fuel Efficiency</div>
                <div className="trip-detail-item-value mono">
                  {(trip.actual_distance / trip.fuel_consumed).toFixed(1)} km/L
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="trip-detail-section">
          <div className="trip-detail-section-title">Timeline</div>
          <div className="trip-detail-timeline">
            {timelineEvents.map((ev, i) => (
              <div key={i} className={`timeline-event ${ev.active ? 'timeline-event--active' : ''}`}>
                <div className="timeline-event-title">{ev.label}</div>
                <div className="timeline-event-date">{ev.date ? formatDateTime(ev.date) : 'Pending'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
          <div className="trip-detail-actions">
            {trip.status === 'Draft' && (
              <button className="btn-primary btn-sm" onClick={() => onDispatch(trip)}>Dispatch</button>
            )}
            {trip.status === 'Dispatched' && (
              <button className="btn-primary btn-sm" onClick={() => onComplete(trip)}>Complete</button>
            )}
            <button className="btn-danger btn-sm" onClick={() => onCancel(trip)}>Cancel Trip</button>
          </div>
        )}
      </div>
    </>
  );
}

function TripsTableView({ trips, onCardClick }) {
  return (
    <div className="trips-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Trip #</th>
            <th>Route</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Cargo (kg)</th>
            <th>Distance (km)</th>
            <th>Revenue (₹)</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {trips.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                No trips found matching your filters.
              </td>
            </tr>
          ) : (
            trips.map(trip => {
              const vehicle = getVehicle(trip.vehicle_id);
              const driver = getDriver(trip.driver_id);
              return (
                <tr key={trip.id} onClick={() => onCardClick(trip)}>
                  <td className="cell-mono">{trip.trip_number}</td>
                  <td>{trip.source} → {trip.destination}</td>
                  <td className="cell-mono">{vehicle?.registration_number || '—'}</td>
                  <td>{driver?.name || '—'}</td>
                  <td className="cell-mono">{trip.cargo_weight}</td>
                  <td className="cell-mono">{trip.actual_distance || trip.planned_distance}</td>
                  <td className="cell-mono">₹{trip.revenue?.toLocaleString() || '—'}</td>
                  <td><span className={statusBadgeClass(trip.status)}>{trip.status}</span></td>
                  <td>{formatDate(trip.created_at)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Toast System ────────────────────────────────────────────

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
// MAIN TRIPS PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function TripsPage() {
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [view, setView] = useState('kanban'); // 'kanban' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Filtered Trips ──
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      if (statusFilter !== 'all' && trip.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const vehicle = getVehicle(trip.vehicle_id);
        const driver = getDriver(trip.driver_id);
        const searchable = [
          trip.trip_number, trip.source, trip.destination,
          vehicle?.registration_number, driver?.name
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [trips, statusFilter, searchQuery]);

  // ── Kanban groups ──
  const kanbanGroups = useMemo(() => ({
    Draft: filteredTrips.filter(t => t.status === 'Draft'),
    Dispatched: filteredTrips.filter(t => t.status === 'Dispatched'),
    Completed: filteredTrips.filter(t => t.status === 'Completed'),
    Cancelled: filteredTrips.filter(t => t.status === 'Cancelled'),
  }), [filteredTrips]);

  // ── KPI counts ──
  const kpis = useMemo(() => ({
    draft: trips.filter(t => t.status === 'Draft').length,
    dispatched: trips.filter(t => t.status === 'Dispatched').length,
    completed: trips.filter(t => t.status === 'Completed').length,
    cancelled: trips.filter(t => t.status === 'Cancelled').length,
  }), [trips]);

  // ── Trip Actions ──
  const handleCreateTrip = useCallback((formData) => {
    const newTrip = {
      id: Date.now(),
      trip_number: generateTripNumber(),
      source: formData.source,
      destination: formData.destination,
      vehicle_id: formData.vehicle_id,
      driver_id: formData.driver_id,
      cargo_weight: formData.cargo_weight,
      planned_distance: formData.planned_distance,
      actual_distance: null,
      fuel_consumed: null,
      revenue: formData.revenue,
      status: 'Draft',
      created_at: new Date().toISOString(),
      dispatched_at: null,
      completed_at: null,
    };
    setTrips(prev => [newTrip, ...prev]);
    setShowNewTripModal(false);
    addToast(`Trip ${newTrip.trip_number} created successfully`, 'success');
  }, [addToast]);

  const handleDispatch = useCallback((trip) => {
    setConfirmAction({
      title: 'Dispatch Trip',
      message: `Are you sure you want to dispatch ${trip.trip_number}? The vehicle and driver will be marked as "On Trip".`,
      icon: '🚀',
      confirmLabel: 'Dispatch',
      confirmClass: 'btn-primary',
      onConfirm: () => {
        setTrips(prev => prev.map(t =>
          t.id === trip.id
            ? { ...t, status: 'Dispatched', dispatched_at: new Date().toISOString() }
            : t
        ));
        setConfirmAction(null);
        setSelectedTrip(null);
        addToast(`Trip ${trip.trip_number} dispatched — Vehicle & Driver now On Trip`, 'success');
      },
    });
  }, [addToast]);

  const handleCompleteSubmit = useCallback((tripId, data) => {
    setTrips(prev => prev.map(t =>
      t.id === tripId
        ? {
            ...t,
            status: 'Completed',
            completed_at: new Date().toISOString(),
            actual_distance: data.actual_distance,
            fuel_consumed: data.fuel_consumed,
          }
        : t
    ));
    setCompletingTrip(null);
    setSelectedTrip(null);
    addToast('Trip completed — Vehicle & Driver restored to Available', 'success');
  }, [addToast]);

  const handleCancel = useCallback((trip) => {
    setConfirmAction({
      title: 'Cancel Trip',
      message: `Are you sure you want to cancel ${trip.trip_number}?${trip.status === 'Dispatched' ? ' The vehicle and driver will be restored to Available.' : ''}`,
      icon: '⚠️',
      confirmLabel: 'Cancel Trip',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        setTrips(prev => prev.map(t =>
          t.id === trip.id ? { ...t, status: 'Cancelled' } : t
        ));
        setConfirmAction(null);
        setSelectedTrip(null);
        addToast(`Trip ${trip.trip_number} cancelled`, 'warning');
      },
    });
  }, [addToast]);

  return (
    <div className="trips-page grid-bg">
      <div className="page-container">
        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Trip Planner</h1>
            <p className="page-subtitle">Manage trip lifecycle from draft to completion</p>
          </div>
          <button className="btn-primary" onClick={() => setShowNewTripModal(true)}>
            + New Trip
          </button>
        </div>

        {/* ── KPI Strip ── */}
        <div className="trips-kpi-strip">
          <div className="trips-kpi-card trips-kpi-card--draft">
            <div className="trips-kpi-value">{kpis.draft}</div>
            <div className="trips-kpi-label">Draft</div>
          </div>
          <div className="trips-kpi-card trips-kpi-card--dispatched">
            <div className="trips-kpi-value">{kpis.dispatched}</div>
            <div className="trips-kpi-label">Dispatched</div>
          </div>
          <div className="trips-kpi-card trips-kpi-card--completed">
            <div className="trips-kpi-value">{kpis.completed}</div>
            <div className="trips-kpi-label">Completed</div>
          </div>
          <div className="trips-kpi-card trips-kpi-card--cancelled">
            <div className="trips-kpi-value">{kpis.cancelled}</div>
            <div className="trips-kpi-label">Cancelled</div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="trips-filter-bar">
          <div className="trips-search">
            <span className="search-icon">🔍</span>
            <input
              className="input-field"
              placeholder="Search trips, routes, vehicles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <span className="filter-label">Status</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ flex: 1 }} />
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${view === 'kanban' ? 'active' : ''}`}
              onClick={() => setView('kanban')}
            >
              Board
            </button>
            <button
              className={`view-toggle-btn ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
            >
              Table
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        {view === 'kanban' ? (
          <div className="kanban-board">
            <KanbanColumn status="Draft" trips={kanbanGroups.Draft} colorClass="draft"
              onDispatch={handleDispatch} onComplete={setCompletingTrip} onCancel={handleCancel} onCardClick={setSelectedTrip} />
            <KanbanColumn status="Dispatched" trips={kanbanGroups.Dispatched} colorClass="dispatched"
              onDispatch={handleDispatch} onComplete={setCompletingTrip} onCancel={handleCancel} onCardClick={setSelectedTrip} />
            <KanbanColumn status="Completed" trips={kanbanGroups.Completed} colorClass="completed"
              onDispatch={handleDispatch} onComplete={setCompletingTrip} onCancel={handleCancel} onCardClick={setSelectedTrip} />
            <KanbanColumn status="Cancelled" trips={kanbanGroups.Cancelled} colorClass="cancelled"
              onDispatch={handleDispatch} onComplete={setCompletingTrip} onCancel={handleCancel} onCardClick={setSelectedTrip} />
          </div>
        ) : (
          <TripsTableView trips={filteredTrips} onCardClick={setSelectedTrip} />
        )}
      </div>

      {/* ── Modals ── */}
      {showNewTripModal && (
        <NewTripModal
          onClose={() => setShowNewTripModal(false)}
          onSubmit={handleCreateTrip}
          vehicles={MOCK_VEHICLES}
          drivers={MOCK_DRIVERS}
        />
      )}

      {completingTrip && (
        <CompleteTripModal
          trip={completingTrip}
          onClose={() => setCompletingTrip(null)}
          onSubmit={handleCompleteSubmit}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          icon={confirmAction.icon}
          confirmLabel={confirmAction.confirmLabel}
          confirmClass={confirmAction.confirmClass}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {selectedTrip && (
        <TripDetailPanel
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onDispatch={handleDispatch}
          onComplete={setCompletingTrip}
          onCancel={handleCancel}
        />
      )}

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
