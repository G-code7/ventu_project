from django.urls import path
from .views import UserRegistrationView, UserProfileView, OperatorDashboardView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', OperatorDashboardView.as_view(), name='operator-dashboard'),
]