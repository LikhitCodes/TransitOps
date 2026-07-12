import { useState, useMemo, useCallback } from 'react';
import './ExpensesPage.css';

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_VEHICLES = [
  { id: 1, registration_number: 'VAN-05', model_name: 'Ford Transit' },
  { id: 2, registration_number: 'TRK-12', model_name: 'Volvo FH16' },
  { id: 3, registration_number: 'PKP-03', model_name: 'Toyota Hilux' },
  { id: 4, registration_number: 'VAN-08', model_name: 'Mercedes Sprinter' },
  { id: 5, registration_number: 'SEM-01', model_name: 'Scania R450' },
  { id: 6, registration_number: 'TRK-07', model_name: 'MAN TGX' },
];

const INITIAL_FUEL_LOGS = [
  { id: 1, vehicle_id: 1, liters: 45, cost: 4725, date: '2026-07-11', trip_number: 'TRP-A1B2C3D4' },
  { id: 2, vehicle_id: 2, liters: 120, cost: 12600, date: '2026-07-10', trip_number: 'TRP-E5F6G7H8' },
  { id: 3, vehicle_id: 3, liters: 42, cost: 4410, date: '2026-07-08', trip_number: 'TRP-I9J0K1L2' },
  { id: 4, vehicle_id: 1, liters: 50, cost: 5250, date: '2026-07-05', trip_number: 'TRP-C9D0E1F2' },
  { id: 5, vehicle_id: 4, liters: 55, cost: 5775, date: '2026-07-04', trip_number: null },
  { id: 6, vehicle_id: 2, liters: 130, cost: 13650, date: '2026-07-03', trip_number: null },
  { id: 7, vehicle_id: 6, liters: 80, cost: 8400, date: '2026-07-02', trip_number: null },
  { id: 8, vehicle_id: 3, liters: 38, cost: 3990, date: '2026-06-30', trip_number: null },
  { id: 9, vehicle_id: 5, liters: 150, cost: 15750, date: '2026-06-28', trip_number: null },
  { id: 10, vehicle_id: 1, liters: 48, cost: 5040, date: '2026-06-26', trip_number: null },
];

const INITIAL_EXPENSES = [
  { id: 1, vehicle_id: 1, trip_id: 1, expense_type: 'Toll', cost: 350, description: 'Mumbai-Pune Expressway toll', date: '2026-07-11' },
  { id: 2, vehicle_id: 2, trip_id: 2, expense_type: 'Toll', cost: 520, description: 'NH-48 toll gates', date: '2026-07-10' },
  { id: 3, vehicle_id: 3, trip_id: null, expense_type: 'Maintenance Cost', cost: 4500, description: 'Engine oil change', date: '2026-07-10' },
  { id: 4, vehicle_id: 5, trip_id: null, expense_type: 'Maintenance Cost', cost: 12000, description: 'Brake pad replacement', date: '2026-07-09' },
  { id: 5, vehicle_id: 1, trip_id: null, expense_type: 'Permit', cost: 2500, description: 'Interstate transport permit renewal', date: '2026-07-08' },
  { id: 6, vehicle_id: 2, trip_id: null, expense_type: 'Toll', cost: 780, description: 'Delhi-Jaipur expressway', date: '2026-07-07' },
  { id: 7, vehicle_id: 4, trip_id: null, expense_type: 'Other', cost: 1200, description: 'Parking charges — 3 days', date: '2026-07-06' },
  { id: 8, vehicle_id: 6, trip_id: null, expense_type: 'Maintenance Cost', cost: 6000, description: 'Battery replacement', date: '2026-06-28' },
  { id: 9, vehicle_id: 1, trip_id: null, expense_type: 'Other', cost: 800, description: 'Vehicle wash and cleaning', date: '2026-06-27' },
  { id: 10, vehicle_id: 3, trip_id: null, expense_type: 'Toll', cost: 290, description: 'Bangalore-Chennai highway', date: '2026-06-25' },
  { id: 11, vehicle_id: 2, trip_id: null, expense_type: 'Maintenance Cost', cost: 8500, description: 'Transmission fluid flush', date: '2026-07-04' },
  { id: 12, vehicle_id: 4, trip_id: null, expense_type: 'Maintenance Cost', cost: 15000, description: 'AC compressor repair', date: '2026-07-02' },
];

const getVehicle = (id) => MOCK_VEHICLES.find(v => v.id === id);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const formatCurrency = (val) => `₹${val.toLocaleString()}`;

const EXPENSE_TYPE_COLORS = {
  'Fuel': { bg: 'var(--accent-blue)', class: 'expense-type-badge--fuel' },
  'Maintenance Cost': { bg: 'var(--accent-amber)', class: 'expense-type-badge--maintenance' },
  'Toll': { bg: 'var(--accent-orange)', class: 'expense-type-badge--toll' },
  'Permit': { bg: 'var(--accent-cyan)', class: 'expense-type-badge--permit' },
  'Other': { bg: 'var(--accent-purple)', class: 'expense-type-badge--other' },
};

// ─── Sub-Components ──────────────────────────────────────────

function AddFuelLogModal({ onClose, onSubmit, vehicles }) {
  const [form, setForm] = useState({ vehicle_id: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicle_id) errs.vehicle_id = 'Required';
    if (!form.liters || Number(form.liters) <= 0) errs.liters = 'Required';
    if (!form.cost || Number(form.cost) <= 0) errs.cost = 'Required';
    if (!form.date) errs.date = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, vehicle_id: Number(form.vehicle_id), liters: Number(form.liters), cost: Number(form.cost) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 'var(--modal-width-sm)' }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Fuel Log</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Vehicle</label>
            <select className="input-field" value={form.vehicle_id} onChange={e => handleChange('vehicle_id', e.target.value)}>
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.model_name}</option>)}
            </select>
            {errors.vehicle_id && <div className="form-error">{errors.vehicle_id}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Liters</label>
              <input className="input-field" type="number" min="0" step="0.1" placeholder="e.g. 45.5" value={form.liters} onChange={e => handleChange('liters', e.target.value)} />
              {errors.liters && <div className="form-error">{errors.liters}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Cost (₹)</label>
              <input className="input-field" type="number" min="0" placeholder="e.g. 4750" value={form.cost} onChange={e => handleChange('cost', e.target.value)} />
              {errors.cost && <div className="form-error">{errors.cost}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Date</label>
            <input className="input-field" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />
            {errors.date && <div className="form-error">{errors.date}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">Add Fuel Log</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddExpenseModal({ onClose, onSubmit, vehicles }) {
  const [form, setForm] = useState({ vehicle_id: '', expense_type: '', cost: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicle_id) errs.vehicle_id = 'Required';
    if (!form.expense_type) errs.expense_type = 'Required';
    if (!form.cost || Number(form.cost) <= 0) errs.cost = 'Required';
    if (!form.date) errs.date = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, vehicle_id: Number(form.vehicle_id), cost: Number(form.cost) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Expense</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Vehicle</label>
              <select className="input-field" value={form.vehicle_id} onChange={e => handleChange('vehicle_id', e.target.value)}>
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.model_name}</option>)}
              </select>
              {errors.vehicle_id && <div className="form-error">{errors.vehicle_id}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Expense Type</label>
              <select className="input-field" value={form.expense_type} onChange={e => handleChange('expense_type', e.target.value)}>
                <option value="">Select type...</option>
                <option value="Toll">Toll</option>
                <option value="Maintenance Cost">Maintenance Cost</option>
                <option value="Permit">Permit</option>
                <option value="Other">Other</option>
              </select>
              {errors.expense_type && <div className="form-error">{errors.expense_type}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Cost (₹)</label>
              <input className="input-field" type="number" min="0" placeholder="e.g. 500" value={form.cost} onChange={e => handleChange('cost', e.target.value)} />
              {errors.cost && <div className="form-error">{errors.cost}</div>}
            </div>
            <div className="form-group">
              <label className="input-label">Date</label>
              <input className="input-field" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Description (Optional)</label>
            <input className="input-field" placeholder="Details about this expense..." value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">Add Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VehicleSummaryCard({ vehicleId, fuelCost, maintCost, tollCost, otherCost, totalCost }) {
  const vehicle = getVehicle(vehicleId);
  if (!vehicle) return null;
  const items = [
    { label: 'Fuel', value: fuelCost, color: '#4285f4' },
    { label: 'Maintenance', value: maintCost, color: '#ffb800' },
    { label: 'Tolls', value: tollCost, color: '#ff6b00' },
    { label: 'Other', value: otherCost, color: '#a855f7' },
  ];

  return (
    <div className="expense-summary-card">
      <div className="expense-summary-card-header">
        <div>
          <div className="expense-summary-vehicle">{vehicle.registration_number}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{vehicle.model_name}</div>
        </div>
        <div className="expense-summary-total">{formatCurrency(totalCost)}</div>
      </div>

      <div className="expense-breakdown">
        {items.map(item => (
          <div className="expense-breakdown-item" key={item.label}>
            <span className="expense-breakdown-label">
              <span className="expense-breakdown-dot" style={{ background: item.color }} />
              {item.label}
            </span>
            <span className="expense-breakdown-value">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>

      {/* Stacked bar */}
      <div className="expense-bar-stack">
        {items.map(item => (
          item.value > 0 && (
            <div
              key={item.label}
              className="expense-bar-segment"
              style={{ width: `${(item.value / totalCost) * 100}%`, background: item.color }}
            />
          )
        ))}
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
// MAIN EXPENSES PAGE
// ═══════════════════════════════════════════════════════════════

export default function ExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [activeTab, setActiveTab] = useState('fuel');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── KPIs ──
  const kpis = useMemo(() => {
    const fuelTotal = fuelLogs.reduce((s, l) => s + l.cost, 0);
    const maintTotal = expenses.filter(e => e.expense_type === 'Maintenance Cost').reduce((s, e) => s + e.cost, 0);
    const tollTotal = expenses.filter(e => e.expense_type === 'Toll').reduce((s, e) => s + e.cost, 0);
    const otherTotal = expenses.filter(e => !['Maintenance Cost', 'Toll'].includes(e.expense_type)).reduce((s, e) => s + e.cost, 0);
    return {
      fuel: fuelTotal,
      maintenance: maintTotal,
      toll: tollTotal,
      other: otherTotal,
      total: fuelTotal + maintTotal + tollTotal + otherTotal,
    };
  }, [fuelLogs, expenses]);

  // ── Per-vehicle summaries ──
  const vehicleSummaries = useMemo(() => {
    const map = {};
    MOCK_VEHICLES.forEach(v => {
      map[v.id] = { fuelCost: 0, maintCost: 0, tollCost: 0, otherCost: 0, totalCost: 0 };
    });
    fuelLogs.forEach(l => {
      if (map[l.vehicle_id]) {
        map[l.vehicle_id].fuelCost += l.cost;
        map[l.vehicle_id].totalCost += l.cost;
      }
    });
    expenses.forEach(e => {
      if (!map[e.vehicle_id]) return;
      if (e.expense_type === 'Maintenance Cost') {
        map[e.vehicle_id].maintCost += e.cost;
      } else if (e.expense_type === 'Toll') {
        map[e.vehicle_id].tollCost += e.cost;
      } else {
        map[e.vehicle_id].otherCost += e.cost;
      }
      map[e.vehicle_id].totalCost += e.cost;
    });
    return Object.entries(map)
      .filter(([, data]) => data.totalCost > 0)
      .sort(([, a], [, b]) => b.totalCost - a.totalCost);
  }, [fuelLogs, expenses]);

  // ── Filtered data ──
  const filteredFuelLogs = useMemo(() => {
    if (vehicleFilter === 'all') return fuelLogs;
    return fuelLogs.filter(l => l.vehicle_id === Number(vehicleFilter));
  }, [fuelLogs, vehicleFilter]);

  const filteredExpenses = useMemo(() => {
    if (vehicleFilter === 'all') return expenses;
    return expenses.filter(e => e.vehicle_id === Number(vehicleFilter));
  }, [expenses, vehicleFilter]);

  const handleAddFuelLog = useCallback((data) => {
    setFuelLogs(prev => [{ id: Date.now(), ...data, trip_number: null }, ...prev]);
    setShowFuelModal(false);
    addToast('Fuel log added successfully');
  }, [addToast]);

  const handleAddExpense = useCallback((data) => {
    setExpenses(prev => [{ id: Date.now(), trip_id: null, ...data }, ...prev]);
    setShowExpenseModal(false);
    addToast('Expense recorded successfully');
  }, [addToast]);

  return (
    <div className="expenses-page grid-bg">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Fuel & Expenses</h1>
            <p className="page-subtitle">Track fuel consumption, tolls, maintenance costs, and other expenses</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-secondary btn-sm" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
            <button className="btn-primary btn-sm" onClick={() => setShowFuelModal(true)}>+ Add Fuel Log</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="expense-kpi-strip">
          <div className="expense-kpi-card expense-kpi-card--fuel">
            <div className="expense-kpi-value">{formatCurrency(kpis.fuel)}</div>
            <div className="expense-kpi-label">Fuel</div>
          </div>
          <div className="expense-kpi-card expense-kpi-card--maintenance">
            <div className="expense-kpi-value">{formatCurrency(kpis.maintenance)}</div>
            <div className="expense-kpi-label">Maintenance</div>
          </div>
          <div className="expense-kpi-card expense-kpi-card--toll">
            <div className="expense-kpi-value">{formatCurrency(kpis.toll)}</div>
            <div className="expense-kpi-label">Tolls</div>
          </div>
          <div className="expense-kpi-card expense-kpi-card--other">
            <div className="expense-kpi-value">{formatCurrency(kpis.other)}</div>
            <div className="expense-kpi-label">Other</div>
          </div>
          <div className="expense-kpi-card expense-kpi-card--total">
            <div className="expense-kpi-value">{formatCurrency(kpis.total)}</div>
            <div className="expense-kpi-label">Total</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div className="expense-tabs">
            <button className={`expense-tab ${activeTab === 'fuel' ? 'active' : ''}`} onClick={() => setActiveTab('fuel')}>Fuel Logs</button>
            <button className={`expense-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Other Expenses</button>
            <button className={`expense-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
          </div>

          {activeTab !== 'summary' && (
            <div className="expense-filter-row" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vehicle</span>
              <select className="filter-select" value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)}>
                <option value="all">All Vehicles</option>
                {MOCK_VEHICLES.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'fuel' && (
          <div className="expense-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Liters</th>
                  <th>Cost (₹)</th>
                  <th>Rate (₹/L)</th>
                  <th>Trip</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuelLogs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No fuel logs found.</td></tr>
                ) : (
                  filteredFuelLogs.map(log => {
                    const vehicle = getVehicle(log.vehicle_id);
                    return (
                      <tr key={log.id}>
                        <td>{formatDate(log.date)}</td>
                        <td className="cell-mono">{vehicle?.registration_number}</td>
                        <td className="cell-mono">{log.liters} L</td>
                        <td className="cell-mono">{formatCurrency(log.cost)}</td>
                        <td className="cell-mono">₹{(log.cost / log.liters).toFixed(2)}</td>
                        <td className="cell-mono" style={{ color: log.trip_number ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                          {log.trip_number || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expense-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Cost (₹)</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No expenses found.</td></tr>
                ) : (
                  filteredExpenses.map(exp => {
                    const vehicle = getVehicle(exp.vehicle_id);
                    const typeInfo = EXPENSE_TYPE_COLORS[exp.expense_type] || EXPENSE_TYPE_COLORS['Other'];
                    return (
                      <tr key={exp.id}>
                        <td>{formatDate(exp.date)}</td>
                        <td className="cell-mono">{vehicle?.registration_number}</td>
                        <td><span className={`expense-type-badge ${typeInfo.class}`}>{exp.expense_type}</span></td>
                        <td className="cell-mono">{formatCurrency(exp.cost)}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{exp.description || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="expense-summary-grid">
            {vehicleSummaries.map(([vehicleId, data]) => (
              <VehicleSummaryCard
                key={vehicleId}
                vehicleId={Number(vehicleId)}
                fuelCost={data.fuelCost}
                maintCost={data.maintCost}
                tollCost={data.tollCost}
                otherCost={data.otherCost}
                totalCost={data.totalCost}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showFuelModal && <AddFuelLogModal onClose={() => setShowFuelModal(false)} onSubmit={handleAddFuelLog} vehicles={MOCK_VEHICLES} />}
      {showExpenseModal && <AddExpenseModal onClose={() => setShowExpenseModal(false)} onSubmit={handleAddExpense} vehicles={MOCK_VEHICLES} />}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
