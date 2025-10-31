# bookings/serializers.py
"""
Serializers para el sistema de reservas
"""

from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from .models import Booking, BookingStatusHistory
from tours.serializers import TourPackageListSerializer
from users.serializers import UserProfileSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear nuevas reservas.
    Calcula automáticamente los totales y captura snapshot de precios.
    """
    
    class Meta:
        model = Booking
        fields = [
            'tour_package',
            'travel_date',
            'tickets_detail',
            'selected_extras',
            'contact_name',
            'contact_email',
            'contact_phone',
            'special_requests',
        ]
    
    def validate_travel_date(self, value):
        """Validar que la fecha del viaje no esté en el pasado"""
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "La fecha del viaje no puede estar en el pasado"
            )
        return value
    
    def validate_tickets_detail(self, value):
        """Validar que haya al menos una persona"""
        if not value or sum(value.values()) == 0:
            raise serializers.ValidationError(
                "Debe seleccionar al menos un ticket"
            )
        
        # Validar que todas las cantidades sean positivas
        for ticket_type, quantity in value.items():
            if quantity < 0:
                raise serializers.ValidationError(
                    f"La cantidad para {ticket_type} no puede ser negativa"
                )
        
        return value
    
    def validate(self, attrs):
        """Validaciones cruzadas"""
        tour_package = attrs['tour_package']
        tickets_detail = attrs['tickets_detail']
        
        # Validar disponibilidad del tour
        total_people = sum(tickets_detail.values())
        
        if not tour_package.is_active:
            raise serializers.ValidationError(
                "Este tour no está disponible actualmente"
            )
        
        if tour_package.available_slots < total_people:
            raise serializers.ValidationError(
                f"Solo hay {tour_package.available_slots} plazas disponibles"
            )
        
        # Validar que los tipos de ticket existen en el tour
        if tour_package.price_variations_with_commission:
            valid_types = tour_package.price_variations_with_commission.keys()
            for ticket_type in tickets_detail.keys():
                if ticket_type not in valid_types:
                    raise serializers.ValidationError(
                        f"El tipo de ticket '{ticket_type}' no es válido"
                    )
        
        # Validar fecha según disponibilidad del tour
        travel_date = attrs['travel_date']
        
        if tour_package.availability_type == 'SPECIFIC_DATE':
            if tour_package.departure_date != travel_date:
                raise serializers.ValidationError(
                    f"Este tour solo está disponible el {tour_package.departure_date}"
                )
        
        elif tour_package.availability_type == 'OPEN_DATES':
            if not (tour_package.available_from <= travel_date <= tour_package.available_until):
                raise serializers.ValidationError(
                    f"La fecha debe estar entre {tour_package.available_from} y {tour_package.available_until}"
                )
        
        return attrs
    
    def create(self, validated_data):
        """
        Crear la reserva con snapshot de precios y cálculos automáticos
        """
        tour_package = validated_data['tour_package']
        tickets_detail = validated_data['tickets_detail']
        selected_extras = validated_data.get('selected_extras', {})
        
        # Capturar snapshot de precios de tickets
        if tour_package.price_variations_with_commission:
            tickets_prices = {
                ticket_type: tour_package.price_variations_with_commission[ticket_type]
                for ticket_type in tickets_detail.keys()
            }
        else:
            # Si no hay variaciones, usar el precio final
            tickets_prices = {
                'default': str(tour_package.final_price)
            }
            # Ajustar tickets_detail si es necesario
            if 'default' not in tickets_detail:
                total = sum(tickets_detail.values())
                validated_data['tickets_detail'] = {'default': total}
        
        # Capturar snapshot de precios de extras
        extras_prices = None
        if selected_extras and tour_package.extra_services_with_commission:
            extras_prices = {
                extra_key: tour_package.extra_services_with_commission[extra_key]
                for extra_key in selected_extras.keys()
                if selected_extras[extra_key]  # Solo los seleccionados
            }
        
        # Crear la reserva
        booking = Booking(
            **validated_data,
            traveler=self.context['request'].user,
            tickets_prices=tickets_prices,
            extras_prices=extras_prices,
            commission_rate=tour_package.commission_rate,
        )
        
        # Calcular todos los totales
        booking.calculate_totals()
        
        # Guardar la reserva
        booking.save()
        
        # Incrementar las reservas del tour
        total_people = sum(tickets_detail.values())
        tour_package.increment_bookings(total_people)
        
        return booking


class BookingListSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para listar reservas.
    Incluye información básica del tour y viajero.
    """
    tour_title = serializers.CharField(
        source='tour_package.title', 
        read_only=True
    )
    tour_destination = serializers.CharField(
        source='tour_package.state_destination',
        read_only=True
    )
    tour_image = serializers.SerializerMethodField()
    
    traveler_name = serializers.CharField(
        source='traveler.get_full_name',
        read_only=True
    )
    traveler_email = serializers.EmailField(
        source='traveler.email',
        read_only=True
    )
    
    total_people = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    can_be_cancelled = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_code',
            'tour_title',
            'tour_destination',
            'tour_image',
            'traveler_name',
            'traveler_email',
            'travel_date',
            'total_people',
            'total_amount',
            'status',
            'is_active',
            'can_be_cancelled',
            'created_at',
        ]
    
    def get_tour_image(self, obj):
        """Obtener la imagen principal del tour"""
        main_image = obj.tour_package.main_image
        if main_image:
            return main_image.image.url
        return None


class BookingDetailSerializer(serializers.ModelSerializer):
    """
    Serializer completo para ver detalle de una reserva.
    Incluye toda la información necesaria.
    """
    tour_package = TourPackageListSerializer(read_only=True)
    traveler = UserProfileSerializer(read_only=True)
    
    total_people = serializers.ReadOnlyField()
    is_confirmed = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    can_be_cancelled = serializers.ReadOnlyField()
    
    # Información adicional útil
    days_until_travel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            # IDs y códigos
            'id',
            'booking_code',
            
            # Relaciones
            'tour_package',
            'traveler',
            
            # Fechas
            'booking_date',
            'travel_date',
            'days_until_travel',
            
            # Estado
            'status',
            'is_confirmed',
            'is_active',
            'can_be_cancelled',
            
            # Detalles de tickets
            'tickets_detail',
            'tickets_prices',
            'total_people',
            
            # Extras
            'selected_extras',
            'extras_prices',
            
            # Precios
            'subtotal_tickets',
            'subtotal_extras',
            'total_amount',
            'commission_amount',
            'operator_amount',
            'commission_rate',
            
            # Contacto
            'contact_name',
            'contact_email',
            'contact_phone',
            'special_requests',
            
            # Pago
            'payment_id',
            'payment_method',
            'paid_at',
            
            # Auditoría
            'created_at',
            'updated_at',
            'cancelled_at',
            'cancellation_reason',
        ]
    
    def get_days_until_travel(self, obj):
        """Calcular días hasta el viaje"""
        if obj.travel_date:
            delta = obj.travel_date - timezone.now().date()
            return delta.days
        return None


class BookingCancelSerializer(serializers.Serializer):
    """Serializer para cancelar una reserva"""
    cancellation_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500
    )


class BookingStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de reservas"""
    total_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    confirmed_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    
    total_revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    total_commission = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    
    total_people = serializers.IntegerField()
    average_booking_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )


class BookingStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer para historial de cambios de estado"""
    changed_by_name = serializers.CharField(
        source='changed_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = BookingStatusHistory
        fields = [
            'id',
            'from_status',
            'to_status',
            'changed_by_name',
            'notes',
            'created_at',
        ]
