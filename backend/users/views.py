from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, UserProfileSerializer
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
from tours.models import TourPackage
from datetime import datetime
from dateutil.relativedelta import relativedelta

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
    
class OperatorDashboardView(APIView):
    """
    Endpoint que provee los datos agregados para el dashboard del operador.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Nos aseguramos de que el usuario sea un operador
        if not request.user.role == 'OPERATOR':
            return Response(
                {'error': 'Acceso denegado. Solo para operadores.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # --- Lógica del gráfico ---
        operator_profile = request.user.operatorprofile
        data = []
        today = datetime.today()

        # Rango en los ultimos 6 meses
        for i in range(5, -1, -1):
            # Calculamos el mes que estamos procesando
            month_date = today - relativedelta(months=i)
            month_name = month_date.strftime("%b %Y") # Formato: "Sep 2025"

            # n° de paquetes creador por operador
            packages_in_month = TourPackage.objects.filter(
                operator=operator_profile,
                created_at__year=month_date.year,
                created_at__month=month_date.month
            ).count()
            
            # TODO: Contar las reservas cuando el modelo Booking exista
            # bookings_in_month = Booking.objects.filter(...) 

            data.append({
                'name': month_name,
                'paquetes_creados': packages_in_month,
                'reservas_recibidas': 0, # Placeholder por ahora
            })

        return Response(data)