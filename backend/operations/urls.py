from django.urls import path
from operations import views

urlpatterns = [
    # ── Trips ──────────────────────────────────────
    path('trips/',                    views.trip_list_create,   name='trip-list-create'),
    path('trips/<int:pk>/',           views.trip_detail,        name='trip-detail'),
    path('trips/<int:pk>/dispatch/',  views.trip_dispatch,      name='trip-dispatch'),
    path('trips/<int:pk>/complete/',  views.trip_complete,      name='trip-complete'),
    path('trips/<int:pk>/cancel/',    views.trip_cancel,        name='trip-cancel'),

    # ── Maintenance ────────────────────────────────
    path('maintenance/',              views.maintenance_list_create, name='maintenance-list-create'),
    path('maintenance/<int:pk>/close/', views.maintenance_close,    name='maintenance-close'),

    # ── Fuel Logs ──────────────────────────────────
    path('fuel-logs/',                views.fuel_log_list_create,    name='fuel-log-list-create'),

    # ── Expenses ───────────────────────────────────
    path('expenses/',                 views.expense_list_create,     name='expense-list-create'),
    path('expenses/summary/',         views.expense_summary,         name='expense-summary'),
]
