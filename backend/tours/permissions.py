from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir que solo los dueños de un objeto 
    (en este caso, el operador del paquete) puedan editarlo.
    Los demás solo pueden ver.
    """

    def has_object_permission(self, request, view, obj):
        # Los permisos de lectura (GET, HEAD, OPTIONS) están permitidos
        # para cualquier petición, así que siempre permitimos estas.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Los permisos de escritura (POST, PUT, DELETE) solo se conceden si
        # el perfil de operador del usuario que hace la petición
        # es el mismo que el operador asignado al paquete turístico.
        return obj.operator == request.user.operatorprofile