from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TourPackageViewSet, TagViewSet, ReviewViewSet, IncludedItemViewSet

# Creamos un router y registramos todos nuestros viewsets con él.
router = DefaultRouter()
router.register(r'tours', TourPackageViewSet, basename='tourpackage')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'included-items', IncludedItemViewSet, basename='includeditem')
# Las URLs de la API son determinadas automáticamente por el router.
urlpatterns = [
    path('', include(router.urls)),
]