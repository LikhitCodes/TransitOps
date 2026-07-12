from rest_framework import serializers
from .models import Vehicle, Driver


# ===========================================================================
# Vehicle Serializers
# ===========================================================================

class VehicleListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the vehicle list endpoint.
    Omits heavy fields to keep list responses fast.
    """

    class Meta:
        model  = Vehicle
        fields = [
            'id',
            'registration_number',
            'model_name',
            'vehicle_type',
            'status',
            'region',
            'odometer',
            'max_load_capacity',
            'acquisition_cost',
            'updated_at',
        ]


class VehicleDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for the vehicle detail endpoint.
    Includes all fields plus a computed trip_count.
    """

    trip_count = serializers.SerializerMethodField(
        help_text='Total number of trips ever assigned to this vehicle',
    )

    class Meta:
        model  = Vehicle
        fields = [
            'id',
            'registration_number',
            'model_name',
            'vehicle_type',
            'max_load_capacity',
            'odometer',
            'acquisition_cost',
            'status',
            'region',
            'image_url',
            'trip_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'trip_count']

    def get_trip_count(self, obj) -> int:
        # Uses the related_name='trips' defined in operations.Trip FK
        return obj.trips.count() if hasattr(obj, 'trips') else 0


class VehicleWriteSerializer(serializers.ModelSerializer):
    """
    Write serializer for creating and updating vehicles.
    Separating from the read serializers keeps computed fields clean.
    """

    class Meta:
        model  = Vehicle
        fields = [
            'registration_number',
            'model_name',
            'vehicle_type',
            'max_load_capacity',
            'odometer',
            'acquisition_cost',
            'status',
            'region',
            'image_url',
        ]

    def validate_registration_number(self, value: str) -> str:
        """
        Enforce uniqueness on update as well (ModelSerializer only checks on create).
        The unique constraint on the DB handles this, but a friendly message is better UX.
        """
        qs = Vehicle.objects.filter(registration_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"Vehicle with registration number '{value}' already exists."
            )
        return value.upper()

    def validate_max_load_capacity(self, value: float) -> float:
        if value <= 0:
            raise serializers.ValidationError("Max load capacity must be greater than 0 kg.")
        return value

    def validate_acquisition_cost(self, value: float) -> float:
        if value <= 0:
            raise serializers.ValidationError("Acquisition cost must be greater than 0.")
        return value


# ===========================================================================
# Driver Serializers
# ===========================================================================

class DriverListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the driver list endpoint.
    """

    is_license_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Driver
        fields = [
            'id',
            'name',
            'license_number',
            'license_category',
            'license_expiry',
            'safety_score',
            'status',
            'is_license_expired',
            'updated_at',
        ]


class DriverDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for the driver detail endpoint.
    Includes computed eligibility properties from model @property decorators.
    """

    is_license_expired    = serializers.BooleanField(read_only=True)
    is_eligible_for_trip  = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Driver
        fields = [
            'id',
            'name',
            'license_number',
            'license_category',
            'license_expiry',
            'contact_number',
            'safety_score',
            'status',
            'avatar_url',
            'is_license_expired',
            'is_eligible_for_trip',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DriverWriteSerializer(serializers.ModelSerializer):
    """
    Write serializer for creating and updating driver profiles.
    """

    class Meta:
        model  = Driver
        fields = [
            'name',
            'license_number',
            'license_category',
            'license_expiry',
            'contact_number',
            'safety_score',
            'status',
            'avatar_url',
        ]

    def validate_license_number(self, value: str) -> str:
        qs = Driver.objects.filter(license_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"Driver with license number '{value}' already exists."
            )
        return value.upper()

    def validate_safety_score(self, value: float) -> float:
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Safety score must be between 0 and 100.")
        return value
