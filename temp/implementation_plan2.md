# TransitOps — Hackathon-Winning Implementation Plan

> **Goal**: Build a production-grade transport operations platform in 8 hours that digitizes vehicle, driver, dispatch, maintenance, and expense management — with enforced business rules, role-based access, and stunning analytics.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Backend** | Django 5.x + Django REST Framework | Batteries-included ORM, admin panel, migrations, serializers, permissions — maximum velocity for a hackathon |
| **Database** | PostgreSQL 16 | Robust relational DB with transactional integrity, CHECK constraints, and full ACID compliance for atomic status transitions |
| **Frontend** | Vite + React 18 (JavaScript) | Lightning-fast HMR, component-based UI, easy integration with REST APIs |
| **Styling** | Vanilla CSS (Custom Properties) | Full control over premium glassmorphism dark-mode design — no framework bloat |
| **Charts** | Recharts | Declarative, composable chart components that look stunning out of the box |
| **Auth** | Django built-in auth + JWT (`djangorestframework-simplejwt`) | Industry-standard token auth with zero custom crypto |
| **CSV/PDF** | Browser-native CSV + `jspdf` (client-side) | Lightweight, no server-side rendering dependencies |

---

## Project Structure

```
TransitOps/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── transitops/                    # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/                      # Auth & RBAC app
│   │   ├── models.py                  # CustomUser with role field
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py             # Role-based permission classes
│   │   ├── urls.py
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py       # Demo data seeder
│   ├── fleet/                         # Vehicles & Drivers app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── signals.py                 # Auto status-transition signals
│   │   └── urls.py
│   ├── operations/                    # Trips, Maintenance, Fuel, Expenses app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── validators.py             # Business rule validators
│   │   └── urls.py
│   └── analytics/                     # Dashboard KPIs & Reports app
│       ├── views.py
│       ├── serializers.py
│       └── urls.py
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/                       # Axios instance + endpoint helpers
    │   │   ├── axios.js
    │   │   ├── auth.js
    │   │   ├── vehicles.js
    │   │   ├── drivers.js
    │   │   ├── trips.js
    │   │   ├── maintenance.js
    │   │   ├── expenses.js
    │   │   └── analytics.js
    │   ├── components/                # Reusable UI components
    │   │   ├── Layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Topbar.jsx
    │   │   │   └── AppLayout.jsx
    │   │   ├── ui/
    │   │   │   ├── KPICard.jsx
    │   │   │   ├── StatusBadge.jsx
    │   │   │   ├── DataTable.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── ConfirmDialog.jsx
    │   │   │   ├── FilterBar.jsx
    │   │   │   ├── EmptyState.jsx
    │   │   │   └── LoadingSpinner.jsx
    │   │   └── charts/
    │   │       ├── FuelEfficiencyChart.jsx
    │   │       ├── FleetUtilizationChart.jsx
    │   │       ├── OperationalCostChart.jsx
    │   │       └── VehicleROIChart.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx         # JWT storage, role, user state
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useFetch.js
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── VehiclesPage.jsx
    │   │   ├── DriversPage.jsx
    │   │   ├── TripsPage.jsx
    │   │   ├── MaintenancePage.jsx
    │   │   ├── ExpensesPage.jsx
    │   │   └── ReportsPage.jsx
    │   ├── styles/
    │   │   ├── index.css              # Global tokens, resets, base styles
    │   │   ├── layout.css             # Sidebar + grid layout
    │   │   ├── components.css         # Cards, badges, tables, modals
    │   │   ├── forms.css              # Inputs, selects, buttons
    │   │   ├── charts.css             # Chart container styling
    │   │   └── animations.css         # Keyframes + micro-interactions
    │   ├── utils/
    │   │   ├── formatters.js          # Date, currency, number formatters
    │   │   └── csvExport.js           # Client-side CSV generation
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Database Schema — Django Models

### `accounts/models.py` — Custom User with Roles

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        FLEET_MANAGER    = 'Fleet Manager',    'Fleet Manager'
        DRIVER           = 'Driver',           'Driver'
        SAFETY_OFFICER   = 'Safety Officer',   'Safety Officer'
        FINANCIAL_ANALYST = 'Financial Analyst', 'Financial Analyst'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.DRIVER)
    phone = models.CharField(max_length=20, blank=True)
    
    # email must be unique for login
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
```

### `fleet/models.py` — Vehicle & Driver

```python
from django.db import models
from django.core.validators import MinValueValidator

class Vehicle(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'Available'
        ON_TRIP   = 'On Trip'
        IN_SHOP   = 'In Shop'
        RETIRED   = 'Retired'

    class VehicleType(models.TextChoices):
        VAN    = 'Van'
        TRUCK  = 'Truck'
        SEMI   = 'Semi Trailer'
        PICKUP = 'Pickup'
        CAR    = 'Car'

    registration_number = models.CharField(max_length=20, unique=True, db_index=True)
    model_name          = models.CharField(max_length=100)
    vehicle_type        = models.CharField(max_length=20, choices=VehicleType.choices)
    max_load_capacity   = models.FloatField(validators=[MinValueValidator(0)])  # kg
    odometer            = models.FloatField(default=0.0)  # km
    acquisition_cost    = models.FloatField(validators=[MinValueValidator(0)])
    status              = models.CharField(max_length=15, choices=Status.choices, default=Status.AVAILABLE)
    region              = models.CharField(max_length=50)
    image_url           = models.URLField(blank=True, null=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.registration_number} — {self.model_name}"


class Driver(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'Available'
        ON_TRIP   = 'On Trip'
        OFF_DUTY  = 'Off Duty'
        SUSPENDED = 'Suspended'

    class LicenseCategory(models.TextChoices):
        CLASS_A = 'Class A', 'Class A — Heavy Vehicles'
        CLASS_B = 'Class B', 'Class B — Medium Vehicles'
        CLASS_C = 'Class C', 'Class C — Light Vehicles'
        CLASS_D = 'Class D', 'Class D — Passenger'

    name              = models.CharField(max_length=100)
    license_number    = models.CharField(max_length=30, unique=True, db_index=True)
    license_category  = models.CharField(max_length=10, choices=LicenseCategory.choices)
    license_expiry    = models.DateField()
    contact_number    = models.CharField(max_length=20)
    safety_score      = models.FloatField(default=100.0)  # 0-100 scale
    status            = models.CharField(max_length=15, choices=Status.choices, default=Status.AVAILABLE)
    avatar_url        = models.URLField(blank=True, null=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-safety_score']

    def __str__(self):
        return f"{self.name} ({self.license_number})"

    @property
    def is_license_expired(self):
        from django.utils import timezone
        return self.license_expiry < timezone.now().date()

    @property
    def is_eligible_for_trip(self):
        return (
            self.status == self.Status.AVAILABLE
            and not self.is_license_expired
        )
```

### `operations/models.py` — Trips, Maintenance, Fuel, Expenses

```python
import uuid
from django.db import models
from django.core.validators import MinValueValidator
from fleet.models import Vehicle, Driver

class Trip(models.Model):
    class Status(models.TextChoices):
        DRAFT      = 'Draft'
        DISPATCHED = 'Dispatched'
        COMPLETED  = 'Completed'
        CANCELLED  = 'Cancelled'

    trip_number      = models.CharField(max_length=20, unique=True, db_index=True, editable=False)
    source           = models.CharField(max_length=100)
    destination      = models.CharField(max_length=100)
    vehicle          = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name='trips')
    driver           = models.ForeignKey(Driver, on_delete=models.PROTECT, related_name='trips')
    cargo_weight     = models.FloatField(validators=[MinValueValidator(0)])  # kg
    planned_distance = models.FloatField(validators=[MinValueValidator(0)])  # km
    actual_distance  = models.FloatField(null=True, blank=True)
    fuel_consumed    = models.FloatField(null=True, blank=True)  # litres
    revenue          = models.FloatField(default=0.0)  # revenue earned from this trip
    status           = models.CharField(max_length=15, choices=Status.choices, default=Status.DRAFT)
    created_at       = models.DateTimeField(auto_now_add=True)
    dispatched_at    = models.DateTimeField(null=True, blank=True)
    completed_at     = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.trip_number:
            self.trip_number = f"TRP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class MaintenanceLog(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'Active'
        CLOSED = 'Closed'

    vehicle        = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_logs')
    description    = models.CharField(max_length=200)
    cost           = models.FloatField(default=0.0, validators=[MinValueValidator(0)])
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    status         = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-scheduled_date']


class FuelLog(models.Model):
    vehicle    = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='fuel_logs')
    trip       = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='fuel_logs')
    liters     = models.FloatField(validators=[MinValueValidator(0)])
    cost       = models.FloatField(validators=[MinValueValidator(0)])
    date       = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']


class Expense(models.Model):
    class ExpenseType(models.TextChoices):
        TOLL             = 'Toll'
        MAINTENANCE_COST = 'Maintenance Cost'
        FUEL             = 'Fuel'
        PERMIT           = 'Permit'
        OTHER            = 'Other'

    vehicle      = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='expenses')
    trip         = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    expense_type = models.CharField(max_length=20, choices=ExpenseType.choices)
    cost         = models.FloatField(validators=[MinValueValidator(0)])
    description  = models.TextField(blank=True)
    date         = models.DateField()
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
```

---

## Backend API — Full Endpoint Specification

### Authentication (`/api/auth/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register/` | Create user account with role | Public |
| `POST` | `/api/auth/login/` | Get JWT access + refresh tokens | Public |
| `POST` | `/api/auth/refresh/` | Refresh expired access token | Authenticated |
| `GET`  | `/api/auth/me/` | Get current user profile & role | Authenticated |

### Dashboard (`/api/dashboard/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/dashboard/kpis/` | All KPI metrics (counts, utilization %) | All roles |
| `GET`  | `/api/dashboard/kpis/?vehicle_type=Van&status=Available&region=North` | Filtered KPIs | All roles |
| `GET`  | `/api/dashboard/alerts/` | Expiring licenses, overdue maintenance | Fleet Manager, Safety Officer |

### Vehicles (`/api/vehicles/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`    | `/api/vehicles/` | List all (with search, filter, sort, pagination) | All roles |
| `POST`   | `/api/vehicles/` | Register new vehicle | Fleet Manager |
| `GET`    | `/api/vehicles/{id}/` | Vehicle detail + stats | All roles |
| `PUT`    | `/api/vehicles/{id}/` | Update vehicle info | Fleet Manager |
| `DELETE` | `/api/vehicles/{id}/` | Soft-delete / Retire vehicle | Fleet Manager |
| `GET`    | `/api/vehicles/available/` | Only `Available` vehicles (for trip dispatch forms) | All roles |

### Drivers (`/api/drivers/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`    | `/api/drivers/` | List all (with search, filter, sort, pagination) | All roles |
| `POST`   | `/api/drivers/` | Register new driver | Fleet Manager, Safety Officer |
| `GET`    | `/api/drivers/{id}/` | Driver detail + trip history | All roles |
| `PUT`    | `/api/drivers/{id}/` | Update driver profile / safety score | Fleet Manager, Safety Officer |
| `DELETE` | `/api/drivers/{id}/` | Remove driver | Fleet Manager |
| `GET`    | `/api/drivers/eligible/` | Only eligible drivers (Available + valid license) | All roles |

### Trips (`/api/trips/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`    | `/api/trips/` | List all trips (with status filter, pagination) | All roles |
| `POST`   | `/api/trips/` | Create a new trip (Draft) | Driver, Fleet Manager |
| `GET`    | `/api/trips/{id}/` | Trip detail | All roles |
| `POST`   | `/api/trips/{id}/dispatch/` | Dispatch a Draft trip | Driver, Fleet Manager |
| `POST`   | `/api/trips/{id}/complete/` | Complete a Dispatched trip | Driver, Fleet Manager |
| `POST`   | `/api/trips/{id}/cancel/` | Cancel a Draft or Dispatched trip | Driver, Fleet Manager |

### Maintenance (`/api/maintenance/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/maintenance/` | List all maintenance logs | All roles |
| `POST` | `/api/maintenance/` | Create maintenance record → vehicle becomes `In Shop` | Fleet Manager |
| `POST` | `/api/maintenance/{id}/close/` | Close maintenance → vehicle becomes `Available` | Fleet Manager |

### Fuel & Expenses (`/api/fuel-logs/`, `/api/expenses/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/fuel-logs/` | List fuel logs (filterable by vehicle, date range) | All roles |
| `POST` | `/api/fuel-logs/` | Record fuel entry | Driver, Fleet Manager |
| `GET`  | `/api/expenses/` | List all expenses | Financial Analyst, Fleet Manager |
| `POST` | `/api/expenses/` | Record an expense | Fleet Manager, Financial Analyst |
| `GET`  | `/api/expenses/summary/` | Total operational cost per vehicle | Financial Analyst, Fleet Manager |

### Reports & Analytics (`/api/reports/`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET`  | `/api/reports/fuel-efficiency/` | Fuel efficiency (Distance ÷ Fuel) per vehicle | All roles |
| `GET`  | `/api/reports/fleet-utilization/` | Utilization % over time | All roles |
| `GET`  | `/api/reports/operational-cost/` | Cost breakdown (fuel + maintenance + tolls) | Financial Analyst, Fleet Manager |
| `GET`  | `/api/reports/vehicle-roi/` | ROI = (Revenue − Costs) ÷ Acquisition Cost | Financial Analyst, Fleet Manager |
| `GET`  | `/api/reports/export/csv/?report=fuel-efficiency` | CSV download of any report | All roles |

---

## Business Rules — Atomic Transaction Logic

Every status transition is wrapped in `django.db.transaction.atomic()` to guarantee data integrity.

### Rule 1: Trip Creation Validation
```python
# operations/validators.py
from django.utils import timezone
from rest_framework.exceptions import ValidationError

def validate_trip_creation(vehicle, driver, cargo_weight):
    errors = []

    # Vehicle must be Available
    if vehicle.status != 'Available':
        errors.append(f"Vehicle {vehicle.registration_number} is '{vehicle.status}' — only 'Available' vehicles can be assigned.")

    # Vehicle must not be Retired or In Shop
    if vehicle.status in ('Retired', 'In Shop'):
        errors.append(f"Vehicle {vehicle.registration_number} is '{vehicle.status}' and cannot be dispatched.")

    # Driver must be Available
    if driver.status != 'Available':
        errors.append(f"Driver {driver.name} is '{driver.status}' — only 'Available' drivers can be assigned.")

    # Driver license must not be expired
    if driver.license_expiry < timezone.now().date():
        errors.append(f"Driver {driver.name}'s license expired on {driver.license_expiry}.")

    # Cargo weight must not exceed max load
    if cargo_weight > vehicle.max_load_capacity:
        errors.append(
            f"Cargo weight ({cargo_weight} kg) exceeds vehicle capacity ({vehicle.max_load_capacity} kg)."
        )

    if errors:
        raise ValidationError({"business_rules": errors})
```

### Rule 2: Dispatch Trip (Draft → Dispatched)
```python
from django.db import transaction

@transaction.atomic
def dispatch_trip(trip):
    if trip.status != 'Draft':
        raise ValidationError("Only Draft trips can be dispatched.")

    # Re-validate eligibility at dispatch time
    validate_trip_creation(trip.vehicle, trip.driver, trip.cargo_weight)

    trip.status = 'Dispatched'
    trip.dispatched_at = timezone.now()
    trip.save()

    trip.vehicle.status = 'On Trip'
    trip.vehicle.save()

    trip.driver.status = 'On Trip'
    trip.driver.save()
```

### Rule 3: Complete Trip (Dispatched → Completed)
```python
@transaction.atomic
def complete_trip(trip, actual_distance, fuel_consumed, fuel_cost, final_odometer, revenue=0):
    if trip.status != 'Dispatched':
        raise ValidationError("Only Dispatched trips can be completed.")

    trip.status = 'Completed'
    trip.completed_at = timezone.now()
    trip.actual_distance = actual_distance
    trip.fuel_consumed = fuel_consumed
    trip.revenue = revenue
    trip.save()

    # Update vehicle odometer
    trip.vehicle.odometer = final_odometer
    trip.vehicle.status = 'Available'
    trip.vehicle.save()

    # Restore driver
    trip.driver.status = 'Available'
    trip.driver.save()

    # Auto-create fuel log
    FuelLog.objects.create(
        vehicle=trip.vehicle, trip=trip,
        liters=fuel_consumed, cost=fuel_cost,
        date=timezone.now().date()
    )

    # Auto-create fuel expense
    Expense.objects.create(
        vehicle=trip.vehicle, trip=trip,
        expense_type='Fuel', cost=fuel_cost,
        date=timezone.now().date()
    )
```

### Rule 4: Cancel Trip (Draft/Dispatched → Cancelled)
```python
@transaction.atomic
def cancel_trip(trip):
    if trip.status not in ('Draft', 'Dispatched'):
        raise ValidationError("Only Draft or Dispatched trips can be cancelled.")

    was_dispatched = trip.status == 'Dispatched'
    trip.status = 'Cancelled'
    trip.save()

    if was_dispatched:
        trip.vehicle.status = 'Available'
        trip.vehicle.save()
        trip.driver.status = 'Available'
        trip.driver.save()
```

### Rule 5: Create Maintenance → Vehicle "In Shop"
```python
@transaction.atomic
def create_maintenance(vehicle, description, scheduled_date, cost=0):
    vehicle.status = 'In Shop'
    vehicle.save()

    return MaintenanceLog.objects.create(
        vehicle=vehicle, description=description,
        scheduled_date=scheduled_date, cost=cost, status='Active'
    )
```

### Rule 6: Close Maintenance → Vehicle "Available" (unless Retired)
```python
@transaction.atomic
def close_maintenance(log, cost, completed_date):
    log.status = 'Closed'
    log.cost = cost
    log.completed_date = completed_date
    log.save()

    # Create maintenance expense
    Expense.objects.create(
        vehicle=log.vehicle, expense_type='Maintenance Cost',
        cost=cost, date=completed_date,
        description=f"Maintenance: {log.description}"
    )

    # Restore vehicle only if not Retired
    if log.vehicle.status != 'Retired':
        log.vehicle.status = 'Available'
        log.vehicle.save()
```

---

## RBAC Permission Classes

```python
# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsFleetManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'Fleet Manager'

class IsDriverRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'Driver'

class IsSafetyOfficer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'Safety Officer'

class IsFinancialAnalyst(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'Financial Analyst'

class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in ('GET', 'HEAD', 'OPTIONS')
```

Views will combine these: e.g., Vehicle CRUD uses `IsFleetManager | ReadOnly` so all roles can view but only Fleet Managers can mutate.

---

## Seed Data Command

A management command `python manage.py seed_data` will populate the database with realistic demo data for hackathon judges:

| Entity | Count | Details |
|--------|-------|---------|
| Users | 4 | One per role, all with password `transit123` |
| Vehicles | 12 | Mix of Vans, Trucks, Pickups across 3 regions, varied statuses |
| Drivers | 10 | Mix of active, off-duty, one suspended, one with expired license |
| Trips | 15 | 3 Draft, 4 Dispatched, 6 Completed, 2 Cancelled — with realistic distances |
| Maintenance | 5 | 2 Active, 3 Closed — with cost data |
| Fuel Logs | 20 | Spread across vehicles over the past 30 days |
| Expenses | 25 | Toll, fuel, maintenance, permit entries |

**Demo Login Credentials** (shown on login page for judges):

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | `fleet@transitops.com` | `transit123` |
| Driver | `driver@transitops.com` | `transit123` |
| Safety Officer | `safety@transitops.com` | `transit123` |
| Financial Analyst | `finance@transitops.com` | `transit123` |

---

## Frontend — Premium UI Design System

### Design Philosophy
- **Dark-mode by default** with optional light toggle — judges love dark dashboards
- **Glassmorphism panels** with frosted-glass blur effects
- **Micro-animations** on every interaction (hover lifts, status badge pulses, counter roll-ups)
- **Google Font "Inter"** for clean, professional typography
- **Color-coded status system** consistent across all pages

### CSS Design Tokens (`index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Typography */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;

  /* Dark Theme (Default) */
  --bg-base:       #050a14;
  --bg-surface:    #0c1222;
  --bg-elevated:   #111b2e;
  --glass-bg:      rgba(255, 255, 255, 0.03);
  --glass-border:  rgba(255, 255, 255, 0.06);
  --glass-blur:    blur(20px);

  /* Text */
  --text-primary:   #f1f5f9;
  --text-secondary: #8892a4;
  --text-muted:     #4b5563;

  /* Accents — Vibrant, Harmonious Palette */
  --accent-blue:    #3b82f6;
  --accent-indigo:  #6366f1;
  --accent-cyan:    #06b6d4;
  --accent-emerald: #10b981;
  --accent-amber:   #f59e0b;
  --accent-rose:    #f43f5e;
  --accent-purple:  #a855f7;

  /* Gradients */
  --gradient-brand: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%);
  --gradient-glow:  linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.05));

  /* Status Colors */
  --status-available:  #10b981;
  --status-on-trip:    #3b82f6;
  --status-in-shop:    #f59e0b;
  --status-retired:    #6b7280;
  --status-suspended:  #f43f5e;
  --status-off-duty:   #8b5cf6;

  /* Shadows */
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:   0 4px 14px rgba(0,0,0,0.5);
  --shadow-lg:   0 10px 40px rgba(0,0,0,0.6);
  --shadow-glow: 0 0 30px rgba(59,130,246,0.15);

  /* Borders & Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Transitions */
  --transition-fast:   all 0.15s ease;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Glass Card Component Pattern
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: var(--transition-smooth);
}
.glass-card:hover {
  border-color: rgba(255,255,255,0.12);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}
```

### Page-by-Page UI Breakdown

#### 1. Login Page
- Full-screen dark gradient background with animated floating geometric shapes (CSS-only `@keyframes`)
- Centered glassmorphism login card with brand gradient header stripe
- Email + Password fields with animated floating labels
- **"Quick Access" panel** below the form — 4 role cards that auto-fill credentials on click (judge-friendly)
- Subtle particle/constellation animation in the background

#### 2. Dashboard
- **Top Bar**: User avatar, role badge, notification bell (shows license expiry alerts), dark/light toggle
- **KPI Row** (4–6 glass cards): Each card has an icon, animated counter (rolls up on load), percentage change indicator, and a subtle gradient accent bar on the left
  - Active Vehicles | Available Vehicles | In Maintenance | Active Trips | Drivers On Duty | Fleet Utilization %
- **Filter Strip**: Dropdowns for Vehicle Type, Status, Region — applying filters reactively re-fetches KPIs
- **Charts Grid** (2×2):
  - Fleet Utilization over time (Area Chart — gradient fill)
  - Operational Cost breakdown (Stacked Bar Chart)
  - Fuel Efficiency by Vehicle (Horizontal Bar)
  - Recent Trip Status (Donut/Pie)
- **Recent Activity Feed**: Timeline of latest dispatches, completions, maintenance events

#### 3. Vehicle Registry
- **Action Bar**: Search input + "Register Vehicle" button (gradient accent)
- **Data Table** with columns: Reg. No., Model, Type, Capacity, Odometer, Status (color badge), Region, Actions
- Status badges use color-coded pill chips matching `--status-*` variables
- Click row → opens **Vehicle Detail Drawer/Modal** with:
  - Vehicle info card
  - Trip history tab
  - Maintenance history tab
  - Expense summary tab
  - Total cost & ROI calculation

#### 4. Driver Management
- **Card Grid** layout (not just a table — more visual appeal):
  - Each driver card shows: Avatar placeholder, Name, License #, Category badge, Expiry (with red warning if < 30 days), Safety Score (circular progress ring), Status badge
  - Safety score ring: Green (≥85), Amber (70–84), Red (<70)
- Click card → Driver Detail page with trip history and compliance timeline

#### 5. Trip Planner (Dispatch Board)
- **Kanban-style columns**: Draft | Dispatched | Completed | Cancelled
- Each trip card shows: Trip #, Source → Destination, Vehicle reg, Driver name, Cargo weight, status badge
- **"New Trip" Modal**:
  - Source & Destination text inputs
  - Vehicle dropdown (only shows `Available` vehicles, fetched from `/api/vehicles/available/`)
  - Driver dropdown (only shows eligible drivers, fetched from `/api/drivers/eligible/`)
  - Cargo weight input with live validation against selected vehicle's capacity
  - Planned distance input
  - Real-time validation messages (capacity warning, eligibility status)
- **Trip Actions**: Dispatch button (with confirmation), Complete (opens form for odometer + fuel), Cancel (with confirmation)

#### 6. Maintenance Page
- **Split view**: Active Maintenance (left) | Maintenance History (right)
- "Log Maintenance" button opens modal → select vehicle, description, scheduled date
- Active cards show countdown/status, "Close" button opens cost + completion date form
- Visual indicator on associated vehicle showing wrench icon

#### 7. Fuel & Expenses
- **Tab layout**: Fuel Logs | Other Expenses | Summary
- Fuel Logs table: Vehicle, Liters, Cost, Date, Associated Trip
- Expenses table: Vehicle, Type (badge), Cost, Description, Date
- Summary tab: Per-vehicle total cost breakdown (Fuel + Maintenance + Tolls) in a stacked bar chart
- "Add Fuel Log" and "Add Expense" modals with appropriate fields

#### 8. Reports & Analytics
- **Report Selector**: Tabs or segmented control for Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI
- Each report renders as:
  - A headline stat card
  - A detailed chart visualization
  - A data table below with all values
  - **"Export CSV"** button in the top-right corner
- Vehicle ROI formula displayed: `ROI = (Revenue − (Maintenance + Fuel)) ÷ Acquisition Cost`

---

## Judge-Impressing Features

These features differentiate a winning submission:

| Feature | Impact |
|---------|--------|
| **One-click demo login** | Judges can instantly explore all 4 roles without typing credentials |
| **Animated KPI counters** | Dashboard feels alive and premium on first load |
| **Real-time validation** | Trip form prevents invalid dispatches before submission with inline warnings |
| **Atomic status transitions** | Business rules are enforced at the database level — impossible to corrupt state |
| **Kanban trip board** | Visual trip lifecycle management — immediately intuitive |
| **Safety score rings** | Circular progress indicators make driver compliance visually scannable |
| **Glassmorphism + dark mode** | Modern, premium aesthetic that stands out from generic Bootstrap dashboards |
| **CSV export** | Demonstrates data portability and real-world utility |
| **Seeded realistic data** | Platform looks lived-in and functional from the first moment |
| **In-app license alerts** | Proactive compliance notifications without requiring SMTP setup |
| **Responsive design** | Works on desktop and tablet — shows production readiness |

---

## 8-Hour Build Schedule

| Hour | Block | Tasks |
|------|-------|-------|
| **0–1** | Backend Setup | Init Django project, configure PostgreSQL, define all models, run migrations, create superuser, write seed command |
| **1–2** | Backend API Core | Auth (JWT), Vehicle CRUD, Driver CRUD with serializers + viewsets |
| **2–3** | Backend Business Logic | Trip lifecycle endpoints with atomic validators, Maintenance create/close, Fuel/Expense endpoints |
| **3–3.5** | Backend Analytics | Dashboard KPIs endpoint, Reports endpoints (fuel efficiency, ROI, cost breakdown), CSV export |
| **3.5–4** | Frontend Setup + Layout | Init Vite+React, CSS design system, Sidebar + Layout + Routing |
| **4–5** | Frontend Auth + Dashboard | Login page with quick-access panel, AuthContext, Dashboard with KPIs + charts |
| **5–6.5** | Frontend CRUD Pages | Vehicle Registry, Driver Management, Trip Planner (Kanban), Maintenance page |
| **6.5–7.5** | Frontend Fuel/Expenses + Reports | Expense tracking, Reports page with charts + CSV export |
| **7.5–8** | Polish & Demo Prep | Run full workflow test, fix edge cases, seed fresh data, verify all business rules, prepare demo script |

---

## Verification Plan

### Automated Tests
```bash
# Run Django test suite
cd backend
python manage.py test

# Key test cases:
# - test_unique_registration_number
# - test_retired_vehicle_not_in_available_list
# - test_expired_license_driver_rejected
# - test_overweight_cargo_rejected
# - test_dispatch_sets_on_trip_status
# - test_complete_restores_available
# - test_cancel_restores_available
# - test_maintenance_sets_in_shop
# - test_close_maintenance_restores_available
# - test_double_dispatch_prevented
```

### Manual Walkthrough
Execute the exact workflow from the hackathon spec:
1. ✅ Register vehicle `Van-05` (500 kg capacity) → status = `Available`
2. ✅ Register driver `Alex` (valid license) → status = `Available`
3. ✅ Create trip with 450 kg cargo → validation passes (450 ≤ 500)
4. ✅ Dispatch trip → Vehicle & Driver → `On Trip`
5. ✅ Attempt creating another trip with same vehicle → **rejected** (On Trip)
6. ✅ Complete trip (enter odometer + fuel) → both → `Available`, fuel log auto-created
7. ✅ Create maintenance (Oil Change) → Vehicle → `In Shop`, hidden from dispatch dropdown
8. ✅ Close maintenance → Vehicle → `Available`
9. ✅ Reports page shows updated operational cost and fuel efficiency
10. ✅ Try assigning a driver with expired license → **rejected** with clear error message
