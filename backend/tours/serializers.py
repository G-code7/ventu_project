# tours/serializers.py
from rest_framework import serializers
from django.db import transaction
from .models import TourPackage, PackageImage, Review, Tag, IncludedItem
from decimal import Decimal

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class IncludedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncludedItem
        fields = ['id', 'name']

class PackageImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PackageImage
        fields = ['id', 'image', 'image_url', 'is_main_image', 'caption', 'order']
        read_only_fields = ['image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class ReviewSerializer(serializers.ModelSerializer):
    traveler_name = serializers.CharField(source='traveler.get_full_name', read_only=True)
    traveler_username = serializers.CharField(source='traveler.username', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'traveler', 'traveler_name', 'traveler_username', 'rating', 
            'title', 'comment', 'operator_response', 'response_date', 
            'is_approved', 'created_at'
        ]
        read_only_fields = ['traveler_name', 'traveler_username', 'response_date', 'created_at']

class TourPackageListSerializer(serializers.ModelSerializer):
    """Serializer para listar paquetes (mínima información)"""
    operator_name = serializers.CharField(source='operator.get_full_name', read_only=True)
    operator_username = serializers.CharField(source='operator.username', read_only=True)
    available_slots = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.ReadOnlyField()
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = TourPackage
        fields = [
            'id', 'title', 'state_destination', 'specific_destination',
            'base_price', 'final_price', 'duration_days', 'operator_name',
            'operator_username', 'available_slots', 'average_rating',
            'rating_count', 'main_image', 'environment', 'status', 'is_active'
        ]
    
    def get_main_image(self, obj):
        main_image = obj.main_image
        if main_image:
            return PackageImageSerializer(main_image).data
        return None

class TourPackageDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalle de paquetes"""
    # Campos relacionados
    images = PackageImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    what_is_included = IncludedItemSerializer(many=True, read_only=True)
    what_is_not_included = IncludedItemSerializer(many=True, read_only=True)
    
    # Campos calculados
    operator_name = serializers.CharField(source='operator.get_full_name', read_only=True)
    operator_username = serializers.CharField(source='operator.username', read_only=True)
    available_slots = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    # Campos para escritura (IDs)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags',
        write_only=True,
        required=False
    )
    included_item_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=IncludedItem.objects.all(),
        source='what_is_included',
        write_only=True,
        required=False
    )
    not_included_item_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=IncludedItem.objects.all(),
        source='what_is_not_included',
        write_only=True,
        required=False
    )
    
    # Validación de precios
    def validate_base_price(self, value):
        if value < Decimal('1.00'):
            raise serializers.ValidationError("El precio base debe ser al menos $1.00")
        return value
    
    def validate_commission_rate(self, value):
        if value < Decimal('0.00') or value > Decimal('1.00'):
            raise serializers.ValidationError("La tasa de comisión debe estar entre 0% y 100%")
        return value
    
    def validate_duration_days(self, value):
        if value < 1:
            raise serializers.ValidationError("La duración debe ser de al menos 1 día")
        return value
    
    def validate_group_size(self, value):
        if value < 1:
            raise serializers.ValidationError("El tamaño del grupo debe ser al menos 1")
        return value
    
    def validate_current_bookings(self, value):
        if value < 0:
            raise serializers.ValidationError("Las reservas actuales no pueden ser negativas")
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        # Validar que current_bookings no exceda group_size
        group_size = data.get('group_size', getattr(self.instance, 'group_size', None))
        current_bookings = data.get('current_bookings', getattr(self.instance, 'current_bookings', 0))
        
        if group_size and current_bookings > group_size:
            raise serializers.ValidationError({
                'current_bookings': f'Las reservas actuales ({current_bookings}) no pueden exceder el tamaño del grupo ({group_size})'
            })
        
        # Validar disponibilidad de fechas
        availability_type = data.get('availability_type', getattr(self.instance, 'availability_type', None))
        
        if availability_type == TourPackage.AvailabilityType.OPEN_DATES:
            available_from = data.get('available_from')
            available_until = data.get('available_until')
            
            if not available_from or not available_until:
                raise serializers.ValidationError({
                    'available_from': 'Para fechas abiertas, debe especificar el rango completo',
                    'available_until': 'Para fechas abiertas, debe especificar el rango completo'
                })
            
            if available_from >= available_until:
                raise serializers.ValidationError({
                    'available_until': 'La fecha final debe ser posterior a la fecha inicial'
                })
        
        elif availability_type == TourPackage.AvailabilityType.SPECIFIC_DATE:
            departure_date = data.get('departure_date')
            
            if not departure_date:
                raise serializers.ValidationError({
                    'departure_date': 'Para fecha específica, debe especificar la fecha de salida'
                })
        
        return data
    
    class Meta:
        model = TourPackage
        fields = [
            # Información básica
            'id', 'title', 'description', 'status', 'is_active', 'is_recurring',
            
            # Origen y destino
            'state_origin', 'specific_origin', 'state_destination', 'specific_destination',
            
            # Precios
            'base_price', 'commission_rate', 'final_price', 'variable_prices',
            
            # Información del operador
            'operator', 'operator_name', 'operator_username',
            
            # Detalles logísticos
            'meeting_point', 'meeting_time', 'duration_days', 'environment',
            'group_size', 'current_bookings',
            
            # Disponibilidad
            'availability_type', 'available_from', 'available_until',
            'departure_date', 'departure_time',
            
            # Contenido e itinerario
            'highlights', 'itinerary',
            
            # Campos calculados
            'available_slots', 'average_rating', 'rating_count', 
            'is_available', 'is_full',
            
            # Relaciones (lectura)
            'images', 'reviews', 'tags', 'what_is_included', 'what_is_not_included',
            
            # Relaciones (escritura)
            'tag_ids', 'included_item_ids', 'not_included_item_ids',
            
            # Auditoría
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'final_price', 'operator_name', 'operator_username',
            'available_slots', 'average_rating', 'rating_count',
            'is_available', 'is_full', 'created_at', 'updated_at'
        ]

class TourPackageCreateSerializer(TourPackageDetailSerializer):
    """Serializer específico para creación con validaciones adicionales"""
    
    def create(self, validated_data):
        # Extraer datos de relaciones many-to-many
        tags = validated_data.pop('tags', [])
        included_items = validated_data.pop('what_is_included', [])
        not_included_items = validated_data.pop('what_is_not_included', [])
        
        with transaction.atomic():
            # Crear el paquete
            tour_package = TourPackage.objects.create(**validated_data)
            
            # Establecer relaciones many-to-many
            tour_package.tags.set(tags)
            tour_package.what_is_included.set(included_items)
            tour_package.what_is_not_included.set(not_included_items)
            
            return tour_package
    
    def update(self, instance, validated_data):
        # Extraer datos de relaciones many-to-many
        tags = validated_data.pop('tags', None)
        included_items = validated_data.pop('what_is_included', None)
        not_included_items = validated_data.pop('what_is_not_included', None)
        
        with transaction.atomic():
            # Actualizar campos del modelo
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()
            
            # Actualizar relaciones si se proporcionaron
            if tags is not None:
                instance.tags.set(tags)
            if included_items is not None:
                instance.what_is_included.set(included_items)
            if not_included_items is not None:
                instance.what_is_not_included.set(not_included_items)
            
            return instance

class ImageUploadSerializer(serializers.ModelSerializer):
    """Serializer específico para subir imágenes"""
    class Meta:
        model = PackageImage
        fields = ['id', 'image', 'is_main_image', 'caption', 'order']
    
    def create(self, validated_data):
        tour_package_id = self.context['view'].kwargs.get('tour_package_pk')
        validated_data['tour_package_id'] = tour_package_id
        return super().create(validated_data)

class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear reseñas"""
    class Meta:
        model = Review
        fields = ['id', 'rating', 'title', 'comment', 'created_at']
        read_only_fields = ['created_at']
    
    def create(self, validated_data):
        # Asignar automáticamente el viajero desde el request
        validated_data['traveler'] = self.context['request'].user
        validated_data['tour_package_id'] = self.context['view'].kwargs.get('tour_package_pk')
        return super().create(validated_data)

class TourPackageStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de paquetes"""
    total_packages = serializers.IntegerField()
    published_packages = serializers.IntegerField()
    draft_packages = serializers.IntegerField()
    active_packages = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_bookings = serializers.IntegerField()

# Serializers para filtros y búsquedas
class TourPackageFilterSerializer(serializers.Serializer):
    """Serializer para validar parámetros de filtro"""
    state_destination = serializers.CharField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    duration_min = serializers.IntegerField(required=False, min_value=1)
    duration_max = serializers.IntegerField(required=False, min_value=1)
    environment = serializers.CharField(required=False)
    availability_type = serializers.CharField(required=False)
    departure_date = serializers.DateField(required=False)
    tags = serializers.CharField(required=False)  # IDs separados por comas
    operator = serializers.IntegerField(required=False)
    is_active = serializers.BooleanField(required=False, default=True)
    
    def validate_min_price(self, value):
        if value and value < Decimal('0.00'):
            raise serializers.ValidationError("El precio mínimo no puede ser negativo")
        return value
    
    def validate_max_price(self, value):
        if value and value < Decimal('0.00'):
            raise serializers.ValidationError("El precio máximo no puede ser negativo")
        return value

class SearchSerializer(serializers.Serializer):
    """Serializer para búsqueda"""
    q = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False)
    sort_by = serializers.ChoiceField(
        choices=[
            ('price_asc', 'Precio: Menor a Mayor'),
            ('price_desc', 'Precio: Mayor a Menor'),
            ('duration_asc', 'Duración: Corta a Larga'),
            ('duration_desc', 'Duración: Larga a Corta'),
            ('rating_desc', 'Mejor Calificados'),
            ('newest', 'Más Recientes'),
        ],
        required=False,
        default='newest'
    )