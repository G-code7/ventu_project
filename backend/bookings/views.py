# bookings/views.py
"""
Views para el sistema de reservas
Endpoints para viajeros y operadores
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from decimal import Decimal

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCancelSerializer,
    BookingStatsSerializer,
)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de reservas.
    
    Endpoints:
    - POST   /api/bookings/              - Crear reserva
    - GET    /api/bookings/              - Listar reservas (según rol)
    - GET    /api/bookings/{id}/         - Ver detalle
    - DELETE /api/bookings/{id}/         - Eliminar (solo admin)
    - POST   /api/bookings/{id}/cancel/  - Cancelar reserva
    - GET    /api/bookings/my_trips/     - Historial viajero
    - GET    /api/bookings/incoming/     - Reservas operador
    - GET    /api/bookings/stats/        - Estadísticas
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Serializer según la acción"""
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action == 'list':
            return BookingListSerializer
        elif self.action == 'cancel':
            return BookingCancelSerializer
        return BookingDetailSerializer
    
    def get_queryset(self):
        """
        Filtrar reservas según el rol del usuario:
        - TRAVELER: solo sus propias reservas
        - OPERATOR: reservas de sus tours
        - ADMIN: todas las reservas
        """
        user = self.request.user
        
        # Optimizar queries
        queryset = Booking.objects.select_related(
            'tour_package',
            'tour_package__operator',
            'traveler'
        ).prefetch_related(
            'tour_package__images'
        )
        
        if user.role == 'TRAVELER':
            return queryset.filter(traveler=user)
        
        elif user.role == 'OPERATOR':
            return queryset.filter(tour_package__operator=user)
        
        elif user.role == 'ADMIN' or user.is_staff:
            return queryset.all()
        
        return queryset.none()
    
    def perform_create(self, serializer):
        """
        Validar que solo viajeros puedan crear reservas.
        El traveler se asigna automáticamente en el serializer.
        """
        if self.request.user.role != 'TRAVELER':
            raise PermissionDenied(
                "Solo los viajeros pueden crear reservas"
            )
        
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        """
        Crear una nueva reserva con validaciones y respuesta detallada.
        """
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            # Devolver respuesta detallada
            booking = serializer.instance
            detail_serializer = BookingDetailSerializer(
                booking,
                context=self.get_serializer_context()
            )
            
            headers = self.get_success_headers(serializer.data)
            
            return Response(
                {
                    'message': 'Reserva creada exitosamente',
                    'booking': detail_serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancelar una reserva.
        Solo el viajero o el operador pueden cancelar.
        """
        booking = self.get_object()
        
        # Validar permisos
        user = request.user
        if user.role == 'TRAVELER' and booking.traveler != user:
            return Response(
                {'error': 'No tienes permiso para cancelar esta reserva'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.role == 'OPERATOR' and booking.tour_package.operator != user:
            return Response(
                {'error': 'No tienes permiso para cancelar esta reserva'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar que se puede cancelar
        if not booking.can_be_cancelled:
            reasons = []
            if booking.status in ['CANCELLED', 'COMPLETED']:
                reasons.append(f'La reserva ya está {booking.get_status_display()}')
            if booking.travel_date < timezone.now().date():
                reasons.append('La fecha del viaje ya pasó')
            
            return Response(
                {'error': 'No se puede cancelar esta reserva', 'reasons': reasons},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancelar la reserva
        serializer = BookingCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            reason = serializer.validated_data.get('cancellation_reason', '')
            booking.cancel(reason=reason)
            
            return Response({
                'message': 'Reserva cancelada exitosamente',
                'booking_code': booking.booking_code
            })
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def my_trips(self, request):
        """
        Endpoint para viajeros: ver su historial de reservas.
        Permite filtrar por estado y ordenar por fecha.
        """
        if request.user.role != 'TRAVELER':
            return Response(
                {'error': 'Este endpoint es solo para viajeros'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener parámetros de filtro
        status_filter = request.query_params.get('status', None)
        ordering = request.query_params.get('ordering', '-travel_date')
        
        # Filtrar reservas
        queryset = self.get_queryset()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Separar en upcoming y past
        today = timezone.now().date()
        upcoming = queryset.filter(
            travel_date__gte=today,
            status__in=['PENDING', 'CONFIRMED']
        ).order_by('travel_date')
        
        past = queryset.filter(
            Q(travel_date__lt=today) |
            Q(status__in=['CANCELLED', 'COMPLETED'])
        ).order_by('-travel_date')
        
        # Serializar
        upcoming_serializer = BookingListSerializer(upcoming, many=True)
        past_serializer = BookingListSerializer(past, many=True)
        
        return Response({
            'upcoming_trips': upcoming_serializer.data,
            'past_trips': past_serializer.data,
            'total_trips': queryset.count(),
        })
    
    @action(detail=False, methods=['get'])
    def incoming(self, request):
        """
        Endpoint para operadores: ver reservas recibidas en sus tours.
        Muestra solo reservas activas (pending + confirmed).
        """
        if request.user.role != 'OPERATOR':
            return Response(
                {'error': 'Este endpoint es solo para operadores'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Filtrar por estado
        status_filter = request.query_params.get('status', None)
        
        queryset = self.get_queryset()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        else:
            # Por defecto, mostrar solo pendientes y confirmadas
            queryset = queryset.filter(
                status__in=['PENDING', 'CONFIRMED']
            )
        
        # Ordenar por fecha del viaje (próximas primero)
        queryset = queryset.order_by('travel_date')
        
        # Paginar
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = BookingListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = BookingListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Estadísticas de reservas según el rol.
        - TRAVELER: sus estadísticas personales
        - OPERATOR: estadísticas de sus tours
        - ADMIN: estadísticas globales
        """
        user = request.user
        queryset = self.get_queryset()
        
        # Contar por estado
        stats = {
            'total_bookings': queryset.count(),
            'pending_bookings': queryset.filter(status='PENDING').count(),
            'confirmed_bookings': queryset.filter(status='CONFIRMED').count(),
            'cancelled_bookings': queryset.filter(status='CANCELLED').count(),
            'completed_bookings': queryset.filter(status='COMPLETED').count(),
        }
        
        # Calcular ingresos (solo para operadores y admin)
        if user.role in ['OPERATOR', 'ADMIN'] or user.is_staff:
            revenue_data = queryset.filter(
                status__in=['CONFIRMED', 'COMPLETED']
            ).aggregate(
                total_revenue=Sum('operator_amount'),
                total_commission=Sum('commission_amount'),
            )
            
            stats['total_revenue'] = revenue_data['total_revenue'] or Decimal('0.00')
            stats['total_commission'] = revenue_data['total_commission'] or Decimal('0.00')
        else:
            # Para viajeros, mostrar cuánto han gastado
            spent = queryset.filter(
                status__in=['CONFIRMED', 'COMPLETED']
            ).aggregate(total=Sum('total_amount'))
            
            stats['total_spent'] = spent['total'] or Decimal('0.00')
        
        # Total de personas
        total_people = 0
        for booking in queryset:
            total_people += booking.total_people
        stats['total_people'] = total_people
        
        # Valor promedio de reserva
        if stats['total_bookings'] > 0:
            avg = queryset.filter(
                status__in=['CONFIRMED', 'COMPLETED']
            ).aggregate(avg=Avg('total_amount'))
            stats['average_booking_value'] = avg['avg'] or Decimal('0.00')
        else:
            stats['average_booking_value'] = Decimal('0.00')
        
        serializer = BookingStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """
        Marcar una reserva como pagada (para futuro con pasarela).
        Solo accesible por admin o sistema de pagos.
        """
        if not (request.user.is_staff or request.user.role == 'ADMIN'):
            return Response(
                {'error': 'No autorizado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        
        if booking.status != 'PENDING':
            return Response(
                {'error': 'Solo se pueden confirmar reservas pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_id = request.data.get('payment_id')
        payment_method = request.data.get('payment_method', 'manual')
        
        if not payment_id:
            return Response(
                {'error': 'Se requiere payment_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.confirm_payment(payment_id, payment_method)
        
        serializer = self.get_serializer(booking)
        return Response({
            'message': 'Pago confirmado exitosamente',
            'booking': serializer.data
        })


class BookingPublicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet público (sin autenticación) para verificar reservas.
    Solo permite ver detalles con el código de reserva.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = BookingDetailSerializer
    lookup_field = 'booking_code'
    
    def get_queryset(self):
        return Booking.objects.select_related(
            'tour_package',
            'traveler'
        ).all()
    
    @action(detail=False, methods=['get'])
    def verify(self, request):
        """
        Verificar una reserva con código y email.
        Útil para confirmación sin login.
        """
        booking_code = request.query_params.get('code')
        email = request.query_params.get('email')
        
        if not booking_code or not email:
            return Response(
                {'error': 'Se requiere código de reserva y email'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(
                booking_code=booking_code,
                contact_email=email
            )
            serializer = self.get_serializer(booking)
            return Response(serializer.data)
            
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Reserva no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
