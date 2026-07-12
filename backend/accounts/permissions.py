from rest_framework.permissions import BasePermission, SAFE_METHODS


def _is_authenticated(request) -> bool:
    """Guard against AnonymousUser before checking role."""
    return bool(request.user and request.user.is_authenticated)


class IsFleetManager(BasePermission):
    """Grants access only to users with the Fleet Manager role."""

    def has_permission(self, request, view):
        return _is_authenticated(request) and request.user.role == 'Fleet Manager'


class IsDispatcher(BasePermission):
    """Grants access only to users with the Dispatcher role."""

    def has_permission(self, request, view):
        return _is_authenticated(request) and request.user.role == 'Dispatcher'


class IsSafetyOfficer(BasePermission):
    """Grants access only to users with the Safety Officer role."""

    def has_permission(self, request, view):
        return _is_authenticated(request) and request.user.role == 'Safety Officer'


class IsFinancialAnalyst(BasePermission):
    """Grants access only to users with the Financial Analyst role."""

    def has_permission(self, request, view):
        return _is_authenticated(request) and request.user.role == 'Financial Analyst'


class IsFleetManagerOrSafetyOfficer(BasePermission):
    """
    Combined permission: either Fleet Manager or Safety Officer.
    Used for driver create/update where both roles have write access.
    """

    def has_permission(self, request, view):
        if not _is_authenticated(request):
            return False
        return request.user.role in ('Fleet Manager', 'Safety Officer')


class ReadOnly(BasePermission):
    """
    Allows any authenticated user to perform safe (read) methods.
    Combine with a role permission to allow reads for all, writes for specific roles:
        permission_classes = [IsAuthenticated, IsFleetManager | ReadOnly]
    """

    def has_permission(self, request, view):
        return _is_authenticated(request) and request.method in SAFE_METHODS
