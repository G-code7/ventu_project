from django.contrib import admin
from django.utils.html import format_html
from .models import Tag, TourPackage, PackageImage, Review, IncludedItem

# -----------------------------------------------------------------------------
# Inline Admin Models
# -----------------------------------------------------------------------------

class PackageImageInline(admin.TabularInline):
    """
    Permite añadir y editar imágenes directamente desde la página de un TourPackage.
    'TabularInline' muestra los campos en un formato de tabla compacto.
    """
    model = PackageImage
    extra = 1  # Muestra por defecto 1 campo vacío para añadir una nueva imagen.
    readonly_fields = ('get_image_preview',) # Campo para previsualizar la imagen

    def get_image_preview(self, obj):
        if obj.image:
            return format_html(f'<img src="{obj.image.url}" width="150" height="auto" />')
        return "No hay imagen"
    get_image_preview.short_description = "Previsualización"

# -----------------------------------------------------------------------------
# Main Admin Models
# -----------------------------------------------------------------------------

@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    """
    Personalización de la vista de administración para el modelo TourPackage.
    """
    # Campos que se mostrarán en la lista principal de paquetes
    list_display = ('title', 'operator', 'location', 'price', 'is_active')
    
    # Filtros que aparecerán en la barra lateral derecha
    list_filter = ('is_active', 'location', 'operator')
    
    # Habilita un campo de búsqueda
    search_fields = ('title', 'description', 'location')
    
    # Añade la gestión de imágenes directamente en la página del paquete
    inlines = [PackageImageInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    Personalización para las reseñas.
    """
    list_display = ('tour_package', 'traveler', 'rating', 'created_at')
    list_filter = ('rating', 'tour_package')
    search_fields = ('comment', 'traveler__user__email')

# Registramos los modelos más simples de la forma tradicional
admin.site.register(IncludedItem)
admin.site.register(Tag)

