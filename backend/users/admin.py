from django.contrib import admin
from .models import CustomUser, TravelerProfile, OperatorProfile

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')

@admin.register(OperatorProfile)
class OperatorProfileAdmin(admin.ModelAdmin):
    list_display = ('organization_name', 'user_email', 'status', 'rif_type', 'rif_number')
    list_filter = ('status', 'rif_type')
    search_fields = ('organization_name', 'user__email', 'rif_number')
    
    # Acción personalizada para aprobar operadores
    actions = ['approve_operators']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Correo del Usuario'

    @admin.action(description='Marcar operadores seleccionados como Activos')
    def approve_operators(self, request, queryset):
        queryset.update(status='ACTIVE')

admin.site.register(TravelerProfile)