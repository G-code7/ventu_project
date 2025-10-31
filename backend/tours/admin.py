from django.contrib import admin
from django.utils.html import format_html
from .models import Tag, TourPackage, PackageImage, Review, IncludedItem

class PackageImageInline(admin.TabularInline):
    model = PackageImage
    extra = 1
    readonly_fields = ('get_image_preview',)

    def get_image_preview(self, obj):
        if obj.image:
            return format_html(f'<img src="{obj.image.url}" width="150" height="auto" />')
        return "No hay imagen"
    get_image_preview.short_description = "Previsualización"

@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    list_display = ('title', 'operator', 'state_origin', 'state_destination', 'base_price', 'is_active')
    list_filter = ('is_active', 'state_origin', 'state_destination', 'operator', 'environment')
    search_fields = ('title', 'description', 'state_origin', 'state_destination')
    
    # Campos para edición detallada
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'description', 'operator', 'status', 'is_active')
        }),
        ('Ubicación', {
            'fields': ('state_origin', 'specific_origin', 'state_destination', 'specific_destination')
        }),
        ('Precios', {
            'fields': ('base_price', 'commission_rate', 'price_variations', 'extra_services')
        }),
        ('Detalles Logísticos', {
            'fields': ('meeting_point', 'meeting_time', 'duration_days', 'environment', 'group_size', 'current_bookings')
        }),
        ('Disponibilidad', {
            'fields': ('availability_type', 'available_from', 'available_until', 'departure_date', 'departure_time')
        }),
        ('Contenido', {
            'fields': ('highlights', 'itinerary', 'tags', 'what_is_included', 'what_is_not_included')
        }),
    )
    
    filter_horizontal = ('tags', 'what_is_included', 'what_is_not_included')
    inlines = [PackageImageInline]

    actions = ['mark_as_published']
    
    def mark_as_published(self, request, queryset):
        updated = queryset.update(status='PUBLISHED')
        self.message_user(request, f'{updated} tours marcados como publicados.')
    mark_as_published.short_description = "Marcar los tours seleccionados como PUBLICADOS"

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('tour_package', 'traveler', 'rating', 'created_at')
    list_filter = ('rating', 'tour_package')
    search_fields = ('comment', 'traveler__user__email')

admin.site.register(IncludedItem)
admin.site.register(Tag)