from django.urls import path
from .views import UserProfileView, OperatorDashboardView, CurrentUserView

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', OperatorDashboardView.as_view(), name='operator-dashboard'),
]