from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser, OperatorProfile, TravelerProfile

class UserRegistrationSerializer(RegisterSerializer):
    role = serializers.ChoiceField(
        choices=CustomUser.Role.choices,
        required=True,
        error_messages={
            'required': 'El rol es requerido.',
            'invalid_choice': 'Rol inválido. Debe ser TRAVELER u OPERATOR.'
        }
    )
    
    # Campos para operadores
    organization_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rif_type = serializers.ChoiceField(
        choices=OperatorProfile.RifType.choices, 
        required=False, 
        allow_blank=True,
        allow_null=True
    )
    rif_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    # Campos para viajeros
    cedula = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    can_contact_by_whatsapp = serializers.BooleanField(required=False, default=True)

    def validate(self, data):
        """
        Validación personalizada para asegurar que los campos específicos del rol estén presentes
        """
        role = data.get('role')
        
        if role == 'OPERATOR':
            if not data.get('organization_name'):
                raise serializers.ValidationError({
                    'organization_name': 'El nombre de la organización es requerido para operadores.'
                })
            if not data.get('rif_type'):
                raise serializers.ValidationError({
                    'rif_type': 'El tipo de RIF es requerido para operadores.'
                })
            if not data.get('rif_number'):
                raise serializers.ValidationError({
                    'rif_number': 'El número de RIF es requerido para operadores.'
                })
                
        elif role == 'TRAVELER':
            if not data.get('cedula'):
                raise serializers.ValidationError({
                    'cedula': 'La cédula es requerida para viajeros.'
                })
            if not data.get('phone_number'):
                raise serializers.ValidationError({
                    'phone_number': 'El número de teléfono es requerido para viajeros.'
                })
        
        return data

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        role = self.validated_data.get('role')
        
        cleaned_data = {
            'username': data.get('username', ''),
            'password1': data.get('password1', ''),
            'email': data.get('email', ''),
            'role': role,
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        }
        
        # Solo añadir campos específicos del rol
        if role == 'OPERATOR':
            cleaned_data.update({
                'organization_name': self.validated_data.get('organization_name', ''),
                'rif_type': self.validated_data.get('rif_type', ''),
                'rif_number': self.validated_data.get('rif_number', ''),
            })
        elif role == 'TRAVELER':
            cleaned_data.update({
                'cedula': self.validated_data.get('cedula', ''),
                'phone_number': self.validated_data.get('phone_number', ''),
                'can_contact_by_whatsapp': self.validated_data.get('can_contact_by_whatsapp', True),
            })
        
        return cleaned_data

    def save(self, request):
        user = super().save(request)
        user.is_active = True
        user.role = self.cleaned_data.get('role')
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.save()

        # Crear el perfil correspondiente
        if user.role == 'OPERATOR':
            OperatorProfile.objects.create(
                user=user,
                organization_name=self.cleaned_data.get('organization_name', ''),
                rif_type=self.cleaned_data.get('rif_type', ''),
                rif_number=self.cleaned_data.get('rif_number', '')
            )
        elif user.role == 'TRAVELER':
            TravelerProfile.objects.create(
                user=user,
                cedula=self.cleaned_data.get('cedula', ''),
                phone_number=self.cleaned_data.get('phone_number', ''),
                can_contact_by_whatsapp=self.cleaned_data.get('can_contact_by_whatsapp', True)
            )
        
        return user

class OperatorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorProfile
        fields = ['organization_name', 'social_media_link', 'rif_type', 'rif_number', 'status']

class TravelerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelerProfile
        fields = ['cedula', 'phone_number', 'can_contact_by_whatsapp']

class UserProfileSerializer(serializers.ModelSerializer):
    operator_profile = OperatorProfileSerializer(read_only=True)
    traveler_profile = TravelerProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'operator_profile', 'traveler_profile']