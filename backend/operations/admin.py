from django.contrib import admin
from operations.models import Trip, MaintenanceLog, FuelLog, Expense


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('trip_number', 'source', 'destination', 'vehicle', 'driver', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('trip_number', 'source', 'destination')
    readonly_fields = ('trip_number', 'created_at', 'dispatched_at', 'completed_at')


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'description', 'cost', 'status', 'scheduled_date', 'completed_date')
    list_filter = ('status',)
    search_fields = ('description', 'vehicle__registration_number')


@admin.register(FuelLog)
class FuelLogAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'trip', 'liters', 'cost', 'date')
    list_filter = ('date',)
    search_fields = ('vehicle__registration_number',)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'expense_type', 'cost', 'date', 'trip')
    list_filter = ('expense_type', 'date')
    search_fields = ('vehicle__registration_number', 'description')
