import { useState, useMemo, useCallback, useEffect } from 'react';
import './ExpensesPage.css';

// ─── Helper Functions ────────────────────────────────────────
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
  const [form, setForm] = useState({ vehicle: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicle) errs.vehicle = 'Required';
    if (!form.liters || Number(form.liters) <= 0) errs.liters = 'Required';
    if (!form.cost || Number(form.cost) <= 0) errs.cost = 'Required';
    if (!form.date) errs.date = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, vehicle: Number(form.vehicle), liters: Number(form.liters), cost: Number(form.cost) });
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
            <select className="input-field" value={form.vehicle} onChange={e => handleChange('vehicle', e.target.value)}>
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.model_name}</option>)}
            </select>
            {errors.vehicle && <div className="form-error">{errors.vehicle}</div>}
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
  const [form, setForm] = useState({ vehicle: '', expense_type: '', cost: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicle) errs.vehicle = 'Required';
    if (!form.expense_type) errs.expense_type = 'Required';
    if (!form.cost || Number(form.cost) <= 0) errs.cost = 'Required';
    if (!form.date) errs.date = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, vehicle: Number(form.vehicle), cost: Number(form.cost) });
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
              <select className="input-field" value={form.vehicle} onChange={e => handleChange('vehicle', e.target.value)}>
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.model_name}</option>)}
              </select>
              {errors.vehicle && <div className="form-error">{errors.vehicle}</div>}
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

function VehicleSummaryCard({ vehicleId, vehicles, fuelCost, maintCost, tollCost, otherCost, totalCost }) {
  const vehicle = vehicles.find(v => v.id === vehicleId);
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
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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

  const fetchAllData = useCallback(async () => {
    try {
      const token = JSON.parse(localStorage.getItem('transitops_user'))?.token;
      const headers = { 'Authorization': `Bearer ${token}` };

      const [fuelRes, expRes, vehRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/fuel-logs/', { headers }),
        fetch('http://127.0.0.1:8000/api/expenses/', { headers }),
        fetch('http://127.0.0.1:8000/api/fleet/vehicles/', { headers }),
      ]);

      if (fuelRes.ok) {
        const data = await fuelRes.json();
        setFuelLogs(Array.isArray(data) ? data : data.results || []);
      }
      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(Array.isArray(data) ? data : data.results || []);
      }
      if (vehRes.ok) {
        const data = await vehRes.json();
        setVehicles(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
    vehicles.forEach(v => {
      map[v.id] = { fuelCost: 0, maintCost: 0, tollCost: 0, otherCost: 0, totalCost: 0 };
    });
    fuelLogs.forEach(l => {
      if (map[l.vehicle]) {
        map[l.vehicle].fuelCost += l.cost;
        map[l.vehicle].totalCost += l.cost;
      }
    });
    expenses.forEach(e => {
      if (!map[e.vehicle]) return;
      if (e.expense_type === 'Maintenance Cost') {
        map[e.vehicle].maintCost += e.cost;
      } else if (e.expense_type === 'Toll') {
        map[e.vehicle].tollCost += e.cost;
      } else {
        map[e.vehicle].otherCost += e.cost;
      }
      map[e.vehicle].totalCost += e.cost;
    });
    return Object.entries(map)
      .filter(([, data]) => data.totalCost > 0)
      .sort(([, a], [, b]) => b.totalCost - a.totalCost);
  }, [fuelLogs, expenses]);

  // ── Filtered data ──
  const filteredFuelLogs = useMemo(() => {
    if (vehicleFilter === 'all') return fuelLogs;
    return fuelLogs.filter(l => l.vehicle === Number(vehicleFilter));
  }, [fuelLogs, vehicleFilter]);

  const filteredExpenses = useMemo(() => {
    if (vehicleFilter === 'all') return expenses;
    return expenses.filter(e => e.vehicle === Number(vehicleFilter));
  }, [expenses, vehicleFilter]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('transitops_user'))?.token}`,
    'Content-Type': 'application/json'
  });

  const handleAddFuelLog = useCallback(async (data) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/fuel-logs/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setShowFuelModal(false);
        addToast('Fuel log added successfully');
        fetchAllData();
      } else {
        const err = await res.json();
        addToast(`Error: ${JSON.stringify(err)}`, 'error');
      }
    } catch (e) {
      addToast('Network error', 'error');
    }
  }, [addToast, fetchAllData]);

  const handleAddExpense = useCallback(async (data) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/expenses/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setShowExpenseModal(false);
        addToast('Expense recorded successfully');
        fetchAllData();
      } else {
        const err = await res.json();
        addToast(`Error: ${JSON.stringify(err)}`, 'error');
      }
    } catch (e) {
      addToast('Network error', 'error');
    }
  }, [addToast, fetchAllData]);

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
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
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
                    const vehicle = vehicles.find(v => v.id === log.vehicle);
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
                    const vehicle = vehicles.find(v => v.id === exp.vehicle);
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
                vehicles={vehicles}
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
      {showFuelModal && <AddFuelLogModal onClose={() => setShowFuelModal(false)} onSubmit={handleAddFuelLog} vehicles={vehicles} />}
      {showExpenseModal && <AddExpenseModal onClose={() => setShowExpenseModal(false)} onSubmit={handleAddExpense} vehicles={vehicles} />}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
