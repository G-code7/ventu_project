from django.urls import path
from .views import UserRegistrationView, UserProfileView

urlpatterns = [
    # Cuando la URL sea /register/, se llamará a la vista UserRegistrationView.
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    
    # Cuando la URL sea /me/, se llamará a la vista UserProfileView.
    path('me/', UserProfileView.as_view(), name='user-profile'),
]