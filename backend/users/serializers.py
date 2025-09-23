from rest_framework import serializers
from .models import CustomUser, OperatorProfile, TravelerProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Maneja el registro de nuevos usuarios, diferenciando entre roles
    y creando el perfil apropiado.
    """
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    
    # Campos extra del perfil de operador
    organization_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    rif_type = serializers.CharField(write_only=True, required=False, allow_blank=True)
    rif_number = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'username', 'first_name', 'last_name', 'password', 'password2', 
            'role', 'organization_name', 'rif_type', 'rif_number'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        
        if data.get('role') == 'OPERATOR':
            if not data.get('organization_name') or not data.get('rif_type') or not data.get('rif_number'):
                raise serializers.ValidationError("Para operadores, se requiere nombre de organización, tipo y número de RIF.")
        
        return data

    def create(self, validated_data):
        # Extraemos los datos del perfil
        organization_name = validated_data.pop('organization_name', None)
        rif_type = validated_data.pop('rif_type', None)
        rif_number = validated_data.pop('rif_number', None)
        validated_data.pop('password2')

        # create_user se encarga de hashear la contraseña
        user = CustomUser.objects.create_user(**validated_data)
        user.is_active = True
        user.save()

        # Creamos el perfil basado en el rol
        if user.role == 'OPERATOR':
            OperatorProfile.objects.create(
                user=user,
                organization_name=organization_name,
                rif_type=rif_type,
                rif_number=rif_number
            )
        elif user.role == 'TRAVELER':
            TravelerProfile.objects.create(user=user)
        
        return user

# --- Serializers para visualizar perfiles ---

class OperatorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorProfile
        fields = ['organization_name', 'social_media_link', 'rif_type', 'rif_number', 'status']

class TravelerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelerProfile
        fields = ['id_card', 'phone_number', 'can_be_contacted_by_whatsapp']

class UserProfileSerializer(serializers.ModelSerializer):
    operatorprofile = OperatorProfileSerializer(read_only=True)
    travelerprofile = TravelerProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'operatorprofile', 'travelerprofile']