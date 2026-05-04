from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Generic owner-or-read-only permission.

    - Safe methods (GET/HEAD/OPTIONS) are allowed for anyone.
    - For write methods, the request user must be the owner. The owner
      attribute may be named `seller`, `user`, `owner` or `creator` on
      the target object; we check these in order.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Try several common owner attribute names
        for attr in ('seller', 'user', 'owner', 'creator'):
            owner = getattr(obj, attr, None)
            if owner is not None:
                return owner == request.user

        # If no owner attr found, deny write access by default
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin-only write access, read allowed for everyone."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
