from rest_framework import serializers
from .models import TourPackage, PackageImage, Tag, Review, IncludedItem 

class TagSerializer(serializers.ModelSerializer):
    """ Traduce las etiquetas a un formato simple. """
    class Meta:
        model = Tag
        fields = ['id', 'name']

class PackageImageSerializer(serializers.ModelSerializer):
    """ Traduce la información de las imágenes del paquete. """
    class Meta:
        model = PackageImage
        fields = ['id', 'image', 'is_main_image']

class ReviewSerializer(serializers.ModelSerializer):
    """ Traduce las reseñas, mostrando el nombre del viajero. """
    # Usamos StringRelatedField para obtener el __str__ del modelo relacionado (el email del usuario)
    traveler_name = serializers.StringRelatedField(source='traveler', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'tour_package', 'traveler', 'traveler_name', 'rating', 'comment', 'created_at']
        # Hacemos 'traveler' de solo escritura, se asignará automáticamente desde la vista.
        read_only_fields = ['traveler']

class TourPackageSerializer(serializers.ModelSerializer):
    """
    Serializer principal para los paquetes. Muestra datos anidados al leer
    y acepta IDs de etiquetas al escribir.
    """
    # Al LEER (GET), estos campos mostrarán los datos completos anidados.
    tags = TagSerializer(many=True, read_only=True)
    images = PackageImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    operator_name = serializers.StringRelatedField(source='operator.organization_name', read_only=True)
    what_is_included = serializers.StringRelatedField(many=True, read_only=True)
    what_is_not_included_ids = serializers.PrimaryKeyRelatedField(queryset=IncludedItem.objects.all(), source='what_is_not_included', many=True, write_only=True, required=False)
    itinerary = serializers.JSONField(required=False)
    variable_prices = serializers.JSONField(required=False)
    commission_rate = serializers.DecimalField(max_digits=5, decimal_places=2, default=0.10, required=False)
    final_price = serializers.ReadOnlyField()
    status = serializers.CharField(read_only=True)

    state_origin = serializers.CharField(required=False, default="Distrito Capital")
    specific_origin = serializers.CharField(required=False, default="Por definir")
    state_destination = serializers.CharField(required=False, default="Miranda") 
    specific_destination = serializers.CharField(required=False, default="Por definir")
    environment = serializers.CharField(required=False)
    group_size = serializers.IntegerField(required=False, default=10)
    highlights = serializers.JSONField(required=False)

    # Al ESCRIBIR (POST/PUT), este campo aceptará una lista de IDs de tags.
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source='tags', many=True, write_only=True, required=False
    )
    # Aceptará una lista de IDs de items incluidos.
    included_item_ids = serializers.PrimaryKeyRelatedField(
        queryset=IncludedItem.objects.all(), source='what_is_included', many=True, write_only=True, required=False
    )

    class Meta:
        model = TourPackage
        fields = [
            'id', 'title', 'description', 
            'state_origin', 'specific_origin', 'state_destination', 'specific_destination',
            'base_price', 'commission_rate', 'final_price', 'duration_days',
            'operator', 'operator_name', 'tags', 'images', 'reviews', 
            'what_is_included', 'what_is_not_included', 'itinerary', 
            'meeting_point', 'meeting_time', 'variable_prices', 'status',
            'tag_ids', 'included_item_ids', 'what_is_not_included_ids', 
            'is_active', 'is_recurring',
            'environment', 'group_size', 'highlights'
        ]
        read_only_fields = ['operator', 'reviews', 'final_price', 'status']

class IncludedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncludedItem
        fields = ['id', 'name']