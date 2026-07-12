import { useState } from 'react';
import KPICard from '../components/ui/KPICard';
import StatusBadge from '../components/ui/StatusBadge';
import FilterBar from '../components/ui/FilterBar';
import { DASHBOARD_KPIS, TRIPS, VEHICLE_STATUS_DISTRIBUTION } from '../data/mockData';
import './DashboardPage.css';

/**
 * DashboardPage — Matching excalidraw wireframe:
 * 1. Filter strip (Vehicle Type, Status, Region)
 * 2. KPI row (7 cards with animated counters)
 * 3. Bottom section: Recent Trips table (left 60%) + Vehicle Status bars (right 40%)
 */
export default function DashboardPage() {
  const [filters, setFilters] = useState({
    vehicleType: 'All',
    status: 'All',
    region: 'All',
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get the first 4 trips for the recent trips table (matching wireframe)
  const recentTrips = TRIPS.slice(0, 4);

  // Find max count for bar width scaling
  const maxStatusCount = Math.max(...VEHICLE_STATUS_DISTRIBUTION.map(s => s.count));

  return (
    <div className="dashboard-page">
      {/* ── Filter Strip ── */}
      <FilterBar filters={filters} onChange={handleFilterChange} />

      {/* ── KPI Row ── */}
      <div className="dashboard-kpi-row">
        <KPICard
          label="Active Vehicles"
          value={DASHBOARD_KPIS.activeVehicles}
          accentColor="green"
        />
        <KPICard
          label="Available Vehicles"
          value={DASHBOARD_KPIS.availableVehicles}
          accentColor="green"
        />
        <KPICard
          label="Vehicles in Maintenance"
          value={DASHBOARD_KPIS.vehiclesInMaintenance}
          accentColor="amber"
        />
        <KPICard
          label="Active Trips"
          value={DASHBOARD_KPIS.activeTrips}
          accentColor="blue"
        />
        <KPICard
          label="Pending Trips"
          value={DASHBOARD_KPIS.pendingTrips}
          accentColor="blue"
        />
        <KPICard
          label="Drivers on Duty"
          value={DASHBOARD_KPIS.driversOnDuty}
          accentColor="orange"
        />
        <KPICard
          label="Fleet Utilization"
          value={DASHBOARD_KPIS.fleetUtilization}
          suffix="%"
          accentColor="orange"
        />
      </div>

      {/* ── Bottom Section ── */}
      <div className="dashboard-bottom">
        {/* Recent Trips Table */}
        <section className="dashboard-recent-trips">
          <h3 className="dashboard-section-title">Recent Trips</h3>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="cell-mono">{trip.trip_number}</td>
                    <td className="cell-mono">{trip.vehicle_reg}</td>
                    <td>{trip.driver}</td>
                    <td><StatusBadge status={trip.status} /></td>
                    <td className="cell-muted">{trip.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Vehicle Status Distribution */}
        <section className="dashboard-vehicle-status">
          <h3 className="dashboard-section-title">Vehicle Status</h3>
          <div className="status-bars">
            {VEHICLE_STATUS_DISTRIBUTION.map(({ status, count, color }) => (
              <div key={status} className="status-bar-row">
                <span className="status-bar-label">{status}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(count / maxStatusCount) * 100}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
