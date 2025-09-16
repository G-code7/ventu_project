from django.contrib import admin
from .models import CustomUser, TravelerProfile, OperatorProfile

# Le decimos al admin que muestre estos modelos en su interfaz
admin.site.register(CustomUser)
admin.site.register(TravelerProfile)
admin.site.register(OperatorProfile)
