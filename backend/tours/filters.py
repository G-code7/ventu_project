import django_filters
from .models import TourPackage

class TourPackageFilter(django_filters.FilterSet):
    # Filtro para precio menor o igual a un valor
    price__lte = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    # Filtro para precio mayor o igual a un valor
    price__gte = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    
    # Filtro para buscar por el nombre de la etiqueta (ignorando mayúsculas/minúsculas)
    tags__name = django_filters.CharFilter(field_name='tags__name', lookup_expr='icontains')

    class Meta:
        model = TourPackage
        # Campos por los que se puede filtrar con coincidencia exacta
        fields = ['location', 'operator', 'duration_days']