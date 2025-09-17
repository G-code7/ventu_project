from rest_framework import serializers
from .models import TourPackage, PackageImage, Tag
from users.models import OperatorProfile

# -----------------------------------------------------------------------------
# Serializers para Modelos Relacionados
# -----------------------------------------------------------------------------

class PackageImageSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar las imágenes de un paquete.
    """
    class Meta:
        model = PackageImage
        fields = ['id', 'image']


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar las etiquetas.
    """
    class Meta:
        model = Tag
        fields = ['id', 'name']

# -----------------------------------------------------------------------------
# Serializer Principal para TourPackage
# -----------------------------------------------------------------------------

class TourPackageSerializer(serializers.ModelSerializer):
    """
    Serializer mejorado para TourPackage que incluye datos de modelos relacionados.
    """
    # Campo calculado para obtener el nombre de la organización del operador.
    operator_name = serializers.SerializerMethodField()
    
    # Campo anidado para mostrar la lista de imágenes del paquete.
    # 'many=True' indica que es una relación de uno a muchos.
    # 'source="images"' le dice a DRF que busque el related_name 'images' en el modelo.
    images = PackageImageSerializer(many=True, read_only=True, source='packageimage_set')
    
    # Campo para mostrar los nombres de las etiquetas de forma simple.
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = TourPackage
        # Actualizamos la lista de campos para incluir nuestros nuevos campos inteligentes.
        fields = [
            'id', 
            'title', 
            'description', 
            'location', 
            'price', 
            'duration_days',
            'operator_name', # Nuestro nuevo campo calculado
            'tags',          # Nuestra nueva lista de etiquetas
            'images',        # Nuestra nueva lista de imágenes
        ]
        
    def get_operator_name(self, obj):
        """
        Esta función se llama automáticamente para el campo 'operator_name'.
        'obj' es la instancia del TourPackage que se está serializando.
        """
        # Navegamos a través de las relaciones para obtener el nombre de la organización
        if obj.operator and obj.operator.user:
            return obj.operator.user.organization_name
        return "Operador Desconocido"

