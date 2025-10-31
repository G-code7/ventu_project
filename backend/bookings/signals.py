from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Booking

@receiver(post_save, sender=Booking)
def send_booking_notifications(sender, instance, created, **kwargs):
    """
    Enviar emails cuando se crea o actualiza una reserva
    """
    if created:
        # Email al viajero
        send_mail(
            subject=f'Confirmación de Reserva - {instance.booking_code}',
            message=f'''
            ¡Gracias por tu reserva en VENTU!
            
            Código de reserva: {instance.booking_code}
            Tour: {instance.tour_package.title}
            Fecha: {instance.travel_date}
            Total: ${instance.total_amount}
            
            Te contactaremos pronto con más detalles.
            
            Saludos,
            Equipo VENTU
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.contact_email],
            fail_silently=True,
        )
        
        # Email al operador
        send_mail(
            subject=f'Nueva Reserva - {instance.booking_code}',
            message=f'''
            ¡Tienes una nueva reserva!
            
            Código: {instance.booking_code}
            Tour: {instance.tour_package.title}
            Viajero: {instance.contact_name}
            Fecha del viaje: {instance.travel_date}
            Personas: {instance.total_people}
            Total: ${instance.total_amount}
            Tu ganancia: ${instance.operator_amount}
            
            Ingresa al dashboard para ver más detalles.
            
            Saludos,
            Equipo VENTU
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.tour_package.operator.email],
            fail_silently=True,
        )