from django.contrib import admin
from .models import Vehicle, Driver


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display   = (
        'registration_number', 'model_name', 'vehicle_type',
        'status', 'region', 'odometer', 'max_load_capacity', 'acquisition_cost',
    )
    list_filter    = ('status', 'vehicle_type', 'region')
    search_fields  = ('registration_number', 'model_name')
    ordering       = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Identity', {
            'fields': ('registration_number', 'model_name', 'vehicle_type', 'image_url'),
        }),
        ('Specifications', {
            'fields': ('max_load_capacity', 'odometer', 'acquisition_cost'),
        }),
        ('Operational', {
            'fields': ('status', 'region'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display   = (
        'name', 'license_number', 'license_category',
        'license_expiry', 'safety_score', 'status',
    )
    list_filter    = ('status', 'license_category')
    search_fields  = ('name', 'license_number', 'contact_number')
    ordering       = ('-safety_score',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Personal', {
            'fields': ('name', 'contact_number', 'avatar_url'),
        }),
        ('License', {
            'fields': ('license_number', 'license_category', 'license_expiry'),
        }),
        ('Status & Safety', {
            'fields': ('status', 'safety_score'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
