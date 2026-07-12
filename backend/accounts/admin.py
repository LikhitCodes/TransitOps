from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin panel for CustomUser with role + phone fields."""

    list_display   = ('email', 'username', 'role', 'phone', 'is_staff', 'is_active', 'date_joined')
    list_filter    = ('role', 'is_staff', 'is_active')
    search_fields  = ('email', 'username', 'phone')
    ordering       = ('-date_joined',)

    fieldsets = UserAdmin.fieldsets + (
        ('TransitOps Profile', {'fields': ('role', 'phone')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('TransitOps Profile', {'fields': ('role', 'phone', 'email')}),
    )
