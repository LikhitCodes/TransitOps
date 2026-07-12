"""
Management command: python manage.py seed_data

Seeds ALL demo data in one shot (idempotent — safe to run multiple times):
  - 4 users (one per role)
  - 12 vehicles across 3 regions
  - 10 drivers with varied statuses
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta

User = get_user_model()


# ---------------------------------------------------------------------------
# Demo users
# ---------------------------------------------------------------------------
USERS = [
    {
        'email':    'fleet@transitops.com',
        'username': 'fleet_manager',
        'password': 'transit123',
        'role':     'Fleet Manager',
        'phone':    '+1-555-0101',
    },
    {
        'email':    'driver@transitops.com',
        'username': 'driver_demo',
        'password': 'transit123',
        'role':     'Driver',
        'phone':    '+1-555-0102',
    },
    {
        'email':    'safety@transitops.com',
        'username': 'safety_officer',
        'password': 'transit123',
        'role':     'Safety Officer',
        'phone':    '+1-555-0103',
    },
    {
        'email':    'finance@transitops.com',
        'username': 'finance_analyst',
        'password': 'transit123',
        'role':     'Financial Analyst',
        'phone':    '+1-555-0104',
    },
]

# ---------------------------------------------------------------------------
# Demo vehicles (12 total, spread across regions and statuses)
# ---------------------------------------------------------------------------
VEHICLES = [
    # Vans — North
    {
        'registration_number': 'MH-12-VAN-001',
        'model_name':          'Ford Transit 2022',
        'vehicle_type':        'Van',
        'max_load_capacity':   800.0,
        'odometer':            15430.5,
        'acquisition_cost':    45000.0,
        'status':              'Available',
        'region':              'North',
    },
    {
        'registration_number': 'MH-12-VAN-002',
        'model_name':          'Mercedes Sprinter 2021',
        'vehicle_type':        'Van',
        'max_load_capacity':   900.0,
        'odometer':            28750.0,
        'acquisition_cost':    52000.0,
        'status':              'Available',
        'region':              'North',
    },
    {
        'registration_number': 'MH-12-VAN-003',
        'model_name':          'Volkswagen Crafter 2023',
        'vehicle_type':        'Van',
        'max_load_capacity':   850.0,
        'odometer':            5200.0,
        'acquisition_cost':    48000.0,
        'status':              'On Trip',
        'region':              'South',
    },
    {
        'registration_number': 'MH-12-VAN-004',
        'model_name':          'Renault Master 2020',
        'vehicle_type':        'Van',
        'max_load_capacity':   700.0,
        'odometer':            42100.0,
        'acquisition_cost':    38000.0,
        'status':              'In Shop',
        'region':              'East',
    },
    # Trucks — South
    {
        'registration_number': 'MH-14-TRK-001',
        'model_name':          'Tata Prima 4028.S',
        'vehicle_type':        'Truck',
        'max_load_capacity':   25000.0,
        'odometer':            88000.0,
        'acquisition_cost':    120000.0,
        'status':              'Available',
        'region':              'South',
    },
    {
        'registration_number': 'MH-14-TRK-002',
        'model_name':          'Ashok Leyland 2518 IL',
        'vehicle_type':        'Truck',
        'max_load_capacity':   18000.0,
        'odometer':            62400.0,
        'acquisition_cost':    95000.0,
        'status':              'Available',
        'region':              'South',
    },
    {
        'registration_number': 'MH-14-TRK-003',
        'model_name':          'Mahindra Blazo X 35',
        'vehicle_type':        'Truck',
        'max_load_capacity':   20000.0,
        'odometer':            145000.0,
        'acquisition_cost':    110000.0,
        'status':              'Retired',
        'region':              'North',
    },
    # Semi Trailers — East
    {
        'registration_number': 'MH-16-SMT-001',
        'model_name':          'Volvo FH16 Globetrotter',
        'vehicle_type':        'Semi Trailer',
        'max_load_capacity':   40000.0,
        'odometer':            210000.0,
        'acquisition_cost':    280000.0,
        'status':              'Available',
        'region':              'East',
    },
    {
        'registration_number': 'MH-16-SMT-002',
        'model_name':          'Scania R 500',
        'vehicle_type':        'Semi Trailer',
        'max_load_capacity':   38000.0,
        'odometer':            175000.0,
        'acquisition_cost':    260000.0,
        'status':              'Available',
        'region':              'East',
    },
    # Pickups — North / South
    {
        'registration_number': 'MH-12-PKP-001',
        'model_name':          'Toyota Hilux 2022',
        'vehicle_type':        'Pickup',
        'max_load_capacity':   1200.0,
        'odometer':            34600.0,
        'acquisition_cost':    42000.0,
        'status':              'Available',
        'region':              'North',
    },
    {
        'registration_number': 'MH-12-PKP-002',
        'model_name':          'Ford Ranger 2021',
        'vehicle_type':        'Pickup',
        'max_load_capacity':   1000.0,
        'odometer':            21300.0,
        'acquisition_cost':    39000.0,
        'status':              'On Trip',
        'region':              'South',
    },
    # Car — East
    {
        'registration_number': 'MH-12-CAR-001',
        'model_name':          'Toyota Innova Crysta 2023',
        'vehicle_type':        'Car',
        'max_load_capacity':   500.0,
        'odometer':            9800.0,
        'acquisition_cost':    25000.0,
        'status':              'Available',
        'region':              'East',
    },
]

# ---------------------------------------------------------------------------
# Demo drivers (10 total)
# ---------------------------------------------------------------------------
TODAY = date.today()

DRIVERS = [
    # 6 Available drivers
    {
        'name':             'Alex Johnson',
        'license_number':   'DL-MH-001-2019',
        'license_category': 'Class A',
        'license_expiry':   TODAY + timedelta(days=365),
        'contact_number':   '+1-555-1001',
        'safety_score':     97.5,
        'status':           'Available',
    },
    {
        'name':             'Maria Garcia',
        'license_number':   'DL-MH-002-2020',
        'license_category': 'Class B',
        'license_expiry':   TODAY + timedelta(days=540),
        'contact_number':   '+1-555-1002',
        'safety_score':     93.0,
        'status':           'Available',
    },
    {
        'name':             'Ravi Sharma',
        'license_number':   'DL-MH-003-2018',
        'license_category': 'Class A',
        'license_expiry':   TODAY + timedelta(days=200),
        'contact_number':   '+1-555-1003',
        'safety_score':     88.5,
        'status':           'Available',
    },
    {
        'name':             'Priya Nair',
        'license_number':   'DL-MH-004-2021',
        'license_category': 'Class C',
        'license_expiry':   TODAY + timedelta(days=730),
        'contact_number':   '+1-555-1004',
        'safety_score':     91.0,
        'status':           'Available',
    },
    {
        'name':             'Daniel Kim',
        'license_number':   'DL-MH-005-2022',
        'license_category': 'Class B',
        'license_expiry':   TODAY + timedelta(days=410),
        'contact_number':   '+1-555-1005',
        'safety_score':     85.0,
        'status':           'Available',
    },
    {
        'name':             'Fatima Al-Hassan',
        'license_number':   'DL-MH-006-2020',
        'license_category': 'Class D',
        'license_expiry':   TODAY + timedelta(days=180),
        'contact_number':   '+1-555-1006',
        'safety_score':     79.5,
        'status':           'Available',
    },
    # 1 On Trip
    {
        'name':             'Carlos Rivera',
        'license_number':   'DL-MH-007-2019',
        'license_category': 'Class A',
        'license_expiry':   TODAY + timedelta(days=290),
        'contact_number':   '+1-555-1007',
        'safety_score':     90.0,
        'status':           'On Trip',
    },
    # 1 Off Duty
    {
        'name':             'Sophie Laurent',
        'license_number':   'DL-MH-008-2021',
        'license_category': 'Class C',
        'license_expiry':   TODAY + timedelta(days=600),
        'contact_number':   '+1-555-1008',
        'safety_score':     82.0,
        'status':           'Off Duty',
    },
    # 1 Suspended — safety score reflects the incident
    {
        'name':             'Tom Bradley',
        'license_number':   'DL-MH-009-2018',
        'license_category': 'Class B',
        'license_expiry':   TODAY + timedelta(days=120),
        'contact_number':   '+1-555-1009',
        'safety_score':     42.0,
        'status':           'Suspended',
    },
    # 1 with expired license — demonstrates validation rejection in trip form
    {
        'name':             'Nina Patel',
        'license_number':   'DL-MH-010-2015',
        'license_category': 'Class C',
        'license_expiry':   TODAY - timedelta(days=45),   # EXPIRED
        'contact_number':   '+1-555-1010',
        'safety_score':     76.0,
        'status':           'Available',                   # Available but ineligible
    },
]


class Command(BaseCommand):
    help = 'Seeds demo data: 4 users, 12 vehicles, 10 drivers. Idempotent.'

    def handle(self, *args, **options):
        self._seed_users()
        self._seed_vehicles()
        self._seed_drivers()
        self.stdout.write(self.style.SUCCESS('\nSeed data complete! All entities created/verified.'))

    # ------------------------------------------------------------------
    def _seed_users(self):
        self.stdout.write('[users] Seeding...')
        for data in USERS:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['username'],
                    'role':     data['role'],
                    'phone':    data['phone'],
                },
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(f"  [+] Created: {data['email']} ({data['role']})")
            else:
                self.stdout.write(f"  [=] Exists:  {data['email']} ({data['role']})")

    # ------------------------------------------------------------------
    def _seed_vehicles(self):
        from fleet.models import Vehicle
        self.stdout.write('[vehicles] Seeding...')
        for data in VEHICLES:
            _, created = Vehicle.objects.get_or_create(
                registration_number=data['registration_number'],
                defaults={k: v for k, v in data.items() if k != 'registration_number'},
            )
            tag    = '[+]' if created else '[=]'
            action = 'Created' if created else 'Exists '
            self.stdout.write(f"  {tag} {action}: {data['registration_number']} - {data['model_name']}")

    # ------------------------------------------------------------------
    def _seed_drivers(self):
        from fleet.models import Driver
        self.stdout.write('[drivers] Seeding...')
        for data in DRIVERS:
            _, created = Driver.objects.get_or_create(
                license_number=data['license_number'],
                defaults={k: v for k, v in data.items() if k != 'license_number'},
            )
            tag    = '[+]' if created else '[=]'
            action = 'Created' if created else 'Exists '
            self.stdout.write(f"  {tag} {action}: {data['name']} - {data['status']}")
