# check_tours.py - Ejecutar después del reset
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ventu_api.settings')
django.setup()

from tours.models import TourPackage

print("=== VERIFICACIÓN DE TOURS ===")
print(f"Total de tours: {TourPackage.objects.count()}")

for tour in TourPackage.objects.all():
    print(f"ID: {tour.id}, Title: {tour.title}, Status: {tour.status}, Active: {tour.is_active}")

# Verificar por status
from django.db.models import Count
status_count = TourPackage.objects.values('status').annotate(count=Count('id'))
print("\nConteo por estado:")
for item in status_count:
    print(f"  {item['status']}: {item['count']}")