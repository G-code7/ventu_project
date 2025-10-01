from django.conf import settings
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import TourPackage, Tag, Review, PackageImage, IncludedItem
from .serializers import TourPackageSerializer, TagSerializer, ReviewSerializer, IncludedItemSerializer 
from .permissions import IsOwnerOrReadOnly
from .filters import TourPackageFilter

class TourPackageViewSet(viewsets.ModelViewSet):
    """
    Endpoint principal para tours - Maneja todos los paquetes con filtros y permisos
    """
    serializer_class = TourPackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filterset_class = TourPackageFilter

    def get_queryset(self):
        """
        Lógica de visibilidad CORREGIDA:
        - Operadores: ven TODOS sus paquetes (incluyendo DRAFTs)
        - Usuarios autenticados (no operadores): solo ven PUBLICADOS
        - Usuarios anónimos: solo ven PUBLICADOS y ACTIVOS
        """
        user = self.request.user
        
        # Para usuarios autenticados
        if user.is_authenticated:
            if hasattr(user, 'role') and user.role == 'OPERATOR':
                # Operadores ven todos sus paquetes
                queryset = TourPackage.objects.filter(operator=user)
                print(f"OPERATOR: Mostrando {queryset.count()} tours")
                return queryset
            else:
                # Usuarios normales (TRAVELER) solo ven publicados
                queryset = TourPackage.objects.filter(status='PUBLISHED', is_active=True)
                print(f"USER (TRAVELER): Mostrando {queryset.count()} tours")
                return queryset
        
        # Para usuarios anónimos - solo paquetes publicados y activos
        queryset = TourPackage.objects.filter(status='PUBLISHED', is_active=True)
        print(f"ANON: Mostrando {queryset.count()} tours")
        return queryset

    def perform_create(self, serializer):
        """Crea un paquete y lo marca como PUBLISHED automáticamente"""
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'OPERATOR':
            raise serializers.ValidationError("Solo los operadores pueden crear paquetes turísticos.")
        
        # Asegurarnos que se guarde como PUBLISHED
        serializer.save(operator=self.request.user, status='PUBLISHED')

    def create(self, request, *args, **kwargs):
        """Maneja la creación del paquete con imágenes"""
        # Validar y crear el paquete
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        tour_package = serializer.instance
        
        # Manejar imágenes principales
        if 'main_image' in request.FILES:
            PackageImage.objects.create(
                tour_package=tour_package, 
                image=request.FILES['main_image'], 
                is_main_image=True
            )

        # Manejar imágenes de galería
        if 'gallery_images' in request.FILES:
            for image_file in request.FILES.getlist('gallery_images'):
                PackageImage.objects.create(
                    tour_package=tour_package, 
                    image=image_file, 
                    is_main_image=False
                )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Maneja la actualización del paquete con imágenes"""
        response = super().update(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            tour_package = self.get_object()

            # Manejar imagen principal
            if 'main_image' in request.FILES:
                # Eliminar imagen principal anterior
                PackageImage.objects.filter(
                    tour_package=tour_package, 
                    is_main_image=True
                ).delete()
                # Crear nueva imagen principal
                PackageImage.objects.create(
                    tour_package=tour_package, 
                    image=request.FILES['main_image'], 
                    is_main_image=True
                )

            # Manejar imágenes de galería (se añaden, no reemplazan)
            if 'gallery_images' in request.FILES:
                for image_file in request.FILES.getlist('gallery_images'):
                    PackageImage.objects.create(
                        tour_package=tour_package, 
                        image=image_file, 
                        is_main_image=False
                    )

        return response

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(traveler=self.request.user)

class IncludedItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IncludedItem.objects.all()
    serializer_class = IncludedItemSerializer
    permission_classes = [permissions.AllowAny]

# Vista de diagnóstico 
class TourDiagnosticView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        tours = TourPackage.objects.all()
        data = []
        for tour in tours:
            data.append({
                'id': tour.id,
                'title': tour.title,
                'status': tour.status,
                'is_active': tour.is_active,
                'operator': tour.operator.email if tour.operator else None
            })
        return Response(data)