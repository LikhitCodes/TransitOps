import { useState, useMemo } from 'react';
import './ReportsPage.css';

// ─── Mock Analytics Data ─────────────────────────────────────

const VEHICLES = [
  { id: 1, reg: 'VAN-05', model: 'Ford Transit', acquisition_cost: 1200000 },
  { id: 2, reg: 'TRK-12', model: 'Volvo FH16', acquisition_cost: 4500000 },
  { id: 3, reg: 'PKP-03', model: 'Toyota Hilux', acquisition_cost: 1800000 },
  { id: 4, reg: 'VAN-08', model: 'Mercedes Sprinter', acquisition_cost: 1500000 },
  { id: 5, reg: 'SEM-01', model: 'Scania R450', acquisition_cost: 6200000 },
  { id: 6, reg: 'TRK-07', model: 'MAN TGX', acquisition_cost: 3800000 },
];

// Per-vehicle aggregated data
const VEHICLE_STATS = [
  { vehicle_id: 1, total_distance: 760, total_fuel: 95, total_fuel_cost: 9975, total_maint_cost: 4000, total_toll_cost: 350, total_other_cost: 800, total_revenue: 69000, total_trips: 4 },
  { vehicle_id: 2, total_distance: 1190, total_fuel: 250, total_fuel_cost: 26250, total_maint_cost: 8500, total_toll_cost: 1300, total_other_cost: 0, total_revenue: 126000, total_trips: 5 },
  { vehicle_id: 3, total_distance: 615, total_fuel: 80, total_fuel_cost: 8400, total_maint_cost: 4500, total_toll_cost: 290, total_other_cost: 0, total_revenue: 46000, total_trips: 3 },
  { vehicle_id: 4, total_distance: 420, total_fuel: 55, total_fuel_cost: 5775, total_maint_cost: 15000, total_toll_cost: 0, total_other_cost: 1200, total_revenue: 32000, total_trips: 2 },
  { vehicle_id: 5, total_distance: 890, total_fuel: 150, total_fuel_cost: 15750, total_maint_cost: 12000, total_toll_cost: 0, total_other_cost: 0, total_revenue: 85000, total_trips: 3 },
  { vehicle_id: 6, total_distance: 540, total_fuel: 80, total_fuel_cost: 8400, total_maint_cost: 6000, total_toll_cost: 0, total_other_cost: 0, total_revenue: 48000, total_trips: 2 },
];

// Fleet utilization over time (last 7 days)
const UTILIZATION_DATA = [
  { date: 'Jul 06', active: 3, total: 6, pct: 50 },
  { date: 'Jul 07', active: 4, total: 6, pct: 67 },
  { date: 'Jul 08', active: 3, total: 6, pct: 50 },
  { date: 'Jul 09', active: 5, total: 6, pct: 83 },
  { date: 'Jul 10', active: 4, total: 6, pct: 67 },
  { date: 'Jul 11', active: 3, total: 6, pct: 50 },
  { date: 'Jul 12', active: 2, total: 6, pct: 33 },
];

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

function FuelEfficiencyReport() {
  const data = useMemo(() =>
    VEHICLE_STATS.map(s => {
      const v = VEHICLES.find(v => v.id === s.vehicle_id);
      const efficiency = s.total_fuel > 0 ? (s.total_distance / s.total_fuel) : 0;
      return { ...s, vehicle: v, efficiency: Math.round(efficiency * 10) / 10 };
    }).sort((a, b) => b.efficiency - a.efficiency),
  []);

  const maxEfficiency = Math.max(...data.map(d => d.efficiency));
  const avgEfficiency = (data.reduce((s, d) => s + d.efficiency, 0) / data.length).toFixed(1);

  const handleExport = () => {
    downloadCSV(
      ['Vehicle', 'Model', 'Distance (km)', 'Fuel (L)', 'Efficiency (km/L)'],
      data.map(d => [d.vehicle.reg, d.vehicle.model, d.total_distance, d.total_fuel, d.efficiency]),
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
            <div className="h-bar-item" key={d.vehicle_id} style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-bar-label">{d.vehicle.reg}</span>
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
              <tr key={d.vehicle_id}>
                <td className="cell-mono" style={{ color: i === 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>#{i + 1}</td>
                <td className="cell-mono">{d.vehicle.reg}</td>
                <td>{d.vehicle.model}</td>
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

function FleetUtilizationReport() {
  const maxPct = 100;
  const avgUtil = (UTILIZATION_DATA.reduce((s, d) => s + d.pct, 0) / UTILIZATION_DATA.length).toFixed(0);
  const peakDay = UTILIZATION_DATA.reduce((best, d) => d.pct > best.pct ? d : best, UTILIZATION_DATA[0]);

  const handleExport = () => {
    downloadCSV(
      ['Date', 'Active Vehicles', 'Total Vehicles', 'Utilization (%)'],
      UTILIZATION_DATA.map(d => [d.date, d.active, d.total, `${d.pct}%`]),
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
          <div className="report-stat-value">{VEHICLES.length}</div>
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
          {UTILIZATION_DATA.map((d, i) => (
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
            {UTILIZATION_DATA.map((d, i) => (
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

function OperationalCostReport() {
  const costData = useMemo(() =>
    VEHICLE_STATS.map(s => {
      const v = VEHICLES.find(v => v.id === s.vehicle_id);
      const totalOps = s.total_fuel_cost + s.total_maint_cost + s.total_toll_cost + s.total_other_cost;
      return { ...s, vehicle: v, totalOps };
    }).sort((a, b) => b.totalOps - a.totalOps),
  []);

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
      costData.map(d => [d.vehicle.reg, d.vehicle.model, d.total_fuel_cost, d.total_maint_cost, d.total_toll_cost, d.total_other_cost, d.totalOps]),
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
            <div className="h-bar-item" key={d.vehicle_id} style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-bar-label">{d.vehicle.reg}</span>
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
              <tr key={d.vehicle_id}>
                <td className="cell-mono">{d.vehicle.reg}</td>
                <td>{d.vehicle.model}</td>
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

function VehicleROIReport() {
  const roiData = useMemo(() =>
    VEHICLE_STATS.map(s => {
      const v = VEHICLES.find(v => v.id === s.vehicle_id);
      const totalCosts = s.total_fuel_cost + s.total_maint_cost + s.total_toll_cost + s.total_other_cost;
      const roi = v.acquisition_cost > 0
        ? ((s.total_revenue - totalCosts) / v.acquisition_cost * 100)
        : 0;
      return { ...s, vehicle: v, totalCosts, roi: Math.round(roi * 100) / 100 };
    }).sort((a, b) => b.roi - a.roi),
  []);

  const avgROI = (roiData.reduce((s, d) => s + d.roi, 0) / roiData.length).toFixed(2);
  const maxROI = Math.max(...roiData.map(d => Math.abs(d.roi)));

  const handleExport = () => {
    downloadCSV(
      ['Vehicle', 'Model', 'Revenue', 'Total Costs', 'Acquisition Cost', 'ROI (%)'],
      roiData.map(d => [d.vehicle.reg, d.vehicle.model, d.total_revenue, d.totalCosts, d.vehicle.acquisition_cost, `${d.roi}%`]),
      'vehicle_roi_report.csv'
    );
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
            <div className="h-bar-item" key={d.vehicle_id} style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-bar-label">{d.vehicle.reg}</span>
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
                <tr key={d.vehicle_id}>
                  <td className="cell-mono" style={{ color: i === 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>#{i + 1}</td>
                  <td className="cell-mono">{d.vehicle.reg}</td>
                  <td className="cell-mono">{formatCurrency(d.total_revenue)}</td>
                  <td className="cell-mono">{formatCurrency(d.totalCosts)}</td>
                  <td className="cell-mono" style={{ color: profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                  </td>
                  <td className="cell-mono">{formatCurrency(d.vehicle.acquisition_cost)}</td>
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

  const REPORTS = [
    { key: 'fuel-efficiency', label: 'Fuel Efficiency' },
    { key: 'fleet-utilization', label: 'Fleet Utilization' },
    { key: 'operational-cost', label: 'Operational Cost' },
    { key: 'vehicle-roi', label: 'Vehicle ROI' },
  ];

  const renderReport = () => {
    switch (activeReport) {
      case 'fuel-efficiency':    return <FuelEfficiencyReport />;
      case 'fleet-utilization':  return <FleetUtilizationReport />;
      case 'operational-cost':   return <OperationalCostReport />;
      case 'vehicle-roi':        return <VehicleROIReport />;
      default:                   return <FuelEfficiencyReport />;
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
