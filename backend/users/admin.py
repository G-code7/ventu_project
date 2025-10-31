from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, TravelerProfile, OperatorProfile


class TravelerProfileInline(admin.StackedInline):
    """
    Inline para mostrar el perfil de viajero dentro del usuario
    """
    model = TravelerProfile
    can_delete = False
    verbose_name = 'Perfil de Viajero'
    verbose_name_plural = 'Perfil de Viajero'
    fields = ('cedula', 'phone_number', 'can_contact_by_whatsapp')
    
    def has_add_permission(self, request, obj=None):
        # Solo mostrar si el usuario es viajero
        if obj and obj.role == 'TRAVELER':
            return True
        return False


class OperatorProfileInline(admin.StackedInline):
    """
    Inline para mostrar el perfil de operador dentro del usuario
    """
    model = OperatorProfile
    can_delete = False
    verbose_name = 'Perfil de Operador'
    verbose_name_plural = 'Perfil de Operador'
    fields = ('organization_name', 'rif_type', 'rif_number', 'social_media_link', 'status')
    
    def has_add_permission(self, request, obj=None):
        # Solo mostrar si el usuario es operador
        if obj and obj.role == 'OPERATOR':
            return True
        return False


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Admin personalizado para CustomUser con segmentación por rol
    """
    list_display = (
        'email', 
        'username', 
        'first_name', 
        'last_name', 
        'role', 
        'role_badge',
        'is_active',
        'is_staff', 
        'date_joined'
    )
    list_filter = ('role', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # Pestañas organizadas
    fieldsets = (
        ('Información de Autenticación', {
            'fields': ('email', 'username', 'password')
        }),
        ('Información Personal', {
            'fields': ('first_name', 'last_name')
        }),
        ('Rol y Permisos', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Fechas Importantes', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    # Para crear usuarios nuevos
    add_fieldsets = (
        ('Información de Autenticación', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
        ('Información Personal', {
            'fields': ('first_name', 'last_name')
        }),
        ('Rol', {
            'fields': ('role',)
        }),
    )
    
    # Añadir los inlines según el rol
    inlines = []
    
    def get_inline_instances(self, request, obj=None):
        inline_instances = []
        
        if obj:
            if obj.role == 'TRAVELER':
                inline_instances.append(TravelerProfileInline(self.model, self.admin_site))
            elif obj.role == 'OPERATOR':
                inline_instances.append(OperatorProfileInline(self.model, self.admin_site))
        
        return inline_instances
    
    def role_badge(self, obj):
        """
        Mostrar un badge colorizado para el rol
        """
        colors = {
            'TRAVELER': '#3B82F6',  # Azul
            'OPERATOR': '#F59E0B',  # Naranja
            'ADMIN': '#EF4444',     # Rojo
        }
        
        color = colors.get(obj.role, '#6B7280')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_role_display()
        )
    
    role_badge.short_description = 'Badge'
    role_badge.admin_order_field = 'role'
    
    # Acciones personalizadas
    actions = ['activate_users', 'deactivate_users']
    
    @admin.action(description='✅ Activar usuarios seleccionados')
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} usuario(s) activado(s) exitosamente.')
    
    @admin.action(description='❌ Desactivar usuarios seleccionados')
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} usuario(s) desactivado(s) exitosamente.')


@admin.register(TravelerProfile)
class TravelerProfileAdmin(admin.ModelAdmin):
    """
    Admin para gestionar perfiles de viajeros
    """
    list_display = (
        'user_email', 
        'user_full_name', 
        'cedula', 
        'phone_number', 
        'can_contact_by_whatsapp',
        'user_is_active'
    )
    list_filter = ('can_contact_by_whatsapp', 'user__is_active')
    search_fields = (
        'user__email', 
        'user__first_name', 
        'user__last_name', 
        'cedula', 
        'phone_number'
    )
    
    readonly_fields = ('user',)
    
    fieldsets = (
        ('Usuario Asociado', {
            'fields': ('user',)
        }),
        ('Información de Contacto', {
            'fields': ('cedula', 'phone_number', 'can_contact_by_whatsapp')
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Correo'
    user_email.admin_order_field = 'user__email'
    
    def user_full_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username
    user_full_name.short_description = 'Nombre Completo'
    user_full_name.admin_order_field = 'user__first_name'
    
    def user_is_active(self, obj):
        return obj.user.is_active
    user_is_active.short_description = 'Activo'
    user_is_active.boolean = True
    user_is_active.admin_order_field = 'user__is_active'


@admin.register(OperatorProfile)
class OperatorProfileAdmin(admin.ModelAdmin):
    """
    Admin para gestionar perfiles de operadores
    """
    list_display = (
        'organization_name', 
        'user_email', 
        'status_badge',
        'rif_complete', 
        'user_full_name',
        'user_is_active'
    )
    list_filter = ('status', 'rif_type', 'user__is_active')
    search_fields = (
        'organization_name', 
        'user__email', 
        'user__first_name',
        'user__last_name',
        'rif_number'
    )
    
    readonly_fields = ('user',)
    
    fieldsets = (
        ('Usuario Asociado', {
            'fields': ('user',)
        }),
        ('Información de la Organización', {
            'fields': ('organization_name', 'social_media_link')
        }),
        ('Información Fiscal', {
            'fields': ('rif_type', 'rif_number')
        }),
        ('Estado de Verificación', {
            'fields': ('status',)
        }),
    )
    
    # Acción personalizada para aprobar operadores
    actions = ['approve_operators', 'suspend_operators', 'set_pending']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Correo del Usuario'
    user_email.admin_order_field = 'user__email'
    
    def user_full_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username
    user_full_name.short_description = 'Nombre del Usuario'
    user_full_name.admin_order_field = 'user__first_name'
    
    def user_is_active(self, obj):
        return obj.user.is_active
    user_is_active.short_description = 'Usuario Activo'
    user_is_active.boolean = True
    user_is_active.admin_order_field = 'user__is_active'
    
    def rif_complete(self, obj):
        return f"{obj.rif_type}-{obj.rif_number}"
    rif_complete.short_description = 'RIF Completo'
    rif_complete.admin_order_field = 'rif_number'
    
    def status_badge(self, obj):
        """
        Mostrar un badge colorizado para el estado
        """
        colors = {
            'PENDING': '#F59E0B',   # Naranja
            'ACTIVE': '#10B981',    # Verde
            'SUSPENDED': '#EF4444', # Rojo
        }
        
        icons = {
            'PENDING': '⏳',
            'ACTIVE': '✅',
            'SUSPENDED': '🚫',
        }
        
        color = colors.get(obj.status, '#6B7280')
        icon = icons.get(obj.status, '•')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 12px; font-size: 11px; font-weight: bold;">{} {}</span>',
            color,
            icon,
            obj.get_status_display()
        )
    
    status_badge.short_description = 'Estado'
    status_badge.admin_order_field = 'status'
    
    @admin.action(description='✅ Aprobar operadores seleccionados (Marcar como Activos)')
    def approve_operators(self, request, queryset):
        updated = queryset.update(status='ACTIVE')
        self.message_user(
            request, 
            f'{updated} operador(es) aprobado(s) exitosamente. '
            'Ahora pueden publicar paquetes turísticos.'
        )
    
    @admin.action(description='🚫 Suspender operadores seleccionados')
    def suspend_operators(self, request, queryset):
        updated = queryset.update(status='SUSPENDED')
        self.message_user(
            request, 
            f'{updated} operador(es) suspendido(s). '
            'Sus paquetes no serán visibles públicamente.'
        )
    
    @admin.action(description='⏳ Marcar como pendientes de revisión')
    def set_pending(self, request, queryset):
        updated = queryset.update(status='PENDING')
        self.message_user(request, f'{updated} operador(es) marcado(s) como pendientes.')


# Necesario importar para format_html
from django.utils.html import format_html


# Personalización del admin site
admin.site.site_header = "VENTU - Administración"
admin.site.site_title = "VENTU Admin"
admin.site.index_title = "Panel de Administración"