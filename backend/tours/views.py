from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import TourPackage, Tag, Review, PackageImage, IncludedItem
from .serializers import TourPackageSerializer, TagSerializer, ReviewSerializer, IncludedItemSerializer 
from .permissions import IsOwnerOrReadOnly
from .filters import TourPackageFilter

class TourPackageViewSet(viewsets.ModelViewSet):
    serializer_class = TourPackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filterset_class = TourPackageFilter

    def get_queryset(self):
        """
        Sobrescribimos para mostrar a los operadores sus paquetes inactivos,
        pero ocultarlos para el resto de usuarios.
        """
        user = self.request.user
        if user.is_authenticated and user.role == 'OPERATOR':
            # Si el usuario es un operador, le mostramos todos sus paquetes
            return TourPackage.objects.filter(operator=user)
        
        # Para todos los demás, solo mostramos los paquetes activos
        return TourPackage.objects.filter(is_active=True)

    def update(self, request, *args, **kwargs):
        """
        Sobrescribimos para manejar la actualización de imágenes.
        """
        # Primero, ejecutamos la lógica de actualización normal del ModelViewSet
        response = super().update(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            tour_package = self.get_object() # Obtenemos la instancia del paquete

            # 1. Manejar la imagen principal
            if 'main_image' in request.FILES:
                # Eliminamos la imagen principal anterior, si existe
                PackageImage.objects.filter(tour_package=tour_package, is_main_image=True).delete()
                # Creamos la nueva
                PackageImage.objects.create(
                    tour_package=tour_package, 
                    image=request.FILES['main_image'], 
                    is_main_image=True
                )

            # 2. Manejar las imágenes de la galería (las añade, no las reemplaza)
            # Para un reemplazo completo, primero se deberían borrar las anteriores.
            # Esta lógica es más simple y permite añadir más imágenes.
            if 'gallery_images' in request.FILES:
                for image_file in request.FILES.getlist('gallery_images'):
                    PackageImage.objects.create(
                        tour_package=tour_package, 
                        image=image_file, 
                        is_main_image=False
                    )

        return response

    def perform_create(self, serializer):
        """Asigna automáticamente el operador al usuario autenticado"""
        if self.request.user.role != 'OPERATOR':
            raise serializers.ValidationError("Solo los operadores pueden crear paquetes turísticos.")
        serializer.save(operator=self.request.user)

    def create(self, request, *args, **kwargs):
        """Maneja la creación con imágenes"""
        # Crear el paquete primero
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        tour_package = serializer.instance
        
        # Manejar imágenes después de crear el paquete
        if 'main_image' in request.FILES:
            PackageImage.objects.create(
                tour_package=tour_package, 
                image=request.FILES['main_image'], 
                is_main_image=True
            )

        if 'gallery_images' in request.FILES:
            for image_file in request.FILES.getlist('gallery_images'):
                PackageImage.objects.create(
                    tour_package=tour_package, 
                    image=image_file, 
                    is_main_image=False
                )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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
    """
    ViewSet para listar los ítems que pueden ser incluidos en un paquete.
    """
    queryset = IncludedItem.objects.all()
    serializer_class = IncludedItemSerializer # <-- Necesitaremos crear este serializer
    permission_classes = [permissions.AllowAny]
