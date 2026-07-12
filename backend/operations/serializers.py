from rest_framework import serializers
from fleet.models import Vehicle, Driver
from operations.models import Trip, MaintenanceLog, FuelLog, Expense


# ─────────────────────────────────────────────
#  TRIP SERIALIZERS
# ─────────────────────────────────────────────

class TripListSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing trips with nested vehicle/driver info."""
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)
    vehicle_capacity     = serializers.FloatField(source='vehicle.max_load_capacity', read_only=True)
    driver_name          = serializers.CharField(source='driver.name', read_only=True)

    class Meta:
        model  = Trip
        fields = [
            'id', 'trip_number', 'source', 'destination',
            'vehicle', 'vehicle_registration', 'vehicle_capacity',
            'driver', 'driver_name',
            'cargo_weight', 'planned_distance', 'actual_distance',
            'fuel_consumed', 'revenue', 'status',
            'created_at', 'dispatched_at', 'completed_at',
        ]
        read_only_fields = [
            'id', 'trip_number', 'status',
            'created_at', 'dispatched_at', 'completed_at',
        ]


class TripCreateSerializer(serializers.ModelSerializer):
    """Write serializer for creating a new trip (Draft)."""

    class Meta:
        model  = Trip
        fields = [
            'source', 'destination', 'vehicle', 'driver',
            'cargo_weight', 'planned_distance',
        ]

    def validate(self, attrs):
        """Run business rule validation on creation."""
        from operations.validators import validate_trip_creation
        validate_trip_creation(
            vehicle=attrs['vehicle'],
            driver=attrs['driver'],
            cargo_weight=attrs['cargo_weight'],
        )
        return attrs


class TripCompleteSerializer(serializers.Serializer):
    """Serializer for the complete-trip action payload."""
    actual_distance = serializers.FloatField(min_value=0)
    fuel_consumed   = serializers.FloatField(min_value=0)
    fuel_cost       = serializers.FloatField(min_value=0)
    final_odometer  = serializers.FloatField(min_value=0)
    revenue         = serializers.FloatField(min_value=0, required=False, default=0)


# ─────────────────────────────────────────────
#  MAINTENANCE SERIALIZERS
# ─────────────────────────────────────────────

class MaintenanceLogListSerializer(serializers.ModelSerializer):
    """Read serializer with vehicle registration embedded."""
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model  = MaintenanceLog
        fields = [
            'id', 'vehicle', 'vehicle_registration',
            'description', 'cost', 'scheduled_date', 'completed_date',
            'status', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'completed_date', 'created_at']


class MaintenanceCreateSerializer(serializers.Serializer):
    """Write serializer for creating a maintenance record."""
    vehicle        = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())
    description    = serializers.CharField(max_length=200)
    cost           = serializers.FloatField(min_value=0, required=False, default=0)
    scheduled_date = serializers.DateField()
    notes          = serializers.CharField(required=False, default='', allow_blank=True)


class MaintenanceCloseSerializer(serializers.Serializer):
    """Serializer for closing a maintenance record."""
    cost           = serializers.FloatField(min_value=0)
    completed_date = serializers.DateField()


# ─────────────────────────────────────────────
#  FUEL LOG SERIALIZERS
# ─────────────────────────────────────────────

class FuelLogListSerializer(serializers.ModelSerializer):
    """Read serializer with vehicle registration and optional trip number."""
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)
    trip_number          = serializers.CharField(source='trip.trip_number', read_only=True, default=None)

    class Meta:
        model  = FuelLog
        fields = [
            'id', 'vehicle', 'vehicle_registration',
            'trip', 'trip_number',
            'liters', 'cost', 'date', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class FuelLogCreateSerializer(serializers.ModelSerializer):
    """Write serializer for recording a fuel log."""

    class Meta:
        model  = FuelLog
        fields = ['vehicle', 'trip', 'liters', 'cost', 'date']


# ─────────────────────────────────────────────
#  EXPENSE SERIALIZERS
# ─────────────────────────────────────────────

class ExpenseListSerializer(serializers.ModelSerializer):
    """Read serializer with vehicle and trip info embedded."""
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)
    trip_number          = serializers.CharField(source='trip.trip_number', read_only=True, default=None)

    class Meta:
        model  = Expense
        fields = [
            'id', 'vehicle', 'vehicle_registration',
            'trip', 'trip_number',
            'expense_type', 'cost', 'description', 'date', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Write serializer for recording an expense."""

    class Meta:
        model  = Expense
        fields = ['vehicle', 'trip', 'expense_type', 'cost', 'description', 'date']


# ─────────────────────────────────────────────
#  EXPENSE SUMMARY SERIALIZER (computed)
# ─────────────────────────────────────────────

class VehicleExpenseSummarySerializer(serializers.Serializer):
    """Per-vehicle total operational cost breakdown."""
    vehicle_id           = serializers.IntegerField()
    vehicle_registration = serializers.CharField()
    fuel_cost            = serializers.FloatField()
    maintenance_cost     = serializers.FloatField()
    other_cost           = serializers.FloatField()
    total_cost           = serializers.FloatField()
