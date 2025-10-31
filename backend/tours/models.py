from django.db import models
from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone

VENEZUELA_STATES = [
    ("Amazonas", "Amazonas"),
    ("Anzoátegui", "Anzoátegui"), 
    ("Apure", "Apure"),
    ("Aragua", "Aragua"),
    ("Barinas", "Barinas"),
    ("Bolívar", "Bolívar"),
    ("Carabobo", "Carabobo"),
    ("Cojedes", "Cojedes"),
    ("Delta Amacuro", "Delta Amacuro"),
    ("Distrito Capital", "Distrito Capital"),
    ("Falcón", "Falcón"),
    ("Guárico", "Guárico"),
    ("Lara", "Lara"),
    ("Mérida", "Mérida"),
    ("Miranda", "Miranda"),
    ("Monagas", "Monagas"),
    ("Nueva Esparta", "Nueva Esparta"),
    ("Portuguesa", "Portuguesa"),
    ("Sucre", "Sucre"),
    ("Táchira", "Táchira"),
    ("Trujillo", "Trujillo"),
    ("La Guaira", "La Guaira"),
    ("Yaracuy", "Yaracuy"),
    ("Zulia", "Zulia"),
]

class Environment(models.TextChoices):
    FESTIVE_MUSIC = "FESTIVE_MUSIC", "🎉 Festivo con Música"
    RELAXING_NO_MUSIC = "RELAXING_NO_MUSIC", "😌 Relajante sin Música"
    ADVENTUROUS = "ADVENTUROUS", "🧗 Aventurero/Extremo"
    CULTURAL = "CULTURAL", "🏛️ Cultural/Educativo"
    ROMANTIC = "ROMANTIC", "💑 Romántico"
    FAMILY = "FAMILY", "👨‍👩‍👧‍👦 Familiar"
    LUXURY = "LUXURY", "🌟 Lujo/Exclusivo"
    NATURE = "NATURE", "🌳 Naturaleza"
    BEACH = "BEACH", "🏖️ Playa"
    MOUNTAIN = "MOUNTAIN", "⛰️ Montaña"
    HISTORICAL = "HISTORICAL", "🏺 Histórico"
    GASTRONOMIC = "GASTRONOMIC", "🍴 Gastronómico"
    WELLNESS = "WELLNESS", "💆 Wellness"

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Nombre de la Etiqueta")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Etiqueta"
        verbose_name_plural = "Etiquetas"

class IncludedItem(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Ítem")
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Ítem Incluido"
        verbose_name_plural = "Ítems Incluidos"

class TourPackage(models.Model):
    """
    Modelo optimizado con manejo correcto de precios y comisiones
    """
    class AvailabilityType(models.TextChoices):
        OPEN_DATES = "OPEN_DATES", "Fechas Abiertas"
        SPECIFIC_DATE = "SPECIFIC_DATE", "Fecha Específica"
    
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Borrador"
        PENDING = "PENDING", "Pendiente de Aprobación"
        PUBLISHED = "PUBLISHED", "Publicado"
        REJECTED = "REJECTED", "Rechazado"

    # Origen y Destino
    state_origin = models.CharField(
        max_length=50,
        choices=VENEZUELA_STATES,
        verbose_name="Estado de Origen",
        default="Distrito Capital"
    )
    specific_origin = models.CharField(
        max_length=150,
        verbose_name="Lugar Específico de Origen",
        help_text="Ej: Aeropuerto de Maiquetía",
        default="Por definir"
    )
    state_destination = models.CharField(
        max_length=50,
        choices=VENEZUELA_STATES,
        verbose_name="Estado de Destino", 
        default="Miranda"
    )
    specific_destination = models.CharField(
        max_length=150,
        verbose_name="Destino Específico",
        help_text="Ej: Playa Colorada",
        default="Por definir"
    )

    # ============ SISTEMA DE PRECIOS OPTIMIZADO ============
    
    # Precio base (SIN comisión - lo que ingresa el operador)
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1.00'))],
        verbose_name="Precio Base (sin comisión)",
        help_text="Precio neto antes de aplicar comisión de plataforma"
    )
    
    # Tasa de comisión de la plataforma
    commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('0.10'),
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('1.00'))
        ],
        verbose_name="Tasa de Comisión (%)",
        help_text="Comisión de la plataforma (0.10 = 10%)"
    )
    
    # Precio final con comisión (calculado automáticamente)
    final_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Precio Final (con comisión)",
        null=True,
        blank=True,
        editable=False,
        help_text="Calculado automáticamente: base_price * (1 + commission_rate)"
    )

    # Variaciones de precio (SIN comisión - precios netos)
    # Formato: {"adulto": "100.00", "niño": "50.00", "tercera_edad": "70.00"}
    price_variations = models.JSONField(
        blank=True, 
        null=True, 
        verbose_name="Variaciones de Precio (sin comisión)",
        help_text='Precios netos por tipo. Ej: {"adulto": 100.00, "niño": 50.00}'
    )
    
    # Variaciones con comisión aplicada (calculado automáticamente)
    price_variations_with_commission = models.JSONField(
        blank=True,
        null=True,
        verbose_name="Variaciones de Precio (con comisión)",
        editable=False,
        help_text="Calculado automáticamente aplicando commission_rate"
    )
    
    # Servicios adicionales (SIN comisión - precios netos)
    # Formato: {"comidas": "40.00", "seguro_viaje": "30.00"}
    extra_services = models.JSONField(
        blank=True, 
        null=True,
        verbose_name="Servicios Adicionales (sin comisión)", 
        help_text='Precios netos. Ej: {"comidas": 40.00, "seguro": 30.00}'
    )
    
    # Servicios adicionales con comisión (calculado automáticamente)
    extra_services_with_commission = models.JSONField(
        blank=True,
        null=True,
        verbose_name="Servicios Adicionales (con comisión)",
        editable=False,
        help_text="Calculado automáticamente aplicando commission_rate"
    )

    # ============ FIN SISTEMA DE PRECIOS ============

    # Información básica
    title = models.CharField(max_length=200, verbose_name="Título", default="")
    description = models.TextField(verbose_name="Descripción Larga")
    
    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="tour_packages",
        verbose_name="Operador Turístico",
        limit_choices_to={'role': 'OPERATOR'}
    )

    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PUBLISHED
    )

    # Detalles Logísticos
    meeting_point = models.CharField(max_length=255, verbose_name="Lugar de Encuentro")
    meeting_time = models.TimeField(verbose_name="Hora de Encuentro")
    duration_days = models.PositiveIntegerField(
        default=1, 
        verbose_name="Duración (días)",
        validators=[MinValueValidator(1)]
    )
    
    environment = models.CharField(
        max_length=50,
        choices=Environment.choices,
        default=Environment.RELAXING_NO_MUSIC,
        verbose_name="Entorno/Ambiente"
    )

    # Capacidad
    group_size = models.PositiveIntegerField(
        default=10,
        verbose_name="Tamaño Máximo del Grupo",
        validators=[MinValueValidator(1)]
    )
    
    current_bookings = models.PositiveIntegerField(
        default=0,
        verbose_name="Reservas Actuales"
    )

    # Qué incluye y qué no
    what_is_included = models.ManyToManyField(
        IncludedItem, 
        blank=True, 
        related_name="packages_included", 
        verbose_name="Qué Incluye"
    )
    what_is_not_included = models.ManyToManyField(
        IncludedItem, 
        blank=True, 
        related_name="packages_not_included",
        verbose_name="Qué No Incluye"
    )

    # Información detallada
    highlights = models.JSONField(
        blank=True, 
        null=True,
        verbose_name="Puntos Destacados"
    )
    
    itinerary = models.JSONField(
        blank=True, 
        null=True, 
        verbose_name="Itinerario Detallado"
    )

    # Disponibilidad
    availability_type = models.CharField(
        max_length=20,
        choices=AvailabilityType.choices,
        default=AvailabilityType.OPEN_DATES,
        verbose_name="Tipo de Disponibilidad"
    )
    
    available_from = models.DateField(null=True, blank=True)
    available_until = models.DateField(null=True, blank=True)
    departure_date = models.DateField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)

    # Relación con etiquetas
    tags = models.ManyToManyField(
        Tag, 
        blank=True, 
        related_name="tour_packages", 
        verbose_name="Etiquetas"
    )

    # Gestión
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    is_recurring = models.BooleanField(default=False, verbose_name="Recurrente")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _apply_commission(self, price):
        """Aplica la comisión a un precio"""
        if price is None:
            return None
        price_decimal = Decimal(str(price))
        commission_rate_decimal = Decimal(str(self.commission_rate))
        final = price_decimal * (Decimal('1') + commission_rate_decimal)
        return final.quantize(Decimal('0.01'))

    def _calculate_prices_with_commission(self):
        """Calcula todos los precios con comisión aplicada"""
        # Precio base con comisión
        if self.base_price:
            self.final_price = self._apply_commission(self.base_price)
        
        # Variaciones de precio con comisión
        if self.price_variations:
            variations_with_commission = {}
            for key, price in self.price_variations.items():
                variations_with_commission[key] = float(
                    self._apply_commission(price)
                )
            self.price_variations_with_commission = variations_with_commission
        else:
            self.price_variations_with_commission = None
        
        # Servicios adicionales con comisión
        if self.extra_services:
            services_with_commission = {}
            for key, price in self.extra_services.items():
                services_with_commission[key] = float(
                    self._apply_commission(price)
                )
            self.extra_services_with_commission = services_with_commission
        else:
            self.extra_services_with_commission = None

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar disponibilidad
        if self.availability_type == self.AvailabilityType.OPEN_DATES:
            if not self.available_from or not self.available_until:
                raise ValidationError({
                    'available_from': 'Debe especificar el rango completo.',
                    'available_until': 'Debe especificar el rango completo.'
                })
            
            if self.available_from >= self.available_until:
                raise ValidationError({
                    'available_until': 'La fecha final debe ser posterior.'
                })
            
            if self.available_from < timezone.now().date():
                raise ValidationError({
                    'available_from': 'No puede ser en el pasado.'
                })
                
            self.departure_date = None
            self.departure_time = None
        
        elif self.availability_type == self.AvailabilityType.SPECIFIC_DATE:
            if not self.departure_date:
                raise ValidationError({
                    'departure_date': 'Debe especificar la fecha de salida.'
                })
            
            if self.departure_date < timezone.now().date():
                raise ValidationError({
                    'departure_date': 'No puede ser en el pasado.'
                })
                
            self.available_from = None
            self.available_until = None
        
        # Validar capacidad
        if self.current_bookings > self.group_size:
            raise ValidationError({
                'current_bookings': f'No puede superar {self.group_size}.'
            })

    def save(self, *args, **kwargs):
        """Sobrescribir save para calcular precios con comisión"""
        # Calcular todos los precios con comisión
        self._calculate_prices_with_commission()
        
        # Ejecutar validaciones
        try:
            self.full_clean()
        except ValidationError as e:
            raise e
        
        super().save(*args, **kwargs)

    @property
    def available_slots(self):
        return self.group_size - self.current_bookings
    
    @property
    def is_available(self):
        return self.available_slots > 0
    
    @property
    def is_full(self):
        return self.current_bookings >= self.group_size

    @property
    def main_image(self):
        try:
            return self.images.filter(is_main_image=True).first()
        except:
            return self.images.first()

    @property
    def average_rating(self):
        from django.db.models import Avg
        result = self.reviews.filter(is_approved=True).aggregate(Avg('rating'))
        return result['rating__avg'] or 0

    @property
    def rating_count(self):
        return self.reviews.filter(is_approved=True).count()

    def increment_bookings(self, count=1):
        if self.current_bookings + count <= self.group_size:
            self.current_bookings += count
            self.save()
            return True
        return False

    def decrement_bookings(self, count=1):
        if self.current_bookings - count >= 0:
            self.current_bookings -= count
            self.save()
            return True
        return False

    def __str__(self):
        if self.availability_type == self.AvailabilityType.SPECIFIC_DATE:
            return f"{self.title} - {self.departure_date}"
        return f"{self.title} (Fechas abiertas)"

    class Meta:
        verbose_name = "Paquete Turístico"
        verbose_name_plural = "Paquetes Turísticos"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['state_destination']),
            models.Index(fields=['availability_type', 'departure_date']),
            models.Index(fields=['operator', 'created_at']),
        ]

class PackageImage(models.Model):
    tour_package = models.ForeignKey(
        TourPackage, 
        on_delete=models.CASCADE, 
        related_name="images"
    )
    image = models.ImageField(upload_to='tour_packages/%Y/%m/%d/')
    is_main_image = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    def save(self, *args, **kwargs):
        if self.is_main_image:
            PackageImage.objects.filter(
                tour_package=self.tour_package, 
                is_main_image=True
            ).update(is_main_image=False)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['order', 'id']

class Review(models.Model):
    tour_package = models.ForeignKey(
        TourPackage, 
        on_delete=models.CASCADE, 
        related_name="reviews"
    )
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="reviews",
        limit_choices_to={'role': 'TRAVELER'}
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200, default="Reseña sin título")
    comment = models.TextField()
    operator_response = models.TextField(blank=True)
    response_date = models.DateTimeField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tour_package', 'traveler')
        ordering = ['-created_at']