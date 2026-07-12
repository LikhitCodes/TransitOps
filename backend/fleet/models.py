from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class Vehicle(models.Model):
    """
    Represents a physical vehicle in the fleet.
    Status transitions are managed by the operations app (atomic helpers).
    The only status change in this app is via DELETE → Retired (soft-delete).
    """

    class Status(models.TextChoices):
        AVAILABLE = 'Available', 'Available'
        ON_TRIP   = 'On Trip',   'On Trip'
        IN_SHOP   = 'In Shop',   'In Shop'
        RETIRED   = 'Retired',   'Retired'

    class VehicleType(models.TextChoices):
        VAN    = 'Van',          'Van'
        TRUCK  = 'Truck',        'Truck'
        SEMI   = 'Semi Trailer', 'Semi Trailer'
        PICKUP = 'Pickup',       'Pickup'
        CAR    = 'Car',          'Car'

    registration_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Unique vehicle registration plate (e.g. MH-12-AB-1234)',
    )
    model_name          = models.CharField(max_length=100)
    vehicle_type        = models.CharField(max_length=20, choices=VehicleType.choices)
    max_load_capacity   = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text='Maximum cargo weight in kilograms',
    )
    odometer            = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0)],
        help_text='Current odometer reading in kilometres',
    )
    acquisition_cost    = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text='Purchase price in local currency',
    )
    status              = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True,
    )
    region              = models.CharField(
        max_length=50,
        db_index=True,
        help_text='Operational region (e.g. North, South, East)',
    )
    image_url           = models.URLField(blank=True, null=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.registration_number} — {self.model_name}"


class Driver(models.Model):
    """
    Represents a driver registered in the system.
    Status transitions happen in the operations app when trips are dispatched/completed/cancelled.
    """

    class Status(models.TextChoices):
        AVAILABLE = 'Available', 'Available'
        ON_TRIP   = 'On Trip',   'On Trip'
        OFF_DUTY  = 'Off Duty',  'Off Duty'
        SUSPENDED = 'Suspended', 'Suspended'

    class LicenseCategory(models.TextChoices):
        CLASS_A = 'Class A', 'Class A — Heavy Vehicles'
        CLASS_B = 'Class B', 'Class B — Medium Vehicles'
        CLASS_C = 'Class C', 'Class C — Light Vehicles'
        CLASS_D = 'Class D', 'Class D — Passenger'

    name             = models.CharField(max_length=100)
    license_number   = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text='Unique driving license number',
    )
    license_category = models.CharField(max_length=10, choices=LicenseCategory.choices)
    license_expiry   = models.DateField(
        help_text='Date on which the driving license expires',
    )
    contact_number   = models.CharField(max_length=20)
    safety_score     = models.FloatField(
        default=100.0,
        validators=[MinValueValidator(0)],
        help_text='Safety score on a 0–100 scale. Updated by Safety Officers.',
    )
    status           = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True,
    )
    avatar_url       = models.URLField(blank=True, null=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-safety_score', 'name']

    def __str__(self) -> str:
        return f"{self.name} ({self.license_number})"

    # ------------------------------------------------------------------
    # Computed properties used by serializers and validators
    # ------------------------------------------------------------------

    @property
    def is_license_expired(self) -> bool:
        """True if the license expiry date is in the past."""
        return self.license_expiry < timezone.now().date()

    @property
    def is_eligible_for_trip(self) -> bool:
        """
        A driver is eligible for dispatch only when:
        - Status is Available
        - License has not expired
        """
        return (
            self.status == self.Status.AVAILABLE
            and not self.is_license_expired
        )
