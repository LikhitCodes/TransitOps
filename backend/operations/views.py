from django.db.models import Sum, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from fleet.models import Vehicle
from operations.models import Trip, MaintenanceLog, FuelLog, Expense
from operations.serializers import (
    TripListSerializer, TripCreateSerializer, TripCompleteSerializer,
    MaintenanceLogListSerializer, MaintenanceCreateSerializer, MaintenanceCloseSerializer,
    FuelLogListSerializer, FuelLogCreateSerializer,
    ExpenseListSerializer, ExpenseCreateSerializer,
    VehicleExpenseSummarySerializer,
)
from operations.validators import (
    dispatch_trip, complete_trip, cancel_trip,
    create_maintenance, close_maintenance,
)


# ═══════════════════════════════════════════════
#  TRIP VIEWS
# ═══════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def trip_list_create(request):
    """
    GET  /api/trips/          → List all trips (filterable by status)
    POST /api/trips/          → Create a new trip (Draft)
    """
    if request.method == 'GET':
        trips = Trip.objects.select_related('vehicle', 'driver').all()

        # Filter by status
        trip_status = request.query_params.get('status')
        if trip_status:
            trips = trips.filter(status=trip_status)

        # Search by trip_number, source, destination
        search = request.query_params.get('search')
        if search:
            trips = trips.filter(
                Q(trip_number__icontains=search) |
                Q(source__icontains=search) |
                Q(destination__icontains=search)
            )

        serializer = TripListSerializer(trips, many=True)
        return Response(serializer.data)

    # POST — Create trip
    serializer = TripCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    trip = serializer.save()  # status defaults to 'Draft'
    return Response(
        TripListSerializer(trip).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def trip_detail(request, pk):
    """
    GET /api/trips/{id}/      → Trip detail
    """
    try:
        trip = Trip.objects.select_related('vehicle', 'driver').get(pk=pk)
    except Trip.DoesNotExist:
        return Response(
            {"detail": "Trip not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TripListSerializer(trip)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def trip_dispatch(request, pk):
    """
    POST /api/trips/{id}/dispatch/    → Draft → Dispatched
    Sets vehicle & driver to 'On Trip'.
    """
    try:
        trip = Trip.objects.select_related('vehicle', 'driver').get(pk=pk)
    except Trip.DoesNotExist:
        return Response(
            {"detail": "Trip not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    dispatch_trip(trip)
    return Response(TripListSerializer(trip).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def trip_complete(request, pk):
    """
    POST /api/trips/{id}/complete/    → Dispatched → Completed
    Expects: actual_distance, fuel_consumed, fuel_cost, final_odometer, revenue (optional)
    Auto-creates FuelLog and Fuel Expense.
    """
    try:
        trip = Trip.objects.select_related('vehicle', 'driver').get(pk=pk)
    except Trip.DoesNotExist:
        return Response(
            {"detail": "Trip not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TripCompleteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    complete_trip(
        trip=trip,
        actual_distance=serializer.validated_data['actual_distance'],
        fuel_consumed=serializer.validated_data['fuel_consumed'],
        fuel_cost=serializer.validated_data['fuel_cost'],
        final_odometer=serializer.validated_data['final_odometer'],
        revenue=serializer.validated_data.get('revenue', 0),
    )

    # Refresh from DB after atomic transaction
    trip.refresh_from_db()
    return Response(TripListSerializer(trip).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def trip_cancel(request, pk):
    """
    POST /api/trips/{id}/cancel/      → Draft/Dispatched → Cancelled
    If was dispatched, restores vehicle & driver to 'Available'.
    """
    try:
        trip = Trip.objects.select_related('vehicle', 'driver').get(pk=pk)
    except Trip.DoesNotExist:
        return Response(
            {"detail": "Trip not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    cancel_trip(trip)
    trip.refresh_from_db()
    return Response(TripListSerializer(trip).data)


# ═══════════════════════════════════════════════
#  MAINTENANCE VIEWS
# ═══════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def maintenance_list_create(request):
    """
    GET  /api/maintenance/        → List all maintenance logs
    POST /api/maintenance/        → Create maintenance record → vehicle becomes 'In Shop'
    """
    if request.method == 'GET':
        logs = MaintenanceLog.objects.select_related('vehicle').all()

        # Filter by status (Active / Closed)
        log_status = request.query_params.get('status')
        if log_status:
            logs = logs.filter(status=log_status)

        # Filter by vehicle
        vehicle_id = request.query_params.get('vehicle')
        if vehicle_id:
            logs = logs.filter(vehicle_id=vehicle_id)

        # Search
        search = request.query_params.get('search')
        if search:
            logs = logs.filter(
                Q(description__icontains=search) |
                Q(vehicle__registration_number__icontains=search)
            )

        serializer = MaintenanceLogListSerializer(logs, many=True)
        return Response(serializer.data)

    # POST — Create maintenance
    serializer = MaintenanceCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    log = create_maintenance(
        vehicle=data['vehicle'],
        description=data['description'],
        scheduled_date=data['scheduled_date'],
        cost=data.get('cost', 0),
        notes=data.get('notes', ''),
    )

    return Response(
        MaintenanceLogListSerializer(log).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def maintenance_close(request, pk):
    """
    POST /api/maintenance/{id}/close/  → Close maintenance → vehicle becomes 'Available'
    Expects: cost, completed_date
    Auto-creates a 'Maintenance Cost' expense.
    """
    try:
        log = MaintenanceLog.objects.select_related('vehicle').get(pk=pk)
    except MaintenanceLog.DoesNotExist:
        return Response(
            {"detail": "Maintenance record not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if log.status == 'Closed':
        return Response(
            {"detail": "This maintenance record is already closed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = MaintenanceCloseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    close_maintenance(
        log=log,
        cost=serializer.validated_data['cost'],
        completed_date=serializer.validated_data['completed_date'],
    )

    log.refresh_from_db()
    return Response(MaintenanceLogListSerializer(log).data)


# ═══════════════════════════════════════════════
#  FUEL LOG VIEWS
# ═══════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def fuel_log_list_create(request):
    """
    GET  /api/fuel-logs/      → List fuel logs (filterable by vehicle, date range)
    POST /api/fuel-logs/      → Record a fuel entry
    """
    if request.method == 'GET':
        logs = FuelLog.objects.select_related('vehicle', 'trip').all()

        # Filter by vehicle
        vehicle_id = request.query_params.get('vehicle')
        if vehicle_id:
            logs = logs.filter(vehicle_id=vehicle_id)

        # Filter by date range
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            logs = logs.filter(date__gte=date_from)
        if date_to:
            logs = logs.filter(date__lte=date_to)

        serializer = FuelLogListSerializer(logs, many=True)
        return Response(serializer.data)

    # POST — Create fuel log
    serializer = FuelLogCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    fuel_log = serializer.save()
    return Response(
        FuelLogListSerializer(fuel_log).data,
        status=status.HTTP_201_CREATED
    )


# ═══════════════════════════════════════════════
#  EXPENSE VIEWS
# ═══════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def expense_list_create(request):
    """
    GET  /api/expenses/       → List all expenses (filterable by vehicle, type, date range)
    POST /api/expenses/       → Record an expense
    """
    if request.method == 'GET':
        expenses = Expense.objects.select_related('vehicle', 'trip').all()

        # Filter by vehicle
        vehicle_id = request.query_params.get('vehicle')
        if vehicle_id:
            expenses = expenses.filter(vehicle_id=vehicle_id)

        # Filter by expense type
        expense_type = request.query_params.get('expense_type')
        if expense_type:
            expenses = expenses.filter(expense_type=expense_type)

        # Filter by date range
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            expenses = expenses.filter(date__gte=date_from)
        if date_to:
            expenses = expenses.filter(date__lte=date_to)

        # Filter by trip
        trip_id = request.query_params.get('trip')
        if trip_id:
            expenses = expenses.filter(trip_id=trip_id)

        serializer = ExpenseListSerializer(expenses, many=True)
        return Response(serializer.data)

    # POST — Create expense
    serializer = ExpenseCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expense = serializer.save()
    return Response(
        ExpenseListSerializer(expense).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def expense_summary(request):
    """
    GET /api/expenses/summary/  → Total operational cost per vehicle
    Returns: fuel_cost + maintenance_cost + other_cost = total_cost for each vehicle.
    """
    vehicles = Vehicle.objects.all()

    # Optional: filter to a specific vehicle
    vehicle_id = request.query_params.get('vehicle')
    if vehicle_id:
        vehicles = vehicles.filter(id=vehicle_id)

    summary = []
    for vehicle in vehicles:
        expenses = Expense.objects.filter(vehicle=vehicle)

        fuel_cost = expenses.filter(
            expense_type='Fuel'
        ).aggregate(total=Sum('cost'))['total'] or 0

        maintenance_cost = expenses.filter(
            expense_type='Maintenance Cost'
        ).aggregate(total=Sum('cost'))['total'] or 0

        other_cost = expenses.filter(
            ~Q(expense_type__in=['Fuel', 'Maintenance Cost'])
        ).aggregate(total=Sum('cost'))['total'] or 0

        summary.append({
            'vehicle_id': vehicle.id,
            'vehicle_registration': vehicle.registration_number,
            'fuel_cost': fuel_cost,
            'maintenance_cost': maintenance_cost,
            'other_cost': other_cost,
            'total_cost': fuel_cost + maintenance_cost + other_cost,
        })

    serializer = VehicleExpenseSummarySerializer(summary, many=True)
    return Response(serializer.data)
