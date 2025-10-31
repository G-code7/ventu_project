from django.contrib import admin
from django.utils.html import format_html
from .models import Booking, BookingStatusHistory

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_code',
        'traveler_name',
        'tour_title',
        'travel_date',
        'total_amount',
        'status_badge',
        'created_at'
    )
    
    list_filter = (
        'status',
        'travel_date',
        'created_at',
        'tour_package__state_destination'
    )
    
    search_fields = (
        'booking_code',
        'contact_email',
        'contact_name',
        'traveler__email',
        'tour_package__title'
    )
    
    readonly_fields = (
        'booking_code',
        'created_at',
        'updated_at',
        'paid_at',
        'cancelled_at',
        'total_people'
    )
    
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'booking_code',
                'tour_package',
                'traveler',
                'travel_date',
                'status'
            )
        }),
        ('Detalles de Reserva', {
            'fields': (
                'tickets_detail',
                'tickets_prices',
                'selected_extras',
                'extras_prices',
            )
        }),
        ('Cálculos', {
            'fields': (
                'subtotal_tickets',
                'subtotal_extras',
                'total_amount',
                'commission_amount',
                'operator_amount',
                'commission_rate',
                'total_people'
            )
        }),
        ('Contacto', {
            'fields': (
                'contact_name',
                'contact_email',
                'contact_phone',
                'special_requests'
            )
        }),
        ('Pago', {
            'fields': (
                'payment_id',
                'payment_method',
                'paid_at'
            )
        }),
        ('Cancelación', {
            'fields': (
                'cancelled_at',
                'cancellation_reason'
            )
        }),
        ('Auditoría', {
            'fields': (
                'created_at',
                'updated_at'
            )
        }),
    )
    
    def traveler_name(self, obj):
        return obj.traveler.get_full_name() or obj.traveler.username
    traveler_name.short_description = 'Viajero'
    
    def tour_title(self, obj):
        return obj.tour_package.title
    tour_title.short_description = 'Tour'
    
    def status_badge(self, obj):
        colors = {
            'PENDING': '#FFA500',
            'CONFIRMED': '#28A745',
            'CANCELLED': '#DC3545',
            'COMPLETED': '#17A2B8',
            'REFUNDED': '#6C757D'
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'
    
    actions = ['mark_as_confirmed', 'mark_as_completed']
    
    @admin.action(description='Marcar como Confirmadas')
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.filter(status='PENDING').update(status='CONFIRMED')
        self.message_user(request, f'{updated} reservas marcadas como confirmadas.')
    
    @admin.action(description='Marcar como Completadas')
    def mark_as_completed(self, request, queryset):
        updated = queryset.filter(status='CONFIRMED').update(status='COMPLETED')
        self.message_user(request, f'{updated} reservas marcadas como completadas.')

@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('booking', 'from_status', 'to_status', 'changed_by', 'created_at')
    list_filter = ('from_status', 'to_status', 'created_at')
    search_fields = ('booking__booking_code', 'notes')
    readonly_fields = ('created_at',)