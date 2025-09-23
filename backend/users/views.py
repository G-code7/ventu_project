from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, UserProfileSerializer
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

class UserRegistrationView(generics.CreateAPIView):
    """
    Endpoint para el registro de nuevos usuarios.
    Permite el acceso a cualquiera (AllowAny).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Sobrescribimos el método 'create' para añadir los tokens JWT a la respuesta
        de un registro exitoso.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generamos los tokens para el nuevo usuario
        refresh = RefreshToken.for_user(user)
        
        # Preparamos los datos que devolveremos al frontend
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role': user.role
            }
        }

        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para que un usuario vea o actualice su propio perfil.
    Solo accesible para usuarios autenticados (IsAuthenticated).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """
        Asegura que el usuario solo pueda ver y editar su propio perfil.
        """
        return self.request.user