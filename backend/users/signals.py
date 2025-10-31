from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, TravelerProfile, OperatorProfile


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Crear perfil automáticamente cuando se crea un usuario
    """
    if created:
        if instance.role == CustomUser.Role.TRAVELER:
            TravelerProfile.objects.get_or_create(
                user=instance,
                defaults={
                    'cedula': '',
                    'phone_number': '',
                    'can_contact_by_whatsapp': True
                }
            )
        elif instance.role == CustomUser.Role.OPERATOR:
            OperatorProfile.objects.get_or_create(
                user=instance,
                defaults={
                    'organization_name': '',
                    'rif_type': 'V',
                    'rif_number': '',
                    'status': 'PENDING'
                }
            )