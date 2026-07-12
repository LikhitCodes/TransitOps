from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import (
    IsFleetManager,
    IsFleetManagerOrSafetyOfficer,
    ReadOnly,
)
from .models import Vehicle, Driver
from .serializers import (
    VehicleListSerializer,
    VehicleDetailSerializer,
    VehicleWriteSerializer,
    DriverListSerializer,
    DriverDetailSerializer,
    DriverWriteSerializer,
)


class VehicleViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for Vehicles plus a dispatch-form helper action.

    Permissions:
      - list, retrieve, available  → any authenticated role
      - create, update, destroy    → Fleet Manager only

    Filtering (via query params):
      ?search=<text>         searches registration_number and model_name
      ?status=Available      exact match on status
      ?vehicle_type=Van      exact match on vehicle_type
      ?region=North          exact match on region
      ?ordering=odometer     field ordering (prefix with - for desc)
    """

    queryset = Vehicle.objects.all()

    # ------------------------------------------------------------------
    # Serializer selection
    # ------------------------------------------------------------------
    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return VehicleWriteSerializer
        if self.action == 'retrieve':
            return VehicleDetailSerializer
        return VehicleListSerializer

    # ------------------------------------------------------------------
    # Permissions
    # ------------------------------------------------------------------
    def get_permissions(self):
        if self.action == 'available':
            return [IsAuthenticated()]
        return [IsFleetManager()]

    # ------------------------------------------------------------------
    # Filtering + search
    # ------------------------------------------------------------------
    def get_queryset(self):
        qs     = Vehicle.objects.all()
        params = self.request.query_params

        # Full-text search across registration_number and model_name
        search = params.get('search', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(registration_number__icontains=search) |
                Q(model_name__icontains=search)
            )

        # Exact-match filters
        for field in ('status', 'vehicle_type', 'region'):
            value = params.get(field, '').strip()
            if value:
                qs = qs.filter(**{field: value})

        # Ordering (whitelist to prevent arbitrary field injection)
        ALLOWED_ORDER = {
            'created_at', '-created_at',
            'odometer',   '-odometer',
            'acquisition_cost', '-acquisition_cost',
            'status',     '-status',
            'region',     '-region',
        }
        ordering = params.get('ordering', '-created_at').strip()
        if ordering not in ALLOWED_ORDER:
            ordering = '-created_at'
        qs = qs.order_by(ordering)

        return qs

    # ------------------------------------------------------------------
    # Soft-delete: retire instead of hard-delete
    # ------------------------------------------------------------------
    def destroy(self, request, *args, **kwargs):
        vehicle = self.get_object()
        if vehicle.status == Vehicle.Status.RETIRED:
            return Response(
                {'detail': 'Vehicle is already retired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        vehicle.status = Vehicle.Status.RETIRED
        vehicle.save(update_fields=['status', 'updated_at'])
        return Response(
            {'detail': f"Vehicle {vehicle.registration_number} has been retired."},
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # Custom action: /api/vehicles/available/
    # ------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        """
        GET /api/vehicles/available/
        Returns only vehicles with status='Available'.
        Used by the Trip Dispatch form so drivers can't accidentally pick
        an On-Trip or In-Shop vehicle.
        """
        qs         = Vehicle.objects.filter(status=Vehicle.Status.AVAILABLE)
        serializer = VehicleListSerializer(qs, many=True)
        return Response(serializer.data)


# ===========================================================================

class DriverViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for Drivers plus an eligibility helper action.

    Permissions:
      - list, retrieve, eligible  → any authenticated role
      - create, update            → Fleet Manager OR Safety Officer
      - destroy                   → Fleet Manager only

    Filtering (via query params):
      ?search=<text>              searches name and license_number
      ?status=Available           exact match on status
      ?license_category=Class+A   exact match
      ?ordering=safety_score      field ordering
    """

    queryset = Driver.objects.all()

    # ------------------------------------------------------------------
    # Serializer selection
    # ------------------------------------------------------------------
    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return DriverWriteSerializer
        if self.action == 'retrieve':
            return DriverDetailSerializer
        return DriverListSerializer

    # ------------------------------------------------------------------
    # Permissions
    # ------------------------------------------------------------------
    def get_permissions(self):
        if self.action == 'eligible':
            return [IsAuthenticated()]
        
        if self.action == 'destroy':
            return [IsSafetyOfficer()]
            
        return [IsFleetManagerOrSafetyOfficer()]

    # ------------------------------------------------------------------
    # Filtering + search
    # ------------------------------------------------------------------
    def get_queryset(self):
        qs     = Driver.objects.all()
        params = self.request.query_params

        search = params.get('search', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(license_number__icontains=search)
            )

        for field in ('status', 'license_category'):
            value = params.get(field, '').strip()
            if value:
                qs = qs.filter(**{field: value})

        ALLOWED_ORDER = {
            'safety_score',  '-safety_score',
            'name',          '-name',
            'license_expiry','-license_expiry',
            'created_at',    '-created_at',
            'status',        '-status',
        }
        ordering = params.get('ordering', '-safety_score').strip()
        if ordering not in ALLOWED_ORDER:
            ordering = '-safety_score'
        qs = qs.order_by(ordering)

        return qs

    # ------------------------------------------------------------------
    # Custom action: /api/drivers/eligible/
    # ------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='eligible')
    def eligible(self, request):
        """
        GET /api/drivers/eligible/
        Returns only drivers who are Available AND have a non-expired license.
        Used by the Trip Dispatch form to prevent invalid assignments.
        """
        today = timezone.now().date()
        qs = Driver.objects.filter(
            status=Driver.Status.AVAILABLE,
            license_expiry__gte=today,
        )
        serializer = DriverListSerializer(qs, many=True)
        return Response(serializer.data)
