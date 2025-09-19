from rest_framework import serializers
from .models import TourPackage, PackageImage, Tag, Review
from users.models import CustomUser

# --- Serializers Anidados ---

class PackageImageSerializer(serializers.ModelSerializer):
    """ Traduce solo la información esencial de las imágenes. """
    class Meta:
        model = PackageImage
        fields = ['id', 'image', 'is_main_image']

class TagSerializer(serializers.ModelSerializer):
    """ Traduce las etiquetas a un formato simple. """
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ReviewSerializer(serializers.ModelSerializer):
    """
    Traduce las reseñas, mostrando el nombre del viajero en lugar de solo su ID.
    """
    traveler_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'tour_package', 'traveler_name', 'rating', 'comment', 'created_at']
    
    def get_traveler_name(self, obj):
        # obj.traveler es la instancia de CustomUser
        if obj.traveler:
            return obj.traveler.get_full_name() or obj.traveler.username
        return "Anónimo"


# --- Serializer Principal ---

class TourPackageSerializer(serializers.ModelSerializer):
    """
    Serializer principal y más complejo. Traduce los TourPackage
    e incluye datos anidados de sus imágenes y etiquetas.
    """
    operator_name = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    images = PackageImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = TourPackage
        fields = [
            'id', 'title', 'description', 'location', 'destination', 'price', 
            'duration_days', 'operator', 'operator_name', 'tags', 'images', 'reviews',
            'what_is_included', 'itinerary' # Añadimos más campos útiles
        ]
        # Hacemos que el operador sea de solo lectura en la API, se asignará automáticamente.
        read_only_fields = ['operator']

    def get_operator_name(self, obj):
        # CORRECCIÓN: obj.operator es el CustomUser. Accedemos a su perfil relacionado.
        if hasattr(obj.operator, 'operatorprofile') and obj.operator.operatorprofile.organization_name:
            return obj.operator.operatorprofile.organization_name
        # Si no tiene nombre de organización, devolvemos su nombre completo o username.
        return obj.operator.get_full_name() or obj.operator.username

