import django_filters
from django.db.models import Q
from .models import TourPackage
import unicodedata


class TourPackageFilter(django_filters.FilterSet):
    
    # Búsqueda general (destination en Hero)
    destination = django_filters.CharFilter(method='filter_destination')
    
    # Búsqueda por texto libre
    search = django_filters.CharFilter(method='filter_search')
    
    # Filtros específicos
    state_destination = django_filters.CharFilter(lookup_expr='iexact')
    max_price = django_filters.NumberFilter(field_name='final_price', lookup_expr='lte')
    min_price = django_filters.NumberFilter(field_name='final_price', lookup_expr='gte')
    
    tags = django_filters.CharFilter(method='filter_tags')
    environment = django_filters.CharFilter(field_name='environment', lookup_expr='iexact')
    
    duration_days = django_filters.NumberFilter()
    min_duration = django_filters.NumberFilter(field_name='duration_days', lookup_expr='gte')
    max_duration = django_filters.NumberFilter(field_name='duration_days', lookup_expr='lte')
    
    availability_type = django_filters.CharFilter(field_name='availability_type', lookup_expr='iexact')
    
    class Meta:
        model = TourPackage
        fields = []

    def normalize_text(self, text):
        """
        Normaliza texto removiendo acentos y convirtiendo a lowercase.
        
        Ejemplos:
        - "Choroní" → "choroni"
        - "MÉRIDA" → "merida"
        - "Los Roques" → "los roques"
        """
        if not text:
            return ""
        text = text.lower()
        nfd = unicodedata.normalize('NFD', text)
        without_accents = ''.join(
            char for char in nfd 
            if unicodedata.category(char) != 'Mn'
        )
        
        return without_accents.strip()

    def filter_destination(self, queryset, name, value):
        if not value:
            return queryset
        search_normalized = self.normalize_text(value)
        words = search_normalized.split()
        q_objects = Q()
        search_fields = [
            'title',
            'state_destination',
            'specific_destination',
            'state_origin',
            'specific_origin',
            'description'
        ]
        
        for word in words:
            word_q = Q()
            for field in search_fields:
                word_q |= Q(**{f'{field}__icontains': word})
            
            q_objects &= word_q
        
        filtered = queryset.filter(q_objects)
        
        if not filtered.exists():
            flexible_q = Q()
            for word in words:
                for field in search_fields:
                    flexible_q |= Q(**{f'{field}__icontains': word})
            
            filtered = queryset.filter(flexible_q)
        
        return filtered.distinct()

    def filter_search(self, queryset, name, value):
        """
        Búsqueda global (mismo comportamiento que destination).
        """
        return self.filter_destination(queryset, name, value)

    def filter_tags(self, queryset, name, value):
        """
        Filtrar por tags con tolerancia a mayúsculas/acentos.
        """
        if not value:
            return queryset
        
        tag_normalized = self.normalize_text(value)
        
        return queryset.filter(
            tags__name__icontains=value
        ).distinct()