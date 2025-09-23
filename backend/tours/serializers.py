from rest_framework import serializers
from .models import TourPackage, PackageImage, Tag, Review
# Quitamos la importación de 'users.models' que no se usa aquí para mantener el código limpio.

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
    
    # Al ESCRIBIR (POST/PUT), este campo aceptará una lista de IDs de tags.
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source='tags', many=True, write_only=True, required=False
    )

    class Meta:
        model = TourPackage
        fields = [
            'id', 'title', 'description', 'location', 'destination', 
            'price', 'duration_days', 'operator', 'operator_name', 
            'tags', 'images', 'reviews', 'what_is_included', 'itinerary', 
            'meeting_point', 'meeting_time', 'tag_ids'
        ]
        # El operador y las reseñas no se pueden asignar/modificar a través de este endpoint directamente.
        read_only_fields = ['operator', 'reviews']