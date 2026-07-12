from rest_framework.permissions import BasePermission

class IsFleetManager(BasePermission):
    """Allow access only to Fleet Manager role."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', '') == 'Fleet Manager'
        )

class IsDispatcher(BasePermission):
    """Allow access only to Dispatcher role."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', '') == 'Dispatcher'
        )

class IsSafetyOfficer(BasePermission):
    """Allow access only to Safety Officer role."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', '') == 'Safety Officer'
        )

class IsFinancialAnalyst(BasePermission):
    """Allow access only to Financial Analyst role."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', '') == 'Financial Analyst'
        )

class ReadOnly(BasePermission):
    """Allow read-only access (GET, HEAD, OPTIONS)."""
    def has_permission(self, request, view):
        return request.method in ('GET', 'HEAD', 'OPTIONS')
