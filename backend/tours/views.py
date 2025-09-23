from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import TourPackage, Tag, Review, PackageImage
from .serializers import TourPackageSerializer, TagSerializer, ReviewSerializer
from .permissions import IsOwnerOrReadOnly
from .filters import TourPackageFilter

class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.filter(is_active=True)
    serializer_class = TourPackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filterset_class = TourPackageFilter

    def perform_create(self, serializer):
        serializer.save(operator=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            tour_package = TourPackage.objects.get(id=response.data['id'])
            if request.FILES.get('main_image'):
                PackageImage.objects.create(tour_package=tour_package, image=request.FILES['main_image'], is_main_image=True)
            for image_file in request.FILES.getlist('gallery_images'):
                PackageImage.objects.create(tour_package=tour_package, image=image_file, is_main_image=False)
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