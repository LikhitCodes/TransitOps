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

    def __str__(self):
        return f"{self.trip_number}: {self.source} → {self.destination}"


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

    def __str__(self):
        return f"Maintenance: {self.vehicle.registration_number} — {self.description}"


class FuelLog(models.Model):
    vehicle    = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='fuel_logs')
    trip       = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='fuel_logs')
    liters     = models.FloatField(validators=[MinValueValidator(0)])
    cost       = models.FloatField(validators=[MinValueValidator(0)])
    date       = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Fuel: {self.vehicle.registration_number} — {self.liters}L on {self.date}"


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

    def __str__(self):
        return f"{self.expense_type}: {self.vehicle.registration_number} — ₹{self.cost}"
