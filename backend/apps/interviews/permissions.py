from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"

class IsCandidate(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "CANDIDATE"

class IsNotViewer(BasePermission):
    """Blocks write access for VIEWER role."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in ("POST", "PATCH", "PUT", "DELETE"):
            return request.user.role != "VIEWER"
        return True
