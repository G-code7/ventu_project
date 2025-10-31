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
    """Serializer optimizado para listar paquetes"""
    operator_name = serializers.CharField(source='operator.get_full_name', read_only=True)
    operator_username = serializers.CharField(source='operator.username', read_only=True)
    available_slots = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.ReadOnlyField()
    main_image = serializers.SerializerMethodField()
    
    # Campos de pricing optimizados
    display_price = serializers.SerializerMethodField()
    has_price_variations = serializers.SerializerMethodField()
    
    class Meta:
        model = TourPackage
        fields = [
            'id', 'title', 'state_destination', 'specific_destination',
            'base_price', 'final_price', 'commission_rate',
            'display_price', 'has_price_variations',
            'duration_days', 'operator_name', 'operator_username', 
            'available_slots', 'average_rating', 'rating_count', 
            'main_image', 'environment', 'status', 'is_active'
        ]
    
    def get_main_image(self, obj):
        main_image = obj.main_image
        if main_image:
            return PackageImageSerializer(main_image).data
        return None
    
    def get_display_price(self, obj):
        """Precio a mostrar en listados (con comisión)"""
        if obj.price_variations_with_commission:
            # Si hay variaciones, mostrar el precio más bajo
            prices = [float(p) for p in obj.price_variations_with_commission.values()]
            return min(prices) if prices else float(obj.final_price or 0)
        return float(obj.final_price or 0)
    
    def get_has_price_variations(self, obj):
        """Indica si tiene variaciones de precio"""
        return bool(obj.price_variations_with_commission)

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
    
    # Validaciones de precios
    def validate_price_variations(self, value):
        """Valida que price_variations tenga formato correcto"""
        if value:
            if not isinstance(value, dict):
                raise serializers.ValidationError(
                    "Las variaciones de precio deben ser un objeto JSON"
                )
            
            for key, price in value.items():
                try:
                    price_float = float(price)
                    if price_float < 0:
                        raise serializers.ValidationError(
                            f"El precio para '{key}' no puede ser negativo"
                        )
                except (ValueError, TypeError):
                    raise serializers.ValidationError(
                        f"Precio inválido para '{key}'"
                    )
        
        return value
    
    def validate_extra_services(self, value):
        """Valida que extra_services tenga formato correcto"""
        if value:
            if not isinstance(value, dict):
                raise serializers.ValidationError(
                    "Los servicios adicionales deben ser un objeto JSON"
                )
            
            for key, price in value.items():
                try:
                    price_float = float(price)
                    if price_float < 0:
                        raise serializers.ValidationError(
                            f"El precio para '{key}' no puede ser negativo"
                        )
                except (ValueError, TypeError):
                    raise serializers.ValidationError(
                        f"Precio inválido para '{key}'"
                    )
        
        return value
    
    def validate_base_price(self, value):
        if value < Decimal('1.00'):
            raise serializers.ValidationError(
                "El precio base debe ser al menos $1.00"
            )
        return value
    
    def validate_commission_rate(self, value):
        if value < Decimal('0.00') or value > Decimal('1.00'):
            raise serializers.ValidationError(
                "La comisión debe estar entre 0% y 100%"
            )
        return value
    
    def validate_duration_days(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "La duración debe ser al menos 1 día"
            )
        return value
    
    def validate_group_size(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "El tamaño del grupo debe ser al menos 1"
            )
        return value
    
    def validate_current_bookings(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Las reservas no pueden ser negativas"
            )
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        # Validar capacidad
        group_size = data.get('group_size', getattr(self.instance, 'group_size', None))
        current_bookings = data.get('current_bookings', getattr(self.instance, 'current_bookings', 0))
        
        if group_size and current_bookings > group_size:
            raise serializers.ValidationError({
                'current_bookings': f'Las reservas ({current_bookings}) no pueden exceder el tamaño del grupo ({group_size})'
            })
        
        # Validar disponibilidad
        availability_type = data.get('availability_type', getattr(self.instance, 'availability_type', None))
        
        if availability_type == TourPackage.AvailabilityType.OPEN_DATES:
            available_from = data.get('available_from')
            available_until = data.get('available_until')
            
            if not available_from or not available_until:
                raise serializers.ValidationError({
                    'available_from': 'Especifique el rango completo',
                    'available_until': 'Especifique el rango completo'
                })
            
            if available_from >= available_until:
                raise serializers.ValidationError({
                    'available_until': 'Debe ser posterior a la fecha inicial'
                })
        
        elif availability_type == TourPackage.AvailabilityType.SPECIFIC_DATE:
            departure_date = data.get('departure_date')
            
            if not departure_date:
                raise serializers.ValidationError({
                    'departure_date': 'Especifique la fecha de salida'
                })
        
        return data
    
    class Meta:
        model = TourPackage
        fields = [
            # Información básica
            'id', 'title', 'description', 'status', 'is_active', 'is_recurring',
            
            # Origen y destino
            'state_origin', 'specific_origin', 'state_destination', 'specific_destination',
            
            # Precios (SIN comisión - lo que ingresa el operador)
            'base_price', 'commission_rate', 
            'price_variations', 'extra_services',
            
            # Precios CON comisión (calculados automáticamente - solo lectura)
            'final_price', 
            'price_variations_with_commission',
            'extra_services_with_commission',
            
            # Información del operador
            'operator', 'operator_name', 'operator_username',
            
            # Detalles logísticos
            'meeting_point', 'meeting_time', 'duration_days', 'environment',
            'group_size', 'current_bookings',
            
            # Disponibilidad
            'availability_type', 'available_from', 'available_until',
            'departure_date', 'departure_time',
            
            # Contenido
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
            'final_price', 'price_variations_with_commission', 
            'extra_services_with_commission',
            'operator_name', 'operator_username',
            'available_slots', 'average_rating', 'rating_count',
            'is_available', 'is_full', 'created_at', 'updated_at'
        ]

class TourPackageCreateSerializer(TourPackageDetailSerializer):
    """Serializer específico para creación con validaciones adicionales"""
    
    def create(self, validated_data):
        # Extraer relaciones many-to-many
        tags = validated_data.pop('tags', [])
        included_items = validated_data.pop('what_is_included', [])
        not_included_items = validated_data.pop('what_is_not_included', [])
        
        with transaction.atomic():
            # Crear el paquete (los precios con comisión se calculan automáticamente)
            tour_package = TourPackage.objects.create(**validated_data)
            
            # Establecer relaciones
            tour_package.tags.set(tags)
            tour_package.what_is_included.set(included_items)
            tour_package.what_is_not_included.set(not_included_items)
            
            return tour_package
    
    def update(self, instance, validated_data):
        # Extraer relaciones many-to-many
        tags = validated_data.pop('tags', None)
        included_items = validated_data.pop('what_is_included', None)
        not_included_items = validated_data.pop('what_is_not_included', None)
        
        with transaction.atomic():
            # Actualizar campos (los precios con comisión se recalculan automáticamente)
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()
            
            # Actualizar relaciones
            if tags is not None:
                instance.tags.set(tags)
            if included_items is not None:
                instance.what_is_included.set(included_items)
            if not_included_items is not None:
                instance.what_is_not_included.set(not_included_items)
            
            return instance

class ImageUploadSerializer(serializers.ModelSerializer):
    """Serializer para subir imágenes"""
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
        validated_data['traveler'] = self.context['request'].user
        validated_data['tour_package_id'] = self.context['view'].kwargs.get('tour_package_pk')
        return super().create(validated_data)

class TourPackageStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas"""
    total_packages = serializers.IntegerField()
    published_packages = serializers.IntegerField()
    draft_packages = serializers.IntegerField()
    active_packages = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_bookings = serializers.IntegerField()