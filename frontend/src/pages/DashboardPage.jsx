import { useState, useEffect } from 'react';
import KPICard from '../components/ui/KPICard';
import StatusBadge from '../components/ui/StatusBadge';
import FilterBar from '../components/ui/FilterBar';
import './DashboardPage.css';
import './DashboardPage.css';

/**
 * DashboardPage — Matching excalidraw wireframe:
 * 1. Filter strip (Vehicle Type, Status, Region)
 * 2. KPI row (7 cards with animated counters)
 * 3. Bottom section: Recent Trips table (left 60%) + Vehicle Status bars (right 40%)
 */
export default function DashboardPage() {
  const [kpis, setKpis] = useState({
    active_vehicles: 0,
    available_vehicles: 0,
    vehicles_in_maintenance: 0,
    active_trips: 0,
    pending_trips: 0,
    drivers_on_duty: 0,
    fleet_utilization_percent: 0,
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('transitops_user'))?.token;
        const headers = { 'Authorization': `Bearer ${token}` };

        const [kpiRes, tripsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/analytics/kpis/', { headers }),
          fetch('http://127.0.0.1:8000/api/trips/', { headers })
        ]);

        if (kpiRes.ok) {
          const kpiData = await kpiRes.json();
          setKpis(kpiData);
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          // Assuming the backend returns an array or paginated object
          const tripsArray = Array.isArray(tripsData) ? tripsData : (tripsData.results || []);
          setRecentTrips(tripsArray.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const statusDistribution = [
    { status: 'Available', count: kpis.available_vehicles, color: 'var(--success)' },
    { status: 'On Trip', count: kpis.active_vehicles, color: 'var(--info)' },
    { status: 'In Shop', count: kpis.vehicles_in_maintenance, color: 'var(--warning)' },
  ];

  const maxStatusCount = Math.max(...statusDistribution.map(s => s.count), 1);

  return (
    <div className="dashboard-page">
      {/* ── Filter Strip ── */}
      <FilterBar filters={filters} onChange={handleFilterChange} />

      {/* ── KPI Row ── */}
      <div className="dashboard-kpi-row">
        <KPICard
          label="Active Vehicles"
          value={kpis.active_vehicles}
          accentColor="green"
        />
        <KPICard
          label="Available Vehicles"
          value={kpis.available_vehicles}
          accentColor="green"
        />
        <KPICard
          label="Vehicles in Maintenance"
          value={kpis.vehicles_in_maintenance}
          accentColor="amber"
        />
        <KPICard
          label="Active Trips"
          value={kpis.active_trips}
          accentColor="blue"
        />
        <KPICard
          label="Pending Trips"
          value={kpis.pending_trips}
          accentColor="blue"
        />
        <KPICard
          label="Drivers on Duty"
          value={kpis.drivers_on_duty}
          accentColor="orange"
        />
        <KPICard
          label="Fleet Utilization"
          value={kpis.fleet_utilization_percent}
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
                {loading ? (
                  <tr><td colSpan="5">Loading...</td></tr>
                ) : recentTrips.length === 0 ? (
                  <tr><td colSpan="5">No recent trips found.</td></tr>
                ) : (
                  recentTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="cell-mono">{trip.trip_number}</td>
                      <td className="cell-mono">{trip.vehicle_registration || trip.vehicle_reg}</td>
                      <td>{trip.driver_name || trip.driver}</td>
                      <td><StatusBadge status={trip.status} /></td>
                      <td className="cell-muted">{trip.planned_distance ? `${trip.planned_distance} km` : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Vehicle Status Distribution */}
        <section className="dashboard-vehicle-status">
          <h3 className="dashboard-section-title">Vehicle Status</h3>
          <div className="status-bars">
            {statusDistribution.map(({ status, count, color }) => (
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
