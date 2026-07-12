from django.utils import timezone
from django.db import transaction
from rest_framework.exceptions import ValidationError


def validate_trip_creation(vehicle, driver, cargo_weight):
    """
    Business Rule 1: Validate that a trip can be created/dispatched.
    - Vehicle must be Available
    - Driver must be Available with a valid (non-expired) license
    - Cargo weight must not exceed vehicle capacity
    """
    errors = []

    # Vehicle must be Available
    if vehicle.status != 'Available':
        errors.append(
            f"Vehicle {vehicle.registration_number} is '{vehicle.status}' "
            f"— only 'Available' vehicles can be assigned."
        )

    # Vehicle must not be Retired or In Shop
    if vehicle.status in ('Retired', 'In Shop'):
        errors.append(
            f"Vehicle {vehicle.registration_number} is '{vehicle.status}' "
            f"and cannot be dispatched."
        )

    # Driver must be Available
    if driver.status != 'Available':
        errors.append(
            f"Driver {driver.name} is '{driver.status}' "
            f"— only 'Available' drivers can be assigned."
        )

    # Driver license must not be expired
    if driver.license_expiry < timezone.now().date():
        errors.append(
            f"Driver {driver.name}'s license expired on {driver.license_expiry}."
        )

    # Cargo weight must not exceed max load
    if cargo_weight > vehicle.max_load_capacity:
        errors.append(
            f"Cargo weight ({cargo_weight} kg) exceeds vehicle capacity "
            f"({vehicle.max_load_capacity} kg)."
        )

    if errors:
        raise ValidationError({"business_rules": errors})


@transaction.atomic
def dispatch_trip(trip):
    """
    Business Rule 2: Draft → Dispatched.
    Re-validates eligibility, sets vehicle & driver to 'On Trip'.
    """
    if trip.status != 'Draft':
        raise ValidationError({"detail": "Only Draft trips can be dispatched."})

    # Re-validate at dispatch time (state may have changed since creation)
    validate_trip_creation(trip.vehicle, trip.driver, trip.cargo_weight)

    trip.status = 'Dispatched'
    trip.dispatched_at = timezone.now()
    trip.save()

    trip.vehicle.status = 'On Trip'
    trip.vehicle.save()

    trip.driver.status = 'On Trip'
    trip.driver.save()


@transaction.atomic
def complete_trip(trip, actual_distance, fuel_consumed, fuel_cost, final_odometer, revenue=0):
    """
    Business Rule 3: Dispatched → Completed.
    Updates odometer, restores vehicle/driver, auto-creates FuelLog & Expense.
    """
    from operations.models import FuelLog, Expense

    if trip.status != 'Dispatched':
        raise ValidationError({"detail": "Only Dispatched trips can be completed."})

    trip.status = 'Completed'
    trip.completed_at = timezone.now()
    trip.actual_distance = actual_distance
    trip.fuel_consumed = fuel_consumed
    trip.revenue = revenue
    trip.save()

    # Update vehicle odometer and restore status
    trip.vehicle.odometer = final_odometer
    trip.vehicle.status = 'Available'
    trip.vehicle.save()

    # Restore driver status
    trip.driver.status = 'Available'
    trip.driver.save()

    # Auto-create fuel log
    FuelLog.objects.create(
        vehicle=trip.vehicle,
        trip=trip,
        liters=fuel_consumed,
        cost=fuel_cost,
        date=timezone.now().date()
    )

    # Auto-create fuel expense
    Expense.objects.create(
        vehicle=trip.vehicle,
        trip=trip,
        expense_type='Fuel',
        cost=fuel_cost,
        date=timezone.now().date(),
        description=f"Fuel for trip {trip.trip_number}"
    )


@transaction.atomic
def cancel_trip(trip):
    """
    Business Rule 4: Draft/Dispatched → Cancelled.
    If trip was dispatched, restores vehicle & driver to 'Available'.
    """
    if trip.status not in ('Draft', 'Dispatched'):
        raise ValidationError({"detail": "Only Draft or Dispatched trips can be cancelled."})

    was_dispatched = trip.status == 'Dispatched'
    trip.status = 'Cancelled'
    trip.save()

    if was_dispatched:
        trip.vehicle.status = 'Available'
        trip.vehicle.save()
        trip.driver.status = 'Available'
        trip.driver.save()


@transaction.atomic
def create_maintenance(vehicle, description, scheduled_date, cost=0, notes=''):
    """
    Business Rule 5: Creating maintenance → Vehicle status becomes 'In Shop'.
    Vehicle is removed from dispatch selection pool.
    """
    from operations.models import MaintenanceLog

    vehicle.status = 'In Shop'
    vehicle.save()

    return MaintenanceLog.objects.create(
        vehicle=vehicle,
        description=description,
        scheduled_date=scheduled_date,
        cost=cost,
        status='Active',
        notes=notes
    )


@transaction.atomic
def close_maintenance(log, cost, completed_date):
    """
    Business Rule 6: Closing maintenance → Vehicle status becomes 'Available'
    (unless vehicle is Retired). Auto-creates a Maintenance Cost expense.
    """
    from operations.models import Expense

    log.status = 'Closed'
    log.cost = cost
    log.completed_date = completed_date
    log.save()

    # Create maintenance expense
    Expense.objects.create(
        vehicle=log.vehicle,
        expense_type='Maintenance Cost',
        cost=cost,
        date=completed_date,
        description=f"Maintenance: {log.description}"
    )

    # Restore vehicle only if not Retired
    if log.vehicle.status != 'Retired':
        log.vehicle.status = 'Available'
        log.vehicle.save()
