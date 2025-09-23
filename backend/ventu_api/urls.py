from django.contrib import admin
from django.urls import path, include # <-- 'include' es la clave
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Conexión a los mapas de nuestras apps
    path('api/', include('tours.urls')),
    path('api/users/', include('users.urls')), # <-- Esta es la línea que conecta el mapa del barrio 'users'

    # Rutas de Autenticación
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)