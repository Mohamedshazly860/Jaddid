from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin users have full access.
    Other users have read-only access by default (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        return request.user.is_staff or request.user.is_superuser or request.method in permissions.SAFE_METHODS


class IsBuyer(permissions.BasePermission):
    """
    Allows access only to the buyer of the order.
    Works on object-level permissions (e.g., cancel, buyer_update).
    """
    def has_object_permission(self, request, view, obj):
        return obj.buyer == request.user


class IsSeller(permissions.BasePermission):
    """
    Allows access only to the seller of the order.
    Works on object-level permissions (e.g., update_status).
    """
    def has_object_permission(self, request, view, obj):
        return obj.seller == request.user
