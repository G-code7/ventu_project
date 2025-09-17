from django.contrib import admin
from django.urls import path, include 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Conectamos las URLs de nuestra API a la ruta 'api/'
    path('api/', include('tours.urls')),
]

# Esta configuración es solo para el entorno de desarrollo (DEBUG=True)
# y permite que Django sirva los archivos que los usuarios suben.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

