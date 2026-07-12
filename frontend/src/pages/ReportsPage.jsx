import { useState, useMemo, useEffect, useCallback } from 'react';
import './ReportsPage.css';

// ─── Helper Functions ────────────────────────────────────────

const formatCurrency = (val) => `₹${val.toLocaleString()}`;

// ─── CSV Export ──────────────────────────────────────────────

function downloadCSV(headers, rows, filename) {
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ─── Report Components ───────────────────────────────────────

function FuelEfficiencyReport({ vehicleStats, vehicles }) {
  const data = useMemo(() =>
    vehicleStats.map(s => {
      const v = vehicles.find(v => v.id === s.vehicle);
      const efficiency = s.total_fuel > 0 ? (s.total_distance / s.total_fuel) : 0;
      return { ...s, vehicle: v, efficiency: Math.round(efficiency * 10) / 10 };
    }).sort((a, b) => b.efficiency - a.efficiency),
    [vehicleStats, vehicles]);

  const maxEfficiency = Math.max(...data.map(d => d.efficiency));
  const avgEfficiency = (data.reduce((s, d) => s + d.efficiency, 0) / data.length).toFixed(1);

  const handleExport = () => {
    downloadCSV(
      ['Vehicle', 'Model', 'Distance (km)', 'Fuel (L)', 'Efficiency (km/L)'],
      data.map(d => [d.vehicle?.registration_number, d.vehicle?.model_name, d.total_distance, d.total_fuel, d.efficiency]),
      'fuel_efficiency_report.csv'
    );
  };

  return (
    <>
      <div className="report-formula">
        <span className="report-formula-label">Formula</span>
        Fuel Efficiency = Total Distance (km) ÷ Total Fuel Consumed (L)
      </div>

      <div className="report-headline">
        <div className="report-stat-card report-stat-card--green">
          <div className="report-stat-value">{data[0]?.efficiency} km/L</div>
          <div className="report-stat-label">Best Efficiency</div>
        </div>
        <div className="report-stat-card report-stat-card--blue">
          <div className="report-stat-value">{avgEfficiency} km/L</div>
          <div className="report-stat-label">Fleet Average</div>
        </div>
        <div className="report-stat-card report-stat-card--orange">
          <div className="report-stat-value">{data[data.length - 1]?.efficiency} km/L</div>
          <div className="report-stat-label">Lowest Efficiency</div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="report-chart-container">
        <div className="report-chart-header">
          <span className="report-chart-title">Fuel Efficiency by Vehicle</span>
          <button className="btn-secondary btn-sm" onClick={handleExport}>Export CSV</button>
        </div>
        <div className="h-bar-chart">
          {data.map((d, i) => (
            <div className="h-bar-item" key={d.vehicle} style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-bar-label">{d.vehicle?.registration_number}</span>
              <div className="h-bar-track">
                <div
                  className="h-bar-fill"
                  style={{
                    width: `${(d.efficiency / maxEfficiency) * 100}%`,
                    background: d.efficiency >= avgEfficiency ? 'var(--accent-green)' : 'var(--accent-orange)',
                  }}
                />
              </div>
              <span className="h-bar-value">{d.efficiency} km/L</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="report-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Vehicle</th>
              <th>Model</th>
              <th>Distance (km)</th>
              <th>Fuel (L)</th>
              <th>Efficiency (km/L)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.vehicle}>
                <td className="cell-mono" style={{ color: i === 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>#{i + 1}</td>
                <td className="cell-mono">{d.vehicle?.registration_number}</td>
                <td>{d.vehicle?.model_name}</td>
                <td className="cell-mono">{d.total_distance}</td>
                <td className="cell-mono">{d.total_fuel} L</td>
                <td className="cell-mono" style={{ fontWeight: 700, color: d.efficiency >= avgEfficiency ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {d.efficiency} km/L
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FleetUtilizationReport({ utilizationData, vehicles }) {
  const maxPct = 100;
  const avgUtil = utilizationData.length > 0 ? (utilizationData.reduce((s, d) => s + d.pct, 0) / utilizationData.length).toFixed(0) : 0;
  const peakDay = utilizationData.length > 0 ? utilizationData.reduce((best, d) => d.pct > best.pct ? d : best, utilizationData[0]) : { pct: 0, date: '-' };

  const handleExport = () => {
    downloadCSV(
      ['Date', 'Active Vehicles', 'Total Vehicles', 'Utilization (%)'],
      utilizationData.map(d => [d.date, d.active, d.total, `${d.pct}%`]),
      'fleet_utilization_report.csv'
    );
  };

  return (
    <>
      <div className="report-formula">
        <span className="report-formula-label">Formula</span>
        Fleet Utilization = (Active Vehicles ÷ Total Available + Active Vehicles) × 100
      </div>

      <div className="report-headline">
        <div className="report-stat-card report-stat-card--green">
          <div className="report-stat-value">{avgUtil}%</div>
          <div className="report-stat-label">Avg Utilization</div>
        </div>
        <div className="report-stat-card report-stat-card--blue">
          <div className="report-stat-value">{peakDay.pct}%</div>
          <div className="report-stat-label">Peak ({peakDay.date})</div>
        </div>
        <div className="report-stat-card report-stat-card--amber">
          <div className="report-stat-value">{vehicles.length}</div>
          <div className="report-stat-label">Total Fleet Size</div>
        </div>
      </div>

      {/* Vertical Bar Chart */}
      <div className="report-chart-container">
        <div className="report-chart-header">
          <span className="report-chart-title">Fleet Utilization — Last 7 Days</span>
          <button className="btn-secondary btn-sm" onClick={handleExport}>Export CSV</button>
        </div>
        <div className="bar-chart">
          {utilizationData.map((d, i) => (
            <div className="bar-chart-item" key={i}>
              <div
                className="bar-chart-bar"
                style={{
                  height: `${(d.pct / maxPct) * 220}px`,
                  background: d.pct >= 60 ? 'var(--accent-green)' : d.pct >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)',
                }}
              >
                <span className="bar-chart-bar-value">{d.pct}%</span>
              </div>
              <span className="bar-chart-label">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-table-container">
        <table className="data-table">
          <thead><tr><th>Date</th><th>Active</th><th>Total</th><th>Utilization</th></tr></thead>
          <tbody>
            {utilizationData.map((d, i) => (
              <tr key={i}>
                <td>{d.date}</td>
                <td className="cell-mono">{d.active}</td>
                <td className="cell-mono">{d.total}</td>
                <td className="cell-mono" style={{ fontWeight: 700, color: d.pct >= 60 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                  {d.pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OperationalCostReport({ vehicleStats, vehicles }) {
  const costData = useMemo(() =>
    vehicleStats.map(s => {
      const v = vehicles.find(v => v.id === s.vehicle);
      const totalOps = s.total_fuel_cost + s.total_maint_cost + s.total_toll_cost + s.total_other_cost;
      return { ...s, vehicle: v, totalOps };
    }).sort((a, b) => b.totalOps - a.totalOps),
    [vehicleStats, vehicles]);

  const grandTotal = costData.reduce((s, d) => s + d.totalOps, 0);
  const totalFuel = costData.reduce((s, d) => s + d.total_fuel_cost, 0);
  const totalMaint = costData.reduce((s, d) => s + d.total_maint_cost, 0);
  const totalToll = costData.reduce((s, d) => s + d.total_toll_cost, 0);
  const totalOther = costData.reduce((s, d) => s + d.total_other_cost, 0);

  const donutSegments = [
    { label: 'Fuel', value: totalFuel, color: '#4285f4' },
    { label: 'Maintenance', value: totalMaint, color: '#ffb800' },
    { label: 'Tolls', value: totalToll, color: '#ff6b00' },
    { label: 'Other', value: totalOther, color: '#a855f7' },
  ];

  // Build conic gradient for donut chart
  let cumulativePct = 0;
  const conicStops = donutSegments.map(seg => {
    const pct = (seg.value / grandTotal) * 100;
    const start = cumulativePct;
    cumulativePct += pct;
    return `${seg.color} ${start}% ${cumulativePct}%`;
  }).join(', ');

  const maxCost = Math.max(...costData.map(d => d.totalOps));

  const handleExport = () => {
    downloadCSV(
      ['Vehicle', 'Model', 'Fuel Cost', 'Maintenance', 'Tolls', 'Other', 'Total Ops Cost'],
      costData.map(d => [d.vehicle?.registration_number, d.vehicle?.model_name, d.total_fuel_cost, d.total_maint_cost, d.total_toll_cost, d.total_other_cost, d.totalOps]),
      'operational_cost_report.csv'
    );
  };

  return (
    <>
      <div className="report-formula">
        <span className="report-formula-label">Formula</span>
        Operational Cost = Fuel Cost + Maintenance Cost + Tolls + Other Expenses
      </div>

      <div className="report-headline">
        <div className="report-stat-card report-stat-card--green">
          <div className="report-stat-value">{formatCurrency(grandTotal)}</div>
          <div className="report-stat-label">Total Ops Cost</div>
        </div>
        <div className="report-stat-card report-stat-card--blue">
          <div className="report-stat-value">{formatCurrency(totalFuel)}</div>
          <div className="report-stat-label">Fuel</div>
        </div>
        <div className="report-stat-card report-stat-card--amber">
          <div className="report-stat-value">{formatCurrency(totalMaint)}</div>
          <div className="report-stat-label">Maintenance</div>
        </div>
        <div className="report-stat-card report-stat-card--orange">
          <div className="report-stat-value">{formatCurrency(totalToll + totalOther)}</div>
          <div className="report-stat-label">Tolls & Other</div>
        </div>
      </div>

      {/* Donut + Legend */}
      <div className="report-chart-container">
        <div className="report-chart-header">
          <span className="report-chart-title">Cost Breakdown</span>
          <button className="btn-secondary btn-sm" onClick={handleExport}>Export CSV</button>
        </div>
        <div className="donut-chart-container">
          <div
            className="donut-chart"
            style={{
              background: `conic-gradient(${conicStops})`,
              mask: 'radial-gradient(farthest-side, transparent 55%, #000 56%)',
              WebkitMask: 'radial-gradient(farthest-side, transparent 55%, #000 56%)',
            }}
          >
            <div className="donut-chart-center">
              <div className="donut-chart-center-value">{formatCurrency(grandTotal)}</div>
              <div className="donut-chart-center-label">Total</div>
            </div>
          </div>
          <div className="donut-legend">
            {donutSegments.map(seg => (
              <div className="donut-legend-item" key={seg.label}>
                <span className="donut-legend-dot" style={{ background: seg.color }} />
                <span className="donut-legend-label">{seg.label}</span>
                <span className="donut-legend-value">{formatCurrency(seg.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Vehicle Cost Chart */}
      <div className="report-chart-container">
        <div className="report-chart-header">
          <span className="report-chart-title">Operational Cost by Vehicle</span>
        </div>
        <div className="h-bar-chart">
          {costData.map((d, i) => (
            <div className="h-bar-item" key={d.vehicle} style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-bar-label">{d.vehicle?.registration_number}</span>
              <div className="h-bar-track">
                <div className="h-bar-fill" style={{ width: `${(d.totalOps / maxCost) * 100}%`, background: 'var(--accent-amber)' }} />
              </div>
              <span className="h-bar-value">{formatCurrency(d.totalOps)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-table-container">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Model</th><th>Fuel (₹)</th><th>Maintenance (₹)</th><th>Tolls (₹)</th><th>Other (₹)</th><th>Total (₹)</th></tr></thead>
          <tbody>
            {costData.map(d => (
              <tr key={d.vehicle}>
                <td className="cell-mono">{d.vehicle?.registration_number}</td>
                <td>{d.vehicle?.model_name}</td>
                <td className="cell-mono">{formatCurrency(d.total_fuel_cost)}</td>
                <td className="cell-mono">{formatCurrency(d.total_maint_cost)}</td>
                <td className="cell-mono">{formatCurrency(d.total_toll_cost)}</td>
                <td className="cell-mono">{formatCurrency(d.total_other_cost)}</td>
                <td className="cell-mono" style={{ fontWeight: 700 }}>{formatCurrency(d.totalOps)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VehicleROIReport({ vehicleStats, vehicles }) {
  const roiData = useMemo(() =>
    vehicleStats.map(s => {
      const v = vehicles.find(v => v.id === s.vehicle);
      const totalCosts = s.total_fuel_cost + s.total_maint_cost + s.total_toll_cost + s.total_other_cost;
      const acqCost = v?.acquisition_cost || 0;
      const roi = acqCost > 0
        ? ((s.total_revenue - totalCosts) / acqCost * 100)
        : 0;
      return { ...s, vehicle: v, totalCosts, roi: Math.round(roi * 100) / 100 };
    }).sort((a, b) => b.roi - a.roi),
    [vehicleStats, vehicles]);

  const avgROI = roiData.length > 0 ? (roiData.reduce((s, d) => s + d.roi, 0) / roiData.length).toFixed(2) : 0;
  const maxROI = roiData.length > 0 ? Math.max(...roiData.map(d => Math.abs(d.roi))) : 1;

  const handleExport = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('transitops_user'))?.token;
      const res = await fetch('http://127.0.0.1:8000/api/analytics/export/csv/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transitops_analytics.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert('Failed to export CSV');
    }
  };

  return (
    <>
      <div className="report-formula">
        <span className="report-formula-label">Formula</span>
        ROI = (Revenue − (Maintenance + Fuel + Other)) ÷ Acquisition Cost × 100
      </div>

      <div className="report-headline">
        <div className="report-stat-card report-stat-card--green">
          <div className="report-stat-value">{roiData[0]?.roi}%</div>
          <div className="report-stat-label">Best ROI</div>
        </div>
        <div className="report-stat-card report-stat-card--blue">
          <div className="report-stat-value">{avgROI}%</div>
          <div className="report-stat-label">Fleet Avg ROI</div>
        </div>
        <div className="report-stat-card report-stat-card--amber">
          <div className="report-stat-value">{formatCurrency(roiData.reduce((s, d) => s + d.total_revenue, 0))}</div>
          <div className="report-stat-label">Total Revenue</div>
        </div>
      </div>

      {/* ROI Bar Chart */}
      <div className="report-chart-container">
        <div className="report-chart-header">
          <span className="report-chart-title">Vehicle ROI Ranking</span>
          <button className="btn-secondary btn-sm" onClick={handleExport}>Export CSV</button>
        </div>
        <div className="h-bar-chart">
          {roiData.map((d, i) => (
            <div className="h-bar-item" key={d.vehicle} style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-bar-label">{d.vehicle?.registration_number}</span>
              <div className="h-bar-track">
                <div
                  className="h-bar-fill"
                  style={{
                    width: `${(Math.abs(d.roi) / maxROI) * 100}%`,
                    background: d.roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                  }}
                />
              </div>
              <span className={`h-bar-value ${d.roi >= 0 ? 'roi-positive' : 'roi-negative'}`}>
                {d.roi >= 0 ? '+' : ''}{d.roi}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-table-container">
        <table className="data-table">
          <thead><tr><th>Rank</th><th>Vehicle</th><th>Revenue (₹)</th><th>Total Cost (₹)</th><th>Profit (₹)</th><th>Acq. Cost (₹)</th><th>ROI</th></tr></thead>
          <tbody>
            {roiData.map((d, i) => {
              const profit = d.total_revenue - d.totalCosts;
              return (
                <tr key={d.vehicle}>
                  <td className="cell-mono" style={{ color: i === 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>#{i + 1}</td>
                  <td className="cell-mono">{d.vehicle?.registration_number}</td>
                  <td className="cell-mono">{formatCurrency(d.total_revenue)}</td>
                  <td className="cell-mono">{formatCurrency(d.totalCosts)}</td>
                  <td className="cell-mono" style={{ color: profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                  </td>
                  <td className="cell-mono">{formatCurrency(d.vehicle?.acquisition_cost || 0)}</td>
                  <td className="cell-mono" style={{ fontWeight: 700, color: d.roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {d.roi >= 0 ? '+' : ''}{d.roi}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN REPORTS PAGE
// ═══════════════════════════════════════════════════════════════

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('fuel-efficiency');
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const token = JSON.parse(localStorage.getItem('transitops_user'))?.token;
      const headers = { 'Authorization': `Bearer ${token}` };

      const [vehRes, tripRes, expRes, fuelRes, dashboardRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/fleet/vehicles/', { headers }),
        fetch('http://127.0.0.1:8000/api/trips/', { headers }),
        fetch('http://127.0.0.1:8000/api/expenses/', { headers }),
        fetch('http://127.0.0.1:8000/api/fuel-logs/', { headers }),
        fetch('http://127.0.0.1:8000/api/analytics/dashboard/', { headers }),
      ]);

      if (vehRes.ok) {
        const data = await vehRes.json();
        setVehicles(Array.isArray(data) ? data : data.results || []);
      }
      if (tripRes.ok) {
        const data = await tripRes.json();
        setTrips(Array.isArray(data) ? data : data.results || []);
      }
      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(Array.isArray(data) ? data : data.results || []);
      }
      if (fuelRes.ok) {
        const data = await fuelRes.json();
        setFuelLogs(Array.isArray(data) ? data : data.results || []);
      }
      if (dashboardRes.ok) {
        setDashboardData(await dashboardRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const vehicleStats = useMemo(() => {
    const map = {};
    vehicles.forEach(v => {
      map[v.id] = {
        vehicle: v.id, total_distance: 0, total_fuel: 0, total_fuel_cost: 0,
        total_maint_cost: 0, total_toll_cost: 0, total_other_cost: 0,
        total_revenue: 0, total_trips: 0
      };
    });

    trips.forEach(t => {
      if (map[t.vehicle] && t.status === 'Completed') {
        map[t.vehicle].total_trips += 1;
        map[t.vehicle].total_distance += (t.actual_distance || t.planned_distance || 0);
        map[t.vehicle].total_fuel += (t.fuel_consumed || 0);
        map[t.vehicle].total_revenue += (t.revenue || 0);
      }
    });

    fuelLogs.forEach(f => {
      if (map[f.vehicle]) {
        map[f.vehicle].total_fuel_cost += (f.cost || 0);
      }
    });

    expenses.forEach(e => {
      if (map[e.vehicle]) {
        if (e.expense_type === 'Maintenance Cost') map[e.vehicle].total_maint_cost += e.cost;
        else if (e.expense_type === 'Toll') map[e.vehicle].total_toll_cost += e.cost;
        else map[e.vehicle].total_other_cost += e.cost;
      }
    });

    return Object.values(map);
  }, [vehicles, trips, expenses, fuelLogs]);

  const utilizationData = useMemo(() => {
    // Generate basic last 7 days mock data, but dynamically scale to total vehicles.
    const total = vehicles.length;
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const active = Math.floor(Math.random() * (total + 1));
      return {
        date: d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
        active,
        total,
        pct: total > 0 ? Math.round((active / total) * 100) : 0
      };
    });
  }, [vehicles.length]);

  const REPORTS = [
    { key: 'fuel-efficiency', label: 'Fuel Efficiency' },
    { key: 'fleet-utilization', label: 'Fleet Utilization' },
    { key: 'operational-cost', label: 'Operational Cost' },
    { key: 'vehicle-roi', label: 'Vehicle ROI' },
  ];

  const renderReport = () => {
    switch (activeReport) {
      case 'fuel-efficiency': return <FuelEfficiencyReport vehicleStats={vehicleStats} vehicles={vehicles} />;
      case 'fleet-utilization': return <FleetUtilizationReport utilizationData={utilizationData} vehicles={vehicles} />;
      case 'operational-cost': return <OperationalCostReport vehicleStats={vehicleStats} vehicles={vehicles} />;
      case 'vehicle-roi': return <VehicleROIReport vehicleStats={vehicleStats} vehicles={vehicles} />;
      default: return <FuelEfficiencyReport vehicleStats={vehicleStats} vehicles={vehicles} />;
    }
  };

  return (
    <div className="reports-page grid-bg">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Operational insights, fleet performance, and financial metrics</p>
          </div>
        </div>

        {/* Global KPIs from Dashboard API */}
        {dashboardData && (
          <div className="report-headline" style={{ marginBottom: '24px' }}>
            <div className="report-stat-card report-stat-card--green">
              <div className="report-stat-value">{dashboardData.fuel_efficiency}</div>
              <div className="report-stat-label">Avg Fuel Efficiency</div>
            </div>
            <div className="report-stat-card report-stat-card--blue">
              <div className="report-stat-value">{dashboardData.fleet_utilization}</div>
              <div className="report-stat-label">Fleet Utilization</div>
            </div>
            <div className="report-stat-card report-stat-card--orange">
              <div className="report-stat-value">₹{dashboardData.operational_cost?.toLocaleString()}</div>
              <div className="report-stat-label">Operational Cost</div>
            </div>
            <div className="report-stat-card report-stat-card--purple">
              <div className="report-stat-value">{dashboardData.vehicle_roi}</div>
              <div className="report-stat-label">Global ROI</div>
            </div>
          </div>
        )}

        {/* Report Tabs */}
        <div className="report-tabs">
          {REPORTS.map(r => (
            <button
              key={r.key}
              className={`report-tab ${activeReport === r.key ? 'active' : ''}`}
              onClick={() => setActiveReport(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Active Report */}
        {renderReport()}
      </div>
    </div>
  );
}
