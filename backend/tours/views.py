from rest_framework import viewsets
from .models import TourPackage
from .serializers import TourPackageSerializer

class TourPackageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite ver los paquetes turísticos.
    """
    queryset = TourPackage.objects.filter(is_active=True)
    serializer_class = TourPackageSerializer
