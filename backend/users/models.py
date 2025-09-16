from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """
    Extendemos el modelo de Usuario de Django para añadir roles.
    Esto nos da toda la seguridad y funcionalidades de Django gratis.
    """
    class Role(models.TextChoices):
        TRAVELER = "TRAVELER", "Viajero"
        OPERATOR = "OPERATOR", "Operador"
        ADMIN = "ADMIN", "Administrador"

    # Campos que todos los usuarios comparten
    email = models.EmailField(unique=True, verbose_name="Correo Electrónico")
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.TRAVELER, verbose_name="Rol")
    
    # Hacemos que el email sea el campo de login en lugar del username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # 'username' sigue siendo requerido internamente

    def __str__(self):
        return self.email


class TravelerProfile(models.Model):
    """
    Perfil con información específica para los usuarios con rol de Viajero.
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True, related_name="traveler_profile", verbose_name="Usuario")
    cedula = models.CharField(max_length=20, blank=True, verbose_name="Cédula")
    phone_number = models.CharField(max_length=20, blank=True, verbose_name="Número de Teléfono")
    can_contact_by_whatsapp = models.BooleanField(default=True, verbose_name="¿Contactar por WhatsApp?")
    
    def __str__(self):
        return f"Perfil de Viajero de {self.user.get_full_name() or self.user.email}"
    
    class Meta:
        verbose_name = "Perfil de Viajero"
        verbose_name_plural = "Perfiles de Viajero"


class OperatorProfile(models.Model):
    """
    Perfil con información específica para los usuarios con rol de Operador.
    """
    class RifType(models.TextChoices):
        VENEZOLANO = "V", "V"
        EXTRANJERO = "E", "E"
        JURIDICO = "J", "J"
        GUBERNAMENTAL = "G", "G"
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True, related_name="operator_profile", verbose_name="Usuario")
    organization_name = models.CharField(max_length=200, verbose_name="Nombre de la Organización")
    rif_type = models.CharField(max_length=1, choices=RifType.choices, verbose_name="Tipo de RIF")
    rif_number = models.CharField(max_length=20, verbose_name="Número de RIF")
    social_media_link = models.URLField(blank=True, verbose_name="Enlace a Red Social Principal")

    def __str__(self):
        return f"Perfil de Operador de {self.organization_name}"

    class Meta:
        verbose_name = "Perfil de Operador"
        verbose_name_plural = "Perfiles de Operador"
        unique_together = ('rif_type', 'rif_number') # Hacemos que el RIF sea único
