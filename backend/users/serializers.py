from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser, OperatorProfile, TravelerProfile

class UserRegistrationSerializer(RegisterSerializer):
    role = serializers.CharField(max_length=10)
    organization_name = serializers.CharField(required=False, allow_blank=True)
    rif_type = serializers.CharField(required=False, allow_blank=True)
    rif_number = serializers.CharField(required=False, allow_blank=True)

    def get_cleaned_data(self):
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
        user = super().save(request)
        user.is_active = True
        user.role = self.cleaned_data.get('role')
        user.first_name = self.cleaned_data.get('first_name')
        user.last_name = self.cleaned_data.get('last_name')
        user.save()

        if user.role == 'OPERATOR':
            OperatorProfile.objects.create(
                user=user,
                organization_name=self.cleaned_data.get('organization_name'),
                rif_type=self.cleaned_data.get('rif_type'),
                rif_number=self.cleaned_data.get('rif_number')
            )
        elif user.role == 'TRAVELER':
            TravelerProfile.objects.create(user=user)
        
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
    operatorprofile = OperatorProfileSerializer(read_only=True)
    travelerprofile = TravelerProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'operatorprofile', 'travelerprofile']