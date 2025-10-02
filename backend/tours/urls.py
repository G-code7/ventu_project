from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TourPackageViewSet, TagViewSet, ReviewViewSet, IncludedItemViewSet, TourDiagnosticView

router = DefaultRouter()
router.register(r'tours', TourPackageViewSet, basename='tourpackage')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'included-items', IncludedItemViewSet, basename='includeditem')

urlpatterns = [
    path('', include(router.urls)),
    path('diagnostic/', TourDiagnosticView.as_view(), name='tour-diagnostic'),
]