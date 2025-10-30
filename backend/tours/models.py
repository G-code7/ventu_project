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
    ROMANTIC = "ROMANTIC", "💝 Romántico"
    FAMILY = "FAMILY", "👨‍👩‍👧‍👦 Familiar"
    LUXURY = "LUXURY", "🌟 Lujo/Exclusivo"
    NATURE = "NATURE", "🌳 Naturaleza"
    BEACH = "BEACH", "🏖️ Playa"
    MOUNTAIN = "MOUNTAIN", "⛰️ Montaña"
    HISTORICAL = "HISTORICAL", "🏺 Histórico"
    GASTRONOMIC = "GASTRONOMIC", "🍴 Gastronómico"
    WELLNESS = "WELLNESS", "💆 Wellness"

class Tag(models.Model):
    """
    Modelo para etiquetas informativas (tags). 
    Creando un modelo separado, podemos añadir tantas etiquetas como queramos
    sin hacer el modelo TourPackage gigantesco. Es mucho más flexible.
    """
    name = models.CharField(max_length=50, unique=True, verbose_name="Nombre de la Etiqueta")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Etiqueta"
        verbose_name_plural = "Etiquetas"

class IncludedItem(models.Model):
    """Un ítem que puede estar incluido en un paquete (ej. Transporte, Almuerzo)."""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Ítem")
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Ítem Incluido"
        verbose_name_plural = "Ítems Incluidos"

class TourPackage(models.Model):
    """
    El modelo central que representa un paquete turístico.
    """
    # Disponibilidad - Date
    class AvailabilityType(models.TextChoices):
        OPEN_DATES = "OPEN_DATES", "Fechas Abiertas"
        SPECIFIC_DATE = "SPECIFIC_DATE", "Fecha Específica"
    
    # Estado del paquete
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
        help_text="Ej: Aeropuerto de Maiquetía, Terminal de La Bandera",
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
        help_text="Ej: Playa Colorada, Parque Nacional Morrocoy",
        default="Por definir"
    )

    # Precio y Comisión
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal('1.00'), message="El precio debe ser al menos $1.00")
        ],
        verbose_name="Precio Base",
        help_text="Precio base antes de comisiones"
    )
    
    commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('0.10'),
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('1.00'), message="La comisión no puede ser mayor al 100%")
        ],
        verbose_name="Tasa de Comisión"
    )
    
    final_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Precio Final (con comisión)",
        null=True,
        blank=True,
        editable=False
    )

    # Información básica
    title = models.CharField(max_length=200, verbose_name="Título", default="")
    description = models.TextField(verbose_name="Descripción Larga")
    
    # Relación con el operador
    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="tour_packages",
        verbose_name="Operador Turístico",
        limit_choices_to={'role': 'OPERATOR'}
    )

    # Estado del paquete
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

    # Capacidad - SOLO group_size
    group_size = models.PositiveIntegerField(
        default=10,
        verbose_name="Tamaño Máximo del Grupo",
        help_text="Número máximo de participantes",
        validators=[MinValueValidator(1)]
    )
    
    current_bookings = models.PositiveIntegerField(
        default=0,
        verbose_name="Reservas Actuales",
        help_text="Número de plazas reservadas"
    )

    # Precios variables
    variable_prices = models.JSONField(
        blank=True, null=True, 
        verbose_name="Precios Adicionales",
        help_text="Ejemplo: {'niños': 50.00, 'tercera_edad': 45.00}"
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
        blank=True, null=True,
        verbose_name="Puntos Destacados",
        help_text="Lista de puntos destacados, ej: ['Playa privada', 'Buffet incluido', 'Guía bilingüe']"
    )
    
    itinerary = models.JSONField(
        blank=True, null=True, 
        verbose_name="Itinerario Detallado",
        help_text="Ejemplo: {'Día 1': 'Salida y llegada...', 'Día 2': 'Excursión...'}"
    )

    # Disponibilidad
    availability_type = models.CharField(
        max_length=20,
        choices=AvailabilityType.choices,
        default=AvailabilityType.OPEN_DATES,
        verbose_name="Tipo de Disponibilidad"
    )
    
    # Para paquetes con fechas abiertas
    available_from = models.DateField(
        null=True,
        blank=True,
        verbose_name="Disponible Desde",
        help_text="Fecha de inicio del rango de disponibilidad"
    )
    
    available_until = models.DateField(
        null=True,
        blank=True,
        verbose_name="Disponible Hasta",
        help_text="Fecha de fin del rango de disponibilidad"
    )
    
    # Para paquetes con fecha específica
    departure_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Fecha de Salida",
        help_text="Fecha específica de salida del tour"
    )
    
    departure_time = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Hora de Salida",
        help_text="Hora específica de salida"
    )

    # Relación con las etiquetas
    tags = models.ManyToManyField(Tag, blank=True, related_name="tour_packages", verbose_name="Etiquetas Informativas")

    # Gestión y estado
    is_active = models.BooleanField(default=True, verbose_name="Paquete Activo")
    is_recurring = models.BooleanField(default=False, verbose_name="Es Recurrente")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validaciones personalizadas MEJORADAS"""
        super().clean()
        
        # Validar que al menos un tipo de fecha esté completo
        if self.availability_type == self.AvailabilityType.OPEN_DATES:
            if not self.available_from or not self.available_until:
                raise ValidationError({
                    'available_from': 'Para fechas abiertas, debe especificar el rango completo.',
                    'available_until': 'Para fechas abiertas, debe especificar el rango completo.'
                })
            
            if self.available_from >= self.available_until:
                raise ValidationError({
                    'available_until': 'La fecha final debe ser posterior a la fecha inicial.'
                })
            
            # Validar que no sea en el pasado
            if self.available_from < timezone.now().date():
                raise ValidationError({
                    'available_from': 'La fecha de inicio no puede ser en el pasado.'
                })
                
            # Limpiar campos de fecha específica
            self.departure_date = None
            self.departure_time = None
        
        elif self.availability_type == self.AvailabilityType.SPECIFIC_DATE:
            if not self.departure_date:
                raise ValidationError({
                    'departure_date': 'Debe especificar la fecha de salida.'
                })
            
            # Validar que la fecha específica no sea en el pasado
            if self.departure_date < timezone.now().date():
                raise ValidationError({
                    'departure_date': 'La fecha de salida no puede ser en el pasado.'
                })
                
            # Limpiar campos de fechas abiertas
            self.available_from = None
            self.available_until = None
        
        # Validar capacidad
        if self.current_bookings > self.group_size:
            raise ValidationError({
                'current_bookings': f'Las reservas actuales ({self.current_bookings}) no pueden superar el tamaño del grupo ({self.group_size}).'
            })

    def save(self, *args, **kwargs):
        """Sobrescribir save para calcular precio final y validar"""
        # Calcular precio final
        if self.base_price is not None and self.commission_rate is not None:
            base_price_decimal = Decimal(str(self.base_price))
            commission_rate_decimal = Decimal(str(self.commission_rate))
            self.final_price = base_price_decimal * (1 + commission_rate_decimal)
            self.final_price = self.final_price.quantize(Decimal('0.01'))
        else:
            self.final_price = self.base_price
        
        # Ejecutar validaciones
        try:
            self.full_clean()
        except ValidationError as e:
            # Si hay errores de validación, relanzarlos para que se muestren en el formulario
            raise e
        
        super().save(*args, **kwargs)

    @property
    def available_slots(self):
        """Calcula las plazas disponibles"""
        return self.group_size - self.current_bookings
    
    @property
    def is_available(self):
        """Verifica si hay disponibilidad"""
        return self.available_slots > 0
    
    @property
    def is_full(self):
        """Verifica si está lleno"""
        return self.current_bookings >= self.group_size

    @property
    def main_image(self):
        """Obtener la imagen principal del paquete"""
        try:
            return self.images.filter(is_main_image=True).first()
        except PackageImage.DoesNotExist:
            return self.images.first()

    @property
    def average_rating(self):
        """Calcular rating promedio"""
        from django.db.models import Avg
        result = self.reviews.filter(is_approved=True).aggregate(Avg('rating'))
        return result['rating__avg'] or 0

    @property
    def rating_count(self):
        """Contar reseñas aprobadas"""
        return self.reviews.filter(is_approved=True).count()

    def increment_bookings(self, count=1):
        """Método seguro para incrementar reservas"""
        if self.current_bookings + count <= self.group_size:
            self.current_bookings += count
            self.save()
            return True
        return False

    def decrement_bookings(self, count=1):
        """Método seguro para decrementar reservas"""
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
    """ Modelo para manejar una galería de imágenes por paquete. """
    tour_package = models.ForeignKey(
        TourPackage, 
        on_delete=models.CASCADE, 
        related_name="images", 
        verbose_name="Paquete Turístico"
    )
    image = models.ImageField(
        upload_to='tour_packages/%Y/%m/%d/', 
        verbose_name="Imagen"
    )
    is_main_image = models.BooleanField(
        default=False, 
        verbose_name="Es Imagen Principal"
    )
    caption = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name="Leyenda"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Orden"
    )
    
    def save(self, *args, **kwargs):
        """Asegurar que solo haya una imagen principal"""
        if self.is_main_image:
            # Quitar la imagen principal anterior
            PackageImage.objects.filter(
                tour_package=self.tour_package, 
                is_main_image=True
            ).update(is_main_image=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Imagen para {self.tour_package.title}"

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Imagen del Paquete"
        verbose_name_plural = "Imágenes del Paquete"

class Review(models.Model):
    """ Modelo para las reseñas y calificaciones (1 a 5 estrellas). """
    tour_package = models.ForeignKey(
        TourPackage, 
        on_delete=models.CASCADE, 
        related_name="reviews", 
        verbose_name="Paquete Turístico"
    )
    traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="reviews", 
        verbose_name="Viajero",
        limit_choices_to={'role': 'TRAVELER'}
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Calificación (1-5 estrellas)"
    )
    title = models.CharField(
        max_length=200, 
        verbose_name="Título de la Reseña",
        default="Reseña sin título"
    )
    comment = models.TextField(verbose_name="Comentario")
    
    # Respuesta del operador
    operator_response = models.TextField(
        blank=True,
        verbose_name="Respuesta del Operador"
    )
    response_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Respuesta"
    )
    
    # Aprobación de reseñas
    is_approved = models.BooleanField(
        default=False,
        verbose_name="Reseña Aprobada"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reseña de {self.traveler.username} para {self.tour_package.title}"

    class Meta:
        unique_together = ('tour_package', 'traveler')
        ordering = ['-created_at']
        verbose_name = "Reseña"
        verbose_name_plural = "Reseñas"