# bookings/models.py
"""
Modelo de Reservas para VENTU
Implementa el sistema completo de booking con tracking de precios y estados
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import random
import string

class Booking(models.Model):
    """
    Representa una reserva de un paquete turístico por parte de un viajero.
    Almacena snapshot de precios para mantener historial inmutable.
    """
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pendiente de Pago'
        CONFIRMED = 'CONFIRMED', 'Confirmada'
        CANCELLED = 'CANCELLED', 'Cancelada'
        COMPLETED = 'COMPLETED', 'Completada'
        REFUNDED = 'REFUNDED', 'Reembolsada'
    
    # ============ RELACIONES ============
    tour_package = models.ForeignKey(
        'tours.TourPackage',
        on_delete=models.PROTECT,  # No permitir eliminar tours con reservas
        related_name='bookings',
        verbose_name='Paquete Turístico'
    )
    
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        limit_choices_to={'role': 'TRAVELER'},
        verbose_name='Viajero'
    )
    
    # ============ INFORMACIÓN DE LA RESERVA ============
    booking_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Reserva'
    )
    
    travel_date = models.DateField(
        verbose_name='Fecha del Viaje',
        help_text='Fecha en que se realizará el tour'
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='Estado'
    )
    
    # ============ DETALLES DE TICKETS (Snapshot) ============
    # Formato: {"adulto": 2, "niño": 1, "tercera_edad": 0}
    tickets_detail = models.JSONField(
        verbose_name='Detalle de Tickets',
        help_text='Cantidad de personas por tipo de ticket'
    )
    
    # Precios de cada tipo al momento de la reserva (snapshot)
    # Formato: {"adulto": "110.00", "niño": "55.00"}
    tickets_prices = models.JSONField(
        verbose_name='Precios de Tickets',
        help_text='Precio unitario con comisión de cada tipo de ticket'
    )
    
    # ============ SERVICIOS EXTRAS ============
    # Servicios adicionales seleccionados
    # Formato: {"comidas": true, "seguro_viaje": false, "fotos": true}
    selected_extras = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Servicios Extras Seleccionados'
    )
    
    # Precios de servicios extras (snapshot)
    # Formato: {"comidas": "40.00", "seguro_viaje": "30.00"}
    extras_prices = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Precios de Extras',
        help_text='Precio con comisión de cada servicio extra'
    )
    
    # ============ CÁLCULOS DE PRECIO (Snapshot) ============
    subtotal_tickets = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Subtotal Tickets',
        help_text='Suma de todos los tickets'
    )
    
    subtotal_extras = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Subtotal Extras',
        help_text='Suma de todos los extras'
    )
    
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Monto Total',
        help_text='Precio final que paga el viajero'
    )
    
    commission_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Comisión de Plataforma',
        help_text='Ganancia de VENTU'
    )
    
    operator_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Monto del Operador',
        help_text='Dinero que recibe el operador (sin comisión)'
    )
    
    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name='Tasa de Comisión',
        help_text='Porcentaje de comisión al momento de la reserva'
    )
    
    # ============ INFORMACIÓN DE CONTACTO ============
    contact_name = models.CharField(
        max_length=200,
        verbose_name='Nombre de Contacto'
    )
    
    contact_email = models.EmailField(
        verbose_name='Email de Contacto'
    )
    
    contact_phone = models.CharField(
        max_length=20,
        verbose_name='Teléfono de Contacto'
    )
    
    special_requests = models.TextField(
        blank=True,
        verbose_name='Solicitudes Especiales',
        help_text='Alergias, dietas, necesidades especiales, etc.'
    )
    
    # ============ INFORMACIÓN DE PAGO ============
    payment_id = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='ID de Transacción',
        help_text='ID de la transacción de la pasarela de pago'
    )
    
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Método de Pago',
        help_text='Ej: stripe, paypal, transferencia'
    )
    
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Pago'
    )
    
    # ============ CÓDIGO ÚNICO DE RESERVA ============
    booking_code = models.CharField(
        max_length=10,
        unique=True,
        editable=False,
        verbose_name='Código de Reserva',
        help_text='Código único para identificar la reserva'
    )
    
    # ============ AUDITORÍA ============
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Cancelación'
    )
    
    cancellation_reason = models.TextField(
        blank=True,
        verbose_name='Razón de Cancelación'
    )
    
    # ============ MÉTODOS ============
    
    @property
    def total_people(self):
        """Calcula el número total de personas en la reserva"""
        return sum(self.tickets_detail.values())
    
    @property
    def operator(self):
        """Acceso rápido al operador del tour"""
        return self.tour_package.operator
    
    @property
    def is_confirmed(self):
        """Verifica si la reserva está confirmada"""
        return self.status == self.Status.CONFIRMED
    
    @property
    def is_active(self):
        """Verifica si la reserva está activa (no cancelada ni completada)"""
        return self.status in [self.Status.PENDING, self.Status.CONFIRMED]
    
    @property
    def can_be_cancelled(self):
        """Verifica si la reserva puede ser cancelada"""
        # Solo pendientes y confirmadas pueden cancelarse
        if self.status not in [self.Status.PENDING, self.Status.CONFIRMED]:
            return False
        
        # No se puede cancelar si la fecha del viaje ya pasó
        from django.utils import timezone
        if self.travel_date < timezone.now().date():
            return False
        
        return True
    
    def calculate_totals(self):
        """
        Calcula todos los totales basándose en tickets_detail y selected_extras.
        Debe llamarse antes de guardar una nueva reserva.
        """
        # Calcular subtotal de tickets
        self.subtotal_tickets = Decimal('0.00')
        for ticket_type, quantity in self.tickets_detail.items():
            price = Decimal(str(self.tickets_prices[ticket_type]))
            self.subtotal_tickets += price * Decimal(str(quantity))
        
        # Calcular subtotal de extras
        self.subtotal_extras = Decimal('0.00')
        if self.selected_extras and self.extras_prices:
            total_people = self.total_people
            for extra_key, is_selected in self.selected_extras.items():
                if is_selected:
                    price = Decimal(str(self.extras_prices[extra_key]))
                    # Los extras se multiplican por persona
                    self.subtotal_extras += price * Decimal(str(total_people))
        
        # Total que paga el viajero
        self.total_amount = self.subtotal_tickets + self.subtotal_extras
        
        # Calcular comisión y monto del operador
        commission_rate_decimal = Decimal(str(self.commission_rate))
        self.commission_amount = self.total_amount - (
            self.total_amount / (Decimal('1') + commission_rate_decimal)
        )
        self.operator_amount = self.total_amount - self.commission_amount
    
    def confirm_payment(self, payment_id, payment_method):
        """Marca la reserva como confirmada tras pago exitoso"""
        from django.utils import timezone
        
        self.status = self.Status.CONFIRMED
        self.payment_id = payment_id
        self.payment_method = payment_method
        self.paid_at = timezone.now()
        self.save()
    
    def cancel(self, reason=''):
        """Cancela la reserva y libera los cupos"""
        from django.utils import timezone
        
        if not self.can_be_cancelled:
            raise ValueError('Esta reserva no puede ser cancelada')
        
        self.status = self.Status.CANCELLED
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save()
        
        # Liberar cupos en el tour
        self.tour_package.decrement_bookings(self.total_people)
    
    def complete(self):
        """Marca la reserva como completada (después del viaje)"""
        self.status = self.Status.COMPLETED
        self.save()
    
    def save(self, *args, **kwargs):
        """Sobrescribir save para generar código único"""
        # Generar código de reserva único
        if not self.booking_code:
            while True:
                code = ''.join(
                    random.choices(
                        string.ascii_uppercase + string.digits, 
                        k=8
                    )
                )
                if not Booking.objects.filter(booking_code=code).exists():
                    self.booking_code = code
                    break
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Reserva {self.booking_code} - {self.tour_package.title}"
    
    class Meta:
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['traveler', 'status']),
            models.Index(fields=['tour_package', 'travel_date']),
            models.Index(fields=['booking_code']),
            models.Index(fields=['status', 'travel_date']),
            models.Index(fields=['created_at']),
        ]


class BookingStatusHistory(models.Model):
    """
    Historial de cambios de estado de una reserva.
    Útil para auditoría y tracking.
    """
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    
    from_status = models.CharField(
        max_length=20,
        choices=Booking.Status.choices,
        verbose_name='Estado Anterior'
    )
    
    to_status = models.CharField(
        max_length=20,
        choices=Booking.Status.choices,
        verbose_name='Nuevo Estado'
    )
    
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='booking_status_changes'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Notas'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha del Cambio'
    )
    
    class Meta:
        verbose_name = 'Historial de Estado'
        verbose_name_plural = 'Historiales de Estado'
        ordering = ['-created_at']
