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
    max_load_capacity   = models.FloatField(validators=[MinValueValidator(0)])
    odometer            = models.FloatField(default=0.0, validators=[MinValueValidator(0)])
    acquisition_cost    = models.FloatField(validators=[MinValueValidator(0)])
    status              = models.CharField(max_length=15, choices=Status.choices, default=Status.AVAILABLE, db_index=True)
    region              = models.CharField(max_length=50, db_index=True)
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
    safety_score      = models.FloatField(default=100.0, validators=[MinValueValidator(0)])
    status            = models.CharField(max_length=15, choices=Status.choices, default=Status.AVAILABLE, db_index=True)
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
