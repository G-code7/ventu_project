from django.db import models
from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

# --- Modelos de Soporte / "Etiquetas" ---

class Tag(models.Model):
    """
    Modelo para etiquetas informativas (tags). Responde a tu pregunta sobre
    duración, tamaño de grupo, entorno, transporte, actividades, etc.
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

# --- Modelo Principal de Paquetes ---

class TourPackage(models.Model):
    """
    El modelo central que representa un paquete turístico.
    """
    # Precio final calculado con comisión incluida
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Precio Base",
        null=False,
        default=Decimal('0.00')
    )
    commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('0.10'),
        verbose_name="Tasa de Comisión"
    )
    
    # Propiedad en prueba!!!
    @property
    def final_price(self):
        """Calcular precio final con comisión"""
        if self.base_price is None:
            return Decimal('0.00')

    # Estado del paquete
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Borrador"
        PENDING = "PENDING", "Pendiente de Aprobación"
        PUBLISHED = "PUBLISHED", "Publicado"
        REJECTED = "REJECTED", "Rechazado"
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PUBLISHED
    )

    # Relación con el operador (usuario con rol 'OPERATOR')
    operator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="tour_packages",
        verbose_name="Operador Turístico",
        limit_choices_to={'role': 'OPERATOR'}
    )

    # Información básica
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(verbose_name="Descripción Larga")
    
    # Detalles Logísticos
    location = models.CharField(max_length=150, verbose_name="Ubicación (Región/Estado)")
    destination = models.CharField(max_length=150, verbose_name="Destino Específico")
    meeting_point = models.CharField(max_length=255, verbose_name="Lugar de Encuentro")
    meeting_time = models.TimeField(verbose_name="Hora de Encuentro")
    duration_days = models.PositiveIntegerField(default=1, verbose_name="Duración (días)")
    
    # Precio y Capacidad
    # price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Base (Adulto)")
    # Usamos JSONField para precios variables (niños, etc.) para máxima flexibilidad.
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
    itinerary = models.JSONField(
        blank=True, null=True, 
        verbose_name="Itinerario Detallado",
        help_text="Ejemplo: {'Día 1': 'Salida y llegada...', 'Día 2': 'Excursión...'}"
    )

    # Relación con las etiquetas. Un paquete puede tener muchas etiquetas.
    tags = models.ManyToManyField(Tag, blank=True, related_name="tour_packages", verbose_name="Etiquetas Informativas")

    # Gestión y estado
    is_active = models.BooleanField(default=True, verbose_name="Paquete Activo")
    is_recurring = models.BooleanField(default=False, verbose_name="Es Recurrente")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} por {self.operator.username}"

    class Meta:
        verbose_name = "Paquete Turístico"
        verbose_name_plural = "Paquetes Turísticos"
        ordering = ['-created_at']


class PackageImage(models.Model):
    """ Modelo para manejar una galería de imágenes por paquete. """
    tour_package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name="images", verbose_name="Paquete Turístico")
    image = models.ImageField(upload_to='tour_images/', verbose_name="Archivo de Imagen")
    is_main_image = models.BooleanField(default=False, verbose_name="Es Imagen Principal")
    
    def __str__(self):
        return f"Imagen para {self.tour_package.title}"


class Review(models.Model):
    """ Modelo para las reseñas y calificaciones (1 a 5 estrellas). """
    tour_package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name="reviews", verbose_name="Paquete Turístico")
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
    comment = models.TextField(verbose_name="Comentario")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reseña de {self.traveler.username} para {self.tour_package.title}"

    class Meta:
        # Un viajero solo puede dejar una reseña por paquete
        unique_together = ('tour_package', 'traveler')

