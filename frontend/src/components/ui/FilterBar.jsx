import { VEHICLE_TYPES, VEHICLE_STATUSES, REGIONS } from '../../data/mockData';
import './FilterBar.css';

/**
 * Filter strip — 3 dropdown selects for Vehicle Type, Status, Region.
 * Props:
 *   filters  — { vehicleType, status, region }
 *   onChange — (filterKey, value) => void
 */
export default function FilterBar({ filters, onChange }) {
  return (
    <div className="filter-bar">
      <span className="filter-bar-label">Filters</span>

      <div className="filter-bar-selects">
        <div className="filter-group">
          <select
            id="filter-vehicle-type"
            className="filter-select"
            value={filters.vehicleType}
            onChange={(e) => onChange('vehicleType', e.target.value)}
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>Vehicle Type: {t}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
          >
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            id="filter-region"
            className="filter-select"
            value={filters.region}
            onChange={(e) => onChange('region', e.target.value)}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>Region: {r}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
