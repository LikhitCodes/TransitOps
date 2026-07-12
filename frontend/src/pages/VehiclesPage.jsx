import { useState, useMemo } from 'react';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { VEHICLES, VEHICLE_TYPES, VEHICLE_STATUSES } from '../data/mockData';
import './VehiclesPage.css';

const INITIAL_FORM = {
  registration_number: '',
  model_name: '',
  vehicle_type: 'Van',
  max_load_capacity: '',
  odometer: '',
  acquisition_cost: '',
  region: 'North',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');

  // Filtered & searched vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesType = typeFilter === 'All' || v.vehicle_type === typeFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesSearch = searchQuery === '' ||
        v.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [vehicles, typeFilter, statusFilter, searchQuery]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.registration_number.trim()) {
      setFormError('Registration number is required.');
      return;
    }

    // Check uniqueness
    const exists = vehicles.some(
      v => v.registration_number.toLowerCase() === formData.registration_number.trim().toLowerCase()
    );
    if (exists) {
      setFormError('Registration number must be unique.');
      return;
    }

    if (!formData.model_name.trim()) {
      setFormError('Model name is required.');
      return;
    }

    if (!formData.max_load_capacity || Number(formData.max_load_capacity) <= 0) {
      setFormError('Capacity must be greater than 0.');
      return;
    }

    if (!formData.acquisition_cost || Number(formData.acquisition_cost) <= 0) {
      setFormError('Acquisition cost must be greater than 0.');
      return;
    }

    const newVehicle = {
      id: vehicles.length + 1,
      registration_number: formData.registration_number.trim().toUpperCase(),
      model_name: formData.model_name.trim(),
      vehicle_type: formData.vehicle_type,
      max_load_capacity: Number(formData.max_load_capacity),
      odometer: Number(formData.odometer) || 0,
      acquisition_cost: Number(formData.acquisition_cost),
      status: 'Available',
      region: formData.region,
    };

    setVehicles(prev => [newVehicle, ...prev]);
    setFormData(INITIAL_FORM);
    setFormError('');
    setIsModalOpen(false);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCapacity = (capacity, type) => {
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(capacity % 1000 === 0 ? 0 : 1)} Ton`;
    }
    return `${capacity} kg`;
  };

  return (
    <div className="vehicles-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Registry</h1>
          <p className="page-subtitle">Manage vehicle inventory and track fleet status</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Vehicle
        </button>
      </div>

      {/* ── Action Bar ── */}
      <div className="vehicles-action-bar">
        <div className="vehicles-filters">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>Type: {t}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>

          <div className="vehicles-search">
            <svg className="vehicles-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            <input
              type="text"
              className="vehicles-search-input"
              placeholder="Search reg. no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="vehicles-table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Reg. No. (Unique)</th>
              <th>Name/Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Acq. Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle, index) => (
                <tr key={vehicle.id} style={{ animationDelay: `${index * 40}ms` }}>
                  <td className="cell-mono cell-reg">{vehicle.registration_number}</td>
                  <td className="cell-model">{vehicle.model_name}</td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{formatCapacity(vehicle.max_load_capacity, vehicle.vehicle_type)}</td>
                  <td className="cell-mono">{formatNumber(vehicle.odometer)}</td>
                  <td className="cell-mono">{formatNumber(vehicle.acquisition_cost)}</td>
                  <td><StatusBadge status={vehicle.status} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="vehicles-empty">
                  No vehicles found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Rule Note ──
      <p className="vehicles-rule-note">
        <span className="rule-prefix">Rule:</span> Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </p> */}

      {/* ── Add Vehicle Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormError(''); setFormData(INITIAL_FORM); }}
        title="Register New Vehicle"
      >
        <form className="modal-form" onSubmit={handleAddVehicle}>
          {formError && (
            <div className="vehicles-form-error">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
              </svg>
              {formError}
            </div>
          )}

          <div className="modal-form-row">
            <div className="form-group">
              <label className="modal-label" htmlFor="v-reg">Registration Number</label>
              <input
                id="v-reg"
                className="modal-input"
                type="text"
                placeholder="e.g. VAN-05"
                value={formData.registration_number}
                onChange={(e) => handleFormChange('registration_number', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="modal-label" htmlFor="v-model">Model Name</label>
              <input
                id="v-model"
                className="modal-input"
                type="text"
                placeholder="e.g. Ford Transit"
                value={formData.model_name}
                onChange={(e) => handleFormChange('model_name', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="form-group">
              <label className="modal-label" htmlFor="v-type">Vehicle Type</label>
              <select
                id="v-type"
                className="modal-select"
                value={formData.vehicle_type}
                onChange={(e) => handleFormChange('vehicle_type', e.target.value)}
              >
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Semi Trailer">Semi Trailer</option>
                <option value="Pickup">Pickup</option>
                <option value="Car">Car</option>
              </select>
            </div>
            <div className="form-group">
              <label className="modal-label" htmlFor="v-region">Region</label>
              <select
                id="v-region"
                className="modal-select"
                value={formData.region}
                onChange={(e) => handleFormChange('region', e.target.value)}
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          <div className="modal-form-row">
            <div className="form-group">
              <label className="modal-label" htmlFor="v-capacity">Max Load Capacity (kg)</label>
              <input
                id="v-capacity"
                className="modal-input"
                type="number"
                placeholder="e.g. 500"
                min="0"
                value={formData.max_load_capacity}
                onChange={(e) => handleFormChange('max_load_capacity', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="modal-label" htmlFor="v-odometer">Odometer (km)</label>
              <input
                id="v-odometer"
                className="modal-input"
                type="number"
                placeholder="e.g. 34500"
                min="0"
                value={formData.odometer}
                onChange={(e) => handleFormChange('odometer', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="modal-label" htmlFor="v-cost">Acquisition Cost (₹)</label>
            <input
              id="v-cost"
              className="modal-input"
              type="number"
              placeholder="e.g. 35000"
              min="0"
              value={formData.acquisition_cost}
              onChange={(e) => handleFormChange('acquisition_cost', e.target.value)}
            />
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
              Register Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
