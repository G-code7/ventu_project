# backend/tours/permissions.py

from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir que solo los dueños de un objeto 
    (en este caso, el operador del paquete) puedan editarlo.
    """

    def has_object_permission(self, request, view, obj):
        # Permisos de lectura (GET, HEAD, OPTIONS) se permiten a cualquiera.
        if request.method in permissions.SAFE_METHODS:
            return True
        # Permisos de escritura solo se permiten al operador del paquete.
        return obj.operator == request.user