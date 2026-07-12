/**
 * TransitOps — Mock Data Layer
 * Realistic demo data matching the seed plan from implementation_plan2.md.
 * Will be replaced with API calls when backend is ready.
 */

// ── Vehicles ──
export const VEHICLES = [
  { id: 1,  registration_number: 'VAN-05',  model_name: 'Ford Transit',     vehicle_type: 'Van',          max_load_capacity: 500,  odometer: 34500,  status: 'On Trip',    region: 'North', acquisition_cost: 35000 },
  { id: 2,  registration_number: 'TRK-12',  model_name: 'Volvo FH16',       vehicle_type: 'Truck',        max_load_capacity: 8000, odometer: 120300, status: 'Available',  region: 'South', acquisition_cost: 95000 },
  { id: 3,  registration_number: 'MINI-09', model_name: 'Toyota HiAce',     vehicle_type: 'Van',          max_load_capacity: 350,  odometer: 21000,  status: 'On Trip',    region: 'East',  acquisition_cost: 28000 },
  { id: 4,  registration_number: 'PKP-03',  model_name: 'Toyota Hilux',     vehicle_type: 'Pickup',       max_load_capacity: 1200, odometer: 45200,  status: 'Available',  region: 'North', acquisition_cost: 42000 },
  { id: 5,  registration_number: 'TRK-07',  model_name: 'MAN TGX',          vehicle_type: 'Truck',        max_load_capacity: 10000,odometer: 89000,  status: 'In Shop',    region: 'West',  acquisition_cost: 110000 },
  { id: 6,  registration_number: 'SEM-01',  model_name: 'Scania R500',      vehicle_type: 'Semi Trailer', max_load_capacity: 25000,odometer: 200100, status: 'Available',  region: 'South', acquisition_cost: 150000 },
  { id: 7,  registration_number: 'VAN-11',  model_name: 'Mercedes Sprinter', vehicle_type: 'Van',         max_load_capacity: 450,  odometer: 58000,  status: 'Available',  region: 'East',  acquisition_cost: 38000 },
  { id: 8,  registration_number: 'CAR-02',  model_name: 'Honda City',       vehicle_type: 'Car',          max_load_capacity: 200,  odometer: 15400,  status: 'Available',  region: 'North', acquisition_cost: 18000 },
  { id: 9,  registration_number: 'TRK-19',  model_name: 'Tata Prima',       vehicle_type: 'Truck',        max_load_capacity: 9000, odometer: 67500,  status: 'In Shop',    region: 'West',  acquisition_cost: 85000 },
  { id: 10, registration_number: 'PKP-08',  model_name: 'Isuzu D-Max',      vehicle_type: 'Pickup',       max_load_capacity: 1100, odometer: 32000,  status: 'Available',  region: 'South', acquisition_cost: 39000 },
  { id: 11, registration_number: 'SEM-04',  model_name: 'DAF XF',           vehicle_type: 'Semi Trailer', max_load_capacity: 24000,odometer: 180000, status: 'Retired',    region: 'North', acquisition_cost: 140000 },
  { id: 12, registration_number: 'VAN-15',  model_name: 'Renault Master',   vehicle_type: 'Van',          max_load_capacity: 400,  odometer: 42100,  status: 'Available',  region: 'East',  acquisition_cost: 32000 },
];

// ── Drivers ──
export const DRIVERS = [
  { id: 1,  name: 'Alex Kumar',     license_number: 'DL-88213', license_category: 'LMV', license_expiry: '2028-12-15', safety_score: 96, status: 'Available',  contact: '+91 98765 43210', trips_completed: 142 },
  { id: 2,  name: 'John Mathew',    license_number: 'DL-44120', license_category: 'HMV', license_expiry: '2025-03-20', safety_score: 81, status: 'Suspended',  contact: '+91 98220 43211', trips_completed: 87  },
  { id: 3,  name: 'Priya Singh',    license_number: 'DL-77031', license_category: 'LMV', license_expiry: '2027-08-10', safety_score: 99, status: 'On Trip',    contact: '+91 99110 43212', trips_completed: 203 },
  { id: 4,  name: 'Suresh Reddy',   license_number: 'DL-90045', license_category: 'HMV', license_expiry: '2027-01-30', safety_score: 88, status: 'Off Duty',   contact: '+91 97440 43215', trips_completed: 156 },
  { id: 5,  name: 'Ravi Sharma',    license_number: 'DL-55092', license_category: 'LMV', license_expiry: '2026-08-05', safety_score: 78, status: 'Available',  contact: '+91 98765 43213', trips_completed: 64  },
  { id: 6,  name: 'Deepa Nair',     license_number: 'DL-62118', license_category: 'HMV', license_expiry: '2027-01-30', safety_score: 85, status: 'Available',  contact: '+91 98765 43214', trips_completed: 118 },
  { id: 7,  name: 'Meera Joshi',    license_number: 'DL-33067', license_category: 'LMV', license_expiry: '2027-09-18', safety_score: 91, status: 'Available',  contact: '+91 98765 43216', trips_completed: 95  },
  { id: 8,  name: 'Arun Patel',     license_number: 'DL-71204', license_category: 'HMV', license_expiry: '2026-05-22', safety_score: 65, status: 'Suspended',  contact: '+91 98765 43217', trips_completed: 43  },
  { id: 9,  name: 'Kavitha Das',    license_number: 'DL-19853', license_category: 'LMV', license_expiry: '2027-12-01', safety_score: 97, status: 'Available',  contact: '+91 98765 43218', trips_completed: 178 },
  { id: 10, name: 'Vikram Iyer',    license_number: 'DL-45901', license_category: 'HMV', license_expiry: '2027-04-15', safety_score: 82, status: 'On Trip',    contact: '+91 98765 43219', trips_completed: 71  },
];

// ── Trips ──
export const TRIPS = [
  { id: 1,  trip_number: 'TR001', vehicle_reg: 'VAN-05',  driver: 'Alex',   status: 'On Trip',    eta: '45 min',           source: 'Chennai',    destination: 'Bangalore', cargo_weight: 420,  planned_distance: 350 },
  { id: 2,  trip_number: 'TR002', vehicle_reg: 'TRK-12',  driver: 'John',   status: 'Completed',  eta: '—',                source: 'Mumbai',     destination: 'Pune',      cargo_weight: 6500, planned_distance: 150 },
  { id: 3,  trip_number: 'TR003', vehicle_reg: 'MINI-09', driver: 'Priya',  status: 'Dispatched', eta: '1h 10m',           source: 'Delhi',      destination: 'Jaipur',    cargo_weight: 280,  planned_distance: 280 },
  { id: 4,  trip_number: 'TR004', vehicle_reg: '—',       driver: '—',      status: 'Draft',      eta: 'Awaiting vehicle', source: 'Hyderabad',  destination: 'Vizag',     cargo_weight: 0,    planned_distance: 620 },
  { id: 5,  trip_number: 'TR005', vehicle_reg: 'PKP-03',  driver: 'Ravi',   status: 'Completed',  eta: '—',                source: 'Kochi',      destination: 'Trivandrum',cargo_weight: 800,  planned_distance: 200 },
  { id: 6,  trip_number: 'TR006', vehicle_reg: 'SEM-01',  driver: 'Deepa',  status: 'Completed',  eta: '—',                source: 'Ahmedabad',  destination: 'Surat',     cargo_weight: 18000,planned_distance: 265 },
  { id: 7,  trip_number: 'TR007', vehicle_reg: 'VAN-11',  driver: 'Meera',  status: 'Completed',  eta: '—',                source: 'Lucknow',    destination: 'Kanpur',    cargo_weight: 320,  planned_distance: 80  },
  { id: 8,  trip_number: 'TR008', vehicle_reg: 'CAR-02',  driver: 'Vikram', status: 'Cancelled',  eta: '—',                source: 'Pune',       destination: 'Mumbai',    cargo_weight: 150,  planned_distance: 150 },
  { id: 9,  trip_number: 'TR009', vehicle_reg: '—',       driver: '—',      status: 'Draft',      eta: 'Awaiting vehicle', source: 'Bangalore',  destination: 'Mysore',    cargo_weight: 0,    planned_distance: 150 },
  { id: 10, trip_number: 'TR010', vehicle_reg: 'PKP-08',  driver: 'Kavitha',status: 'Completed',  eta: '—',                source: 'Chandigarh', destination: 'Amritsar',  cargo_weight: 950,  planned_distance: 230 },
  { id: 11, trip_number: 'TR011', vehicle_reg: 'VAN-15',  driver: 'John',   status: 'Completed',  eta: '—',                source: 'Patna',      destination: 'Ranchi',    cargo_weight: 380,  planned_distance: 310 },
  { id: 12, trip_number: 'TR012', vehicle_reg: 'TRK-12',  driver: 'Ravi',   status: 'Dispatched', eta: '2h 30m',           source: 'Jaipur',     destination: 'Udaipur',   cargo_weight: 5200, planned_distance: 395 },
  { id: 13, trip_number: 'TR013', vehicle_reg: '—',       driver: '—',      status: 'Draft',      eta: 'Awaiting vehicle', source: 'Goa',        destination: 'Belgaum',   cargo_weight: 0,    planned_distance: 110 },
  { id: 14, trip_number: 'TR014', vehicle_reg: 'SEM-01',  driver: 'Deepa',  status: 'Cancelled',  eta: '—',                source: 'Nagpur',     destination: 'Raipur',    cargo_weight: 15000,planned_distance: 290 },
  { id: 15, trip_number: 'TR015', vehicle_reg: 'VAN-05',  driver: 'Alex',   status: 'Dispatched', eta: '55 min',           source: 'Coimbatore', destination: 'Salem',     cargo_weight: 400,  planned_distance: 160 },
];

// ── Dashboard KPIs ──
export const DASHBOARD_KPIS = {
  activeVehicles:      53,
  availableVehicles:   42,
  vehiclesInMaintenance: 5,
  activeTrips:         18,
  pendingTrips:         9,
  driversOnDuty:       26,
  fleetUtilization:    81, // percentage
};

// ── Vehicle Status Distribution (for horizontal bar chart) ──
export const VEHICLE_STATUS_DISTRIBUTION = [
  { status: 'Available', count: 42, color: 'var(--accent-green)'  },
  { status: 'On Trip',   count: 6,  color: 'var(--accent-blue)'   },
  { status: 'In Shop',   count: 3,  color: 'var(--accent-orange)' },
  { status: 'Retired',   count: 2,  color: 'var(--accent-red)'    },
];

// ── Filter Options ──
export const VEHICLE_TYPES = ['All', 'Van', 'Truck', 'Semi Trailer', 'Pickup', 'Car'];
export const VEHICLE_STATUSES = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];
export const REGIONS = ['All', 'North', 'South', 'East', 'West'];

// ── Sidebar Navigation Items ──
export const NAV_ITEMS = [
  { label: 'Dashboard',        path: '/dashboard',     icon: 'dashboard' },
  { label: 'Fleet',            path: '/fleet',         icon: 'fleet' },
  { label: 'Drivers',          path: '/drivers',       icon: 'drivers' },
  { label: 'Trips',            path: '/trips',         icon: 'trips' },
  { label: 'Maintenance',      path: '/maintenance',   icon: 'maintenance' },
  { label: 'Fuel & Expenses',  path: '/fuel-expenses', icon: 'fuel' },
  { label: 'Analytics',        path: '/analytics',     icon: 'analytics' },
  { label: 'Settings',         path: '/settings',      icon: 'settings' },
];
