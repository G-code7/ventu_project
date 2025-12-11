from django.conf import settings
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import logging

from .models import TourPackage, Tag, Review, PackageImage, IncludedItem
from .serializers import (
    TourPackageListSerializer, 
    TourPackageDetailSerializer,
    TourPackageCreateSerializer,
    TagSerializer, 
    ReviewSerializer, 
    IncludedItemSerializer,
    PackageImageSerializer,
    ReviewCreateSerializer,
    TourPackageStatsSerializer
)
from .permissions import IsOwnerOrReadOnly
from .filters import TourPackageFilter
from users.serializers import UserProfileSerializer 

logger = logging.getLogger(__name__)

class TourPackageViewSet(viewsets.ModelViewSet):
    """
    Endpoint principal para tours - Maneja todos los paquetes con filtros y permisos
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filterset_class = TourPackageFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'specific_destination', 'tags__name']
    ordering_fields = ['base_price', 'duration_days', 'created_at', 'final_price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Usa diferentes serializers según la acción"""
        if self.action == 'list':
            return TourPackageListSerializer
        elif self.action == 'retrieve':
            return TourPackageDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TourPackageCreateSerializer
        return TourPackageDetailSerializer

    def get_queryset(self):
        """
        Optimiza las consultas con select_related y prefetch_related
        Los operadores ven todos sus paquetes, otros usuarios solo los publicados
        """
        user = self.request.user
        
        # Base queryset optimizado
        queryset = TourPackage.objects.select_related(
            'operator'
        ).prefetch_related(
            'tags', 
            'images', 
            'reviews',
            'reviews__traveler',
            'what_is_included',
            'what_is_not_included'
        )

        # Si es operador y está viendo sus propios paquetes, mostrar todos
        if user.is_authenticated and user.role == 'OPERATOR':
            # Para listar, si no se especifica otro filtro, mostrar solo los del operador
            if self.action == 'list' and not self.request.query_params.get('operator'):
                queryset = queryset.filter(operator=user)
            # Permitir ver todos los paquetes si se especifica otro operador en filtros
        else:
            # Usuarios no autenticados o no operadores solo ven publicados y activos
            queryset = queryset.filter(
                status='PUBLISHED', 
                is_active=True
            )

        return queryset

    def perform_create(self, serializer):
        """Crea un paquete y lo marca como PUBLISHED automáticamente"""
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'OPERATOR':
            raise serializers.ValidationError("Solo los operadores pueden crear paquetes turísticos.")
        
        serializer.save(operator=self.request.user, status='PUBLISHED')

    def create(self, request, *args, **kwargs):
        """Maneja la creación del paquete con imágenes - OPTIMIZADO"""
        try:
            # Validar y crear el paquete
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            tour_package = serializer.instance
            
            # Manejar imágenes de manera más eficiente
            self._handle_package_images(tour_package, request)
            
            # Devolver el paquete completo con relaciones
            detail_serializer = TourPackageDetailSerializer(
                tour_package, 
                context=self.get_serializer_context()
            )
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                detail_serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
            
        except Exception as e:
            logger.error(f"Error creando paquete turístico: {e}")
            return Response(
                {'error': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Maneja la actualización del paquete con imágenes - OPTIMIZADO"""
        try:
            response = super().update(request, *args, **kwargs)
            
            if response.status_code == status.HTTP_200_OK:
                tour_package = self.get_object()
                self._handle_package_images(tour_package, request, update=True)
                
                # Devolver datos actualizados
                detail_serializer = TourPackageDetailSerializer(
                    tour_package, 
                    context=self.get_serializer_context()
                )
                response.data = detail_serializer.data
            
            return response
            
        except Exception as e:
            logger.error(f"Error actualizando paquete turístico: {e}")
            return Response(
                {'error': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _handle_package_images(self, tour_package, request, update=False):
        """Manejo centralizado de imágenes - EVITA DUPLICACIÓN DE CÓDIGO"""
        # Manejar imagen principal
        if 'main_image' in request.FILES:
            if update:
                # Eliminar imagen principal anterior solo si se está actualizando
                PackageImage.objects.filter(
                    tour_package=tour_package, 
                    is_main_image=True
                ).delete()
            
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

    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        """Endpoint específico para subir imágenes"""
        tour_package = self.get_object()
        self._handle_package_images(tour_package, request)
        return Response({'status': 'Imágenes subidas correctamente'})

    @action(detail=True, methods=['post'])
    def increment_bookings(self, request, pk=None):
        """Incrementar reservas de forma segura"""
        tour_package = self.get_object()
        count = request.data.get('count', 1)
        
        try:
            count = int(count)
            if count <= 0:
                return Response(
                    {'error': 'El conteo debe ser un número positivo'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if tour_package.increment_bookings(count):
                return Response({
                    'success': True, 
                    'current_bookings': tour_package.current_bookings,
                    'available_slots': tour_package.available_slots
                })
            else:
                return Response({
                    'success': False, 
                    'error': 'No hay suficientes plazas disponibles',
                    'available_slots': tour_package.available_slots
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError:
            return Response(
                {'error': 'El conteo debe ser un número válido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def decrement_bookings(self, request, pk=None):
        """Decrementar reservas de forma segura"""
        tour_package = self.get_object()
        count = request.data.get('count', 1)
        
        try:
            count = int(count)
            if count <= 0:
                return Response(
                    {'error': 'El conteo debe ser un número positivo'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if tour_package.decrement_bookings(count):
                return Response({
                    'success': True, 
                    'current_bookings': tour_package.current_bookings,
                    'available_slots': tour_package.available_slots
                })
            else:
                return Response({
                    'success': False, 
                    'error': 'No se pueden decrementar las reservas por debajo de 0',
                    'current_bookings': tour_package.current_bookings
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError:
            return Response(
                {'error': 'El conteo debe ser un número válido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def my_packages(self, request):
        """Paquetes del operador actual (incluyendo borradores)"""
        if not request.user.is_authenticated or request.user.role != 'OPERATOR':
            raise PermissionDenied("Solo los operadores pueden ver sus paquetes")
        
        packages = self.get_queryset().filter(operator=request.user)
        page = self.paginate_queryset(packages)
        
        if page is not None:
            serializer = TourPackageListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TourPackageListSerializer(packages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de paquetes"""
        if not request.user.is_authenticated or request.user.role != 'OPERATOR':
            raise PermissionDenied("Solo los operadores pueden ver estadísticas")
        
        user_packages = TourPackage.objects.filter(operator=request.user)
        
        stats = {
            'total_packages': user_packages.count(),
            'published_packages': user_packages.filter(status='PUBLISHED').count(),
            'draft_packages': user_packages.filter(status='DRAFT').count(),
            'active_packages': user_packages.filter(is_active=True).count(),
            'total_revenue': user_packages.aggregate(
                total=Sum('base_price')
            )['total'] or 0,
            'average_rating': user_packages.aggregate(
                avg_rating=Avg('reviews__rating')
            )['avg_rating'] or 0,
            'total_bookings': user_packages.aggregate(
                total=Sum('current_bookings')
            )['total'] or 0,
        }
        
        serializer = TourPackageStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def destinations_stats(self, request):
        """
        Estadísticas de tours por estado de destino
        Endpoint público para mostrar destinos destacados en el home
        """
        # Solo contar tours publicados y activos
        published_tours = TourPackage.objects.filter(
            status='PUBLISHED',
            is_active=True
        ).select_related('operator').prefetch_related('images')

        # Agrupar por estado de destino y contar
        destinations_data = published_tours.values(
            'state_destination'
        ).annotate(
            count=Count('id')
        ).order_by('-count')

        # Enriquecer con imagen representativa de cada destino
        results = []
        for dest in destinations_data:
            state = dest['state_destination']
            count = dest['count']

            # Obtener un tour de este destino que tenga imagen
            sample_tour = published_tours.filter(
                state_destination=state
            ).prefetch_related('images').first()

            image_url = None
            if sample_tour and sample_tour.images.exists():
                main_image = sample_tour.images.filter(is_main_image=True).first()
                if not main_image:
                    main_image = sample_tour.images.first()
                if main_image and main_image.image:
                    image_url = request.build_absolute_uri(main_image.image.url)

            results.append({
                'name': state,
                'state': state,
                'tours': count,
                'count': count,
                'image': image_url
            })

        return Response(results)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def experiences_stats(self, request):
        """
        Estadísticas de tours por tipo de experiencia (environment)
        Endpoint público para mostrar categorías en el home
        """
        # Solo contar tours publicados y activos
        published_tours = TourPackage.objects.filter(
            status='PUBLISHED',
            is_active=True
        ).select_related('operator').prefetch_related('images')

        # Agrupar por environment y contar
        experiences_data = published_tours.values(
            'environment'
        ).annotate(
            count=Count('id')
        ).order_by('-count')

        # Enriquecer con imagen representativa y label con emoji
        results = []
        for exp in experiences_data:
            environment_code = exp['environment']
            count = exp['count']

            # Obtener el label con emoji desde el modelo
            from .models import Environment
            try:
                environment_choice = Environment[environment_code]
                label = environment_choice.label
            except (KeyError, AttributeError):
                label = environment_code

            # Obtener un tour de esta categoría que tenga imagen
            sample_tour = published_tours.filter(
                environment=environment_code
            ).prefetch_related('images').first()

            image_url = None
            if sample_tour and sample_tour.images.exists():
                main_image = sample_tour.images.filter(is_main_image=True).first()
                if not main_image:
                    main_image = sample_tour.images.first()
                if main_image and main_image.image:
                    image_url = request.build_absolute_uri(main_image.image.url)

            results.append({
                'code': environment_code,
                'label': label,
                'name': label,  # Alias para compatibilidad
                'count': count,
                'tours': count,  # Alias para compatibilidad
                'image': image_url
            })

        return Response(results)

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Tags no necesitan paginación

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Optimiza consultas de reseñas"""
        return Review.objects.select_related(
            'traveler', 'tour_package'
        ).filter(
            tour_package__is_active=True
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        """Crea una reseña validando que el usuario sea un viajero"""
        if self.request.user.role != 'TRAVELER':
            raise PermissionDenied("Solo los viajeros pueden crear reseñas")
        
        # Verificar que el usuario no haya reseñado este paquete antes
        tour_package = serializer.validated_data['tour_package']
        if Review.objects.filter(tour_package=tour_package, traveler=self.request.user).exists():
            raise serializers.ValidationError("Ya has reseñado este paquete")
        
        serializer.save(traveler=self.request.user)

class IncludedItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IncludedItem.objects.all()
    serializer_class = IncludedItemSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Ítems no necesitan paginación

class PackageImageViewSet(viewsets.ModelViewSet):
    """ViewSet específico para manejar imágenes de paquetes"""
    serializer_class = PackageImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return PackageImage.objects.filter(
            tour_package_id=self.kwargs['tour_package_pk']
        )
    
    def perform_create(self, serializer):
        tour_package = TourPackage.objects.get(pk=self.kwargs['tour_package_pk'])
        serializer.save(tour_package=tour_package)

# Vista de diagnóstico 
class TourDiagnosticView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        tours = TourPackage.objects.select_related('operator').all()[:10]  # Limitar a 10
        data = []
        for tour in tours:
            data.append({
                'id': tour.id,
                'title': tour.title,
                'status': tour.status,
                'is_active': tour.is_active,
                'operator': tour.operator.email if tour.operator else None,
                'images_count': tour.images.count(),
                'reviews_count': tour.reviews.count(),
                'available_slots': tour.available_slots
            })
        return Response(data)

# Vista para obtener el perfil del usuario actual
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)