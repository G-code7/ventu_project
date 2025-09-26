from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserProfileSerializer
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
from tours.models import TourPackage
from datetime import datetime
from dateutil.relativedelta import relativedelta

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
        if not request.user.role == 'OPERATOR':
            return Response(
                {'error': 'Acceso denegado. Solo para operadores.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # --- Lógica del gráfico ---
        operator_user = request.user
        data = []
        today = datetime.today()

        # Rango en los ultimos 6 meses
        for i in range(5, -1, -1):
            month_date = today - relativedelta(months=i)
            month_name = month_date.strftime("%b %Y")
            packages_in_month = TourPackage.objects.filter(
                operator=operator_user,
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