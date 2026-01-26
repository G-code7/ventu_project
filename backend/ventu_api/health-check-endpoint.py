# Health Check Endpoint para VENTU Backend
# Agregar este código a tu proyecto Django

# ===========================================
# OPCIÓN 1: Agregar a un archivo existente
# ===========================================

# En backend/ventu_api/urls.py, agrega:

from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """
    Endpoint para verificar el estado del servidor.
    Usado por GitHub Actions para validar deploys.
    """
    try:
        # Verificar conexión a base de datos
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"  # Puedes actualizar esto con cada release
        })
    except Exception as e:
        return JsonResponse({
            "status": "unhealthy",
            "error": str(e)
        }, status=500)

# Y en urlpatterns:
# path('api/health/', health_check, name='health_check'),


# ===========================================
# OPCIÓN 2: Crear una app dedicada (recomendado)
# ===========================================

# 1. Crear el archivo backend/core/views.py:
"""
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import time

def health_check(request):
    '''
    Health check endpoint para monitoreo y CI/CD.
    
    Respuestas:
    - 200: Servidor saludable
    - 500: Problemas detectados
    '''
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "checks": {}
    }
    
    # Check 1: Database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status["checks"]["database"] = "ok"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = f"error: {str(e)}"
    
    # Check 2: Settings
    health_status["checks"]["debug_mode"] = "off" if not settings.DEBUG else "on"
    
    # Responder
    status_code = 200 if health_status["status"] == "healthy" else 500
    return JsonResponse(health_status, status=status_code)
"""

# 2. Crear el archivo backend/core/urls.py:
"""
from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
]
"""

# 3. En backend/ventu_api/urls.py, agregar:
"""
urlpatterns = [
    # ... otras urls ...
    path('api/', include('core.urls')),
]
"""

# 4. Agregar 'core' a INSTALLED_APPS en settings.py (si no existe)


# ===========================================
# OPCIÓN 3: Más simple - Solo agregar a urls.py
# ===========================================

# Si quieres la opción más simple, agrega esto directamente a 
# backend/ventu_api/urls.py:

"""
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    # ... tus otras URLs ...
    path('api/health/', health_check),
]
"""
