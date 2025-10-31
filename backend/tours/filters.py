import django_filters
from .models import TourPackage

class TourPackageFilter(django_filters.FilterSet):
    # Filtros de precio
    base_price__lte = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')
    base_price__gte = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    
    # Filtro por tags
    tags = django_filters.CharFilter(field_name='tags__name', lookup_expr='icontains')
    
    # Filtro por ubicación (búsqueda parcial)
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    
    # Filtro por destino
    destination = django_filters.CharFilter(field_name='destination', lookup_expr='icontains')
    
    # Filtro por duración
    duration_days = django_filters.NumberFilter(field_name='duration_days')
    duration_days__gte = django_filters.NumberFilter(field_name='duration_days', lookup_expr='gte')
    duration_days__lte = django_filters.NumberFilter(field_name='duration_days', lookup_expr='lte')
    
    # Filtro por servicios adicionales
    has_extra_services = django_filters.BooleanFilter(
        field_name='extra_services', 
        lookup_expr='isnull', 
        exclude=True
    )

    class Meta:
        model = TourPackage
        fields = {
            'operator': ['exact'],
            'is_active': ['exact'],
            'is_recurring': ['exact'],
            'environment': ['exact'],
            'availability_type': ['exact'],
        }