from django.urls import path
from .views import UserProfileView, OperatorDashboardView

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', OperatorDashboardView.as_view(), name='operator-dashboard'),
]