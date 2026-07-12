import csv
from django.db.models import Sum, Q
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from fleet.models import Vehicle
from operations.models import Trip, Expense
from accounts.permissions import IsFinancialAnalyst

@api_view(['GET'])
@permission_classes([AllowAny]) # Changed to AllowAny temporarily for ease of testing if you reverted the RBAC, otherwise you can use [IsAuthenticated, IsFinancialAnalyst]
def dashboard_metrics(request):
    """
    GET /api/analytics/dashboard/
    Returns Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI, and top costliest vehicles.
    """
    # 1. Fuel Efficiency (Total Distance / Total Fuel)
    trips_agg = Trip.objects.filter(status='Completed').aggregate(
        total_dist=Sum('actual_distance'),
        total_fuel=Sum('fuel_consumed'),
        total_revenue=Sum('revenue')
    )
    total_dist = trips_agg['total_dist'] or 0
    total_fuel = trips_agg['total_fuel'] or 0
    total_revenue = trips_agg['total_revenue'] or 0
    
    fuel_efficiency = round(total_dist / total_fuel, 2) if total_fuel > 0 else 0

    # 2. Fleet Utilization
    total_vehicles = Vehicle.objects.exclude(status='Retired').count()
    on_trip_vehicles = Vehicle.objects.filter(status='On Trip').count()
    fleet_utilization = round((on_trip_vehicles / total_vehicles) * 100, 1) if total_vehicles > 0 else 0

    # 3. Operational Cost
    total_op_cost = Expense.objects.aggregate(total=Sum('cost'))['total'] or 0

    # 4. Global ROI
    total_acquisition = Vehicle.objects.exclude(status='Retired').aggregate(total=Sum('acquisition_cost'))['total'] or 0
    
    # Cost specifically for Maintenance + Fuel
    maint_fuel_cost = Expense.objects.filter(
        expense_type__in=['Fuel', 'Maintenance Cost']
    ).aggregate(total=Sum('cost'))['total'] or 0

    roi = round(((total_revenue - maint_fuel_cost) / total_acquisition) * 100, 1) if total_acquisition > 0 else 0

    # 5. Top Costliest Vehicles (by Total Expenses)
    vehicles = Vehicle.objects.exclude(status='Retired')
    vehicle_costs = []
    for v in vehicles:
        cost = Expense.objects.filter(vehicle=v).aggregate(t=Sum('cost'))['t'] or 0
        if cost > 0:
            vehicle_costs.append({
                'registration_number': v.registration_number,
                'cost': cost
            })
    
    # Sort descending and take top 5
    vehicle_costs = sorted(vehicle_costs, key=lambda x: x['cost'], reverse=True)[:5]

    return Response({
        'fuel_efficiency': f"{fuel_efficiency} km/l",
        'fleet_utilization': f"{fleet_utilization}%",
        'operational_cost': total_op_cost,
        'vehicle_roi': f"{roi}%",
        'top_costliest_vehicles': vehicle_costs
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def export_csv(request):
    """
    GET /api/analytics/export/csv/
    Exports vehicle performance and ROI metrics as CSV.
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="transitops_analytics.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Registration Number', 'Model', 'Status', 
        'Acquisition Cost', 'Total Revenue', 
        'Total Maintenance & Fuel Cost', 'Total Expenses', 'ROI (%)'
    ])

    vehicles = Vehicle.objects.exclude(status='Retired')
    for v in vehicles:
        # Revenue from completed trips
        rev = Trip.objects.filter(vehicle=v, status='Completed').aggregate(r=Sum('revenue'))['r'] or 0
        
        # Maint + Fuel cost
        m_f_cost = Expense.objects.filter(vehicle=v, expense_type__in=['Fuel', 'Maintenance Cost']).aggregate(c=Sum('cost'))['c'] or 0
        
        # Total overall expenses
        total_exp = Expense.objects.filter(vehicle=v).aggregate(c=Sum('cost'))['c'] or 0

        # ROI per vehicle
        roi = round(((rev - m_f_cost) / v.acquisition_cost) * 100, 2) if v.acquisition_cost > 0 else 0

        writer.writerow([
            v.registration_number,
            v.model_name,
            v.status,
            v.acquisition_cost,
            rev,
            m_f_cost,
            total_exp,
            f"{roi}%"
        ])

    return response
