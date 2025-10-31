from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser, OperatorProfile, TravelerProfile


class UserRegistrationSerializer(RegisterSerializer):
    """
    Serializer mejorado para registro de usuarios con selección de rol
    
    Cambios:
    - role ahora es ChoiceField con validación explícita
    - Validación mejorada de campos requeridos según rol
    - Mensajes de error más claros
    """
    
    role = serializers.ChoiceField(
        choices=['TRAVELER', 'OPERATOR'],
        default='TRAVELER',
        help_text='Rol del usuario: TRAVELER (viajero) u OPERATOR (operador turístico)',
        error_messages={
            'invalid_choice': 'El rol debe ser TRAVELER u OPERATOR',
        }
    )
    
    # Campos del operador (opcionales por defecto)
    organization_name = serializers.CharField(
        required=False, 
        allow_blank=True,
        max_length=200,
        help_text='Nombre de la organización (requerido para operadores)'
    )
    rif_type = serializers.CharField(
        required=False, 
        allow_blank=True,
        help_text='Tipo de RIF (requerido para operadores)'
    )
    rif_number = serializers.CharField(
        required=False, 
        allow_blank=True,
        max_length=20,
        help_text='Número de RIF (requerido para operadores)'
    )

    def validate(self, attrs):
        """
        Validación cruzada: si el rol es OPERATOR, los campos del RIF son obligatorios
        """
        attrs = super().validate(attrs)
        
        role = attrs.get('role', 'TRAVELER')
        
        # Si es operador, validar campos requeridos
        if role == 'OPERATOR':
            if not attrs.get('organization_name'):
                raise serializers.ValidationError({
                    'organization_name': 'El nombre de la organización es requerido para operadores'
                })
            
            if not attrs.get('rif_type'):
                raise serializers.ValidationError({
                    'rif_type': 'El tipo de RIF es requerido para operadores'
                })
            
            if not attrs.get('rif_number'):
                raise serializers.ValidationError({
                    'rif_number': 'El número de RIF es requerido para operadores'
                })
        
        return attrs

    def get_cleaned_data(self):
        """
        Obtener datos limpios para guardar el usuario
        """
        data = super().get_cleaned_data()
        data.update({
            'role': self.validated_data.get('role', 'TRAVELER'),
            'organization_name': self.validated_data.get('organization_name', ''),
            'rif_type': self.validated_data.get('rif_type', ''),
            'rif_number': self.validated_data.get('rif_number', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        })
        return data

    def save(self, request):
        """
        Guardar el usuario con el rol correspondiente y crear el perfil adecuado
        """
        user = super().save(request)
        
        # Asegurar que el usuario esté activo
        user.is_active = True
        
        # Asignar el rol explícitamente
        user.role = self.cleaned_data.get('role', 'TRAVELER')
        
        # Asignar nombres
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        
        user.save()

        # Crear el perfil correspondiente según el rol
        if user.role == 'OPERATOR':
            OperatorProfile.objects.create(
                user=user,
                organization_name=self.cleaned_data.get('organization_name', ''),
                rif_type=self.cleaned_data.get('rif_type', ''),
                rif_number=self.cleaned_data.get('rif_number', ''),
                status='PENDING'  # Los operadores necesitan aprobación
            )
        elif user.role == 'TRAVELER':
            TravelerProfile.objects.create(user=user)
        
        return user


class OperatorProfileSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de operador"""
    
    class Meta:
        model = OperatorProfile
        fields = ['organization_name', 'social_media_link', 'rif_type', 'rif_number', 'status']
        read_only_fields = ['status']  # El status solo lo cambia el admin


class TravelerProfileSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de viajero"""
    
    class Meta:
        model = TravelerProfile
        fields = ['cedula', 'phone_number', 'can_contact_by_whatsapp']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer completo para el perfil del usuario
    Incluye perfiles anidados según el rol
    """
    operatorprofile = OperatorProfileSerializer(read_only=True)
    travelerprofile = TravelerProfileSerializer(read_only=True)
    
    # Campos adicionales útiles
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'full_name',
            'role',
            'role_display', 
            'operatorprofile', 
            'travelerprofile'
        ]
        read_only_fields = ['id', 'email', 'role']  # El rol no se puede cambiar después
    
    def get_full_name(self, obj):
        """Obtener nombre completo del usuario"""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username