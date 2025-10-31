from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, BookingPublicViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'bookings-public', BookingPublicViewSet, basename='booking-public')

urlpatterns = [
    path('', include(router.urls)),
]