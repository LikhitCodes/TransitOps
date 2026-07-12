from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, DriverViewSet

router = DefaultRouter()
router.register('vehicles', VehicleViewSet, basename='vehicle')
router.register('drivers',  DriverViewSet,  basename='driver')

# The router auto-generates:
#   /api/vehicles/             GET, POST
#   /api/vehicles/{id}/        GET, PUT, PATCH, DELETE
#   /api/vehicles/available/   GET  (custom @action)
#   /api/drivers/              GET, POST
#   /api/drivers/{id}/         GET, PUT, PATCH, DELETE
#   /api/drivers/eligible/     GET  (custom @action)
urlpatterns = router.urls
