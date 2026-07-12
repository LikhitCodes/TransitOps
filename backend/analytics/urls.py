from django.urls import path
from analytics import views

urlpatterns = [
    path('dashboard/', views.dashboard_metrics, name='analytics-dashboard'),
    path('kpis/', views.kpi_overview, name='analytics-kpis'),
    path('export/csv/', views.export_csv, name='analytics-export-csv'),
]
