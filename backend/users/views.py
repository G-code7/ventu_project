from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from .models import CustomUser
from .serializers import UserProfileSerializer
from tours.models import TourPackage, Review
from tours.serializers import TourPackageListSerializer


class CurrentUserView(APIView):
    """
    Vista para obtener el usuario actual autenticado.
    URL: /api/users/me/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class UserProfileView(APIView):
    """
    Vista para ver y actualizar el perfil del usuario autenticado.
    URL: /api/users/profile/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        return self.put(request)


class OperatorDashboardView(APIView):
    """
    Vista del dashboard para operadores.
    Muestra estadísticas y resumen de sus tours.
    URL: /api/users/dashboard/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Verificar que sea operador
        if user.role != 'OPERATOR':
            return Response(
                {'error': 'Solo los operadores pueden acceder al dashboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener tours del operador
        tours = TourPackage.objects.filter(operator=user)
        
        # Estadísticas
        total_tours = tours.count()
        active_tours = tours.filter(status='PUBLISHED', is_active=True).count()
        draft_tours = tours.filter(status='DRAFT').count()
        
        # Reviews
        total_reviews = Review.objects.filter(
            tour_package__operator=user,
            is_approved=True
        ).count()
        
        average_rating = Review.objects.filter(
            tour_package__operator=user,
            is_approved=True
        ).aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Reservas totales
        total_bookings = tours.aggregate(
            total=Count('current_bookings')
        )['total'] or 0
        
        # Tours recientes
        recent_tours = tours.order_by('-created_at')[:5]
        recent_tours_data = TourPackageListSerializer(recent_tours, many=True).data
        
        dashboard_data = {
            'user': UserProfileSerializer(user).data,
            'statistics': {
                'total_tours': total_tours,
                'active_tours': active_tours,
                'draft_tours': draft_tours,
                'total_reviews': total_reviews,
                'average_rating': round(average_rating, 1),
                'total_bookings': total_bookings,
            },
            'recent_tours': recent_tours_data,
        }
        
        return Response(dashboard_data)


class OperatorPublicProfileView(APIView):
    """
    Vista pública del perfil de un operador.
    Accesible sin autenticación.
    URL: /api/users/operators/<username>/profile/
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, username):
        # Buscar operador por username
        operator = get_object_or_404(
            CustomUser, 
            username=username, 
            role='OPERATOR'
        )
        
        # Obtener el perfil del operador
        operator_profile = getattr(operator, 'operator_profile', None)
        
        # Obtener tours del operador
        all_tours = TourPackage.objects.filter(
            operator=operator
        ).select_related('operator').prefetch_related(
            'images', 'tags', 'reviews'
        )
        
        # Tours activos (publicados y activos)
        active_tours = all_tours.filter(
            status='PUBLISHED',
            is_active=True
        ).order_by('-created_at')
        
        # Tours pasados/inactivos
        inactive_tours = all_tours.filter(
            Q(status='PUBLISHED', is_active=False) |
            Q(status__in=['DRAFT', 'PENDING'])
        ).order_by('-created_at')[:10]
        
        # Estadísticas del operador
        total_reviews = Review.objects.filter(
            tour_package__operator=operator,
            is_approved=True
        ).count()
        
        average_rating = Review.objects.filter(
            tour_package__operator=operator,
            is_approved=True
        ).aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Reviews más recientes
        recent_reviews = Review.objects.filter(
            tour_package__operator=operator,
            is_approved=True
        ).select_related(
            'traveler', 'tour_package'
        ).order_by('-created_at')[:10]
        
        # Serializar datos
        active_tours_data = TourPackageListSerializer(
            active_tours, many=True
        ).data
        
        inactive_tours_data = TourPackageListSerializer(
            inactive_tours, many=True
        ).data
        
        reviews_data = []
        for review in recent_reviews:
            reviews_data.append({
                'id': review.id,
                'tour_title': review.tour_package.title,
                'tour_id': review.tour_package.id,
                'traveler_name': review.traveler.get_full_name() or review.traveler.username,
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'created_at': review.created_at,
                'operator_response': review.operator_response,
                'response_date': review.response_date,
            })
        
        # Construir respuesta usando los perfiles correctos
        profile_data = {
            'operator': {
                'id': operator.id,
                'username': operator.username,
                # Usar organization_name del OperatorProfile
                'business_name': operator_profile.organization_name if operator_profile else (operator.get_full_name() or operator.username),
                'first_name': operator.first_name,
                'last_name': operator.last_name,
                'email': operator.email,
                'phone_number': '',  # Los operadores no tienen phone_number en su perfil actual
                'bio': '',  # Campo no existe aún
                'profile_picture': None,  # Campo no existe aún
                'date_joined': operator.date_joined,
                'is_verified': operator_profile.status == 'ACTIVE' if operator_profile else False,
                # Campos adicionales del operador
                'social_media_link': operator_profile.social_media_link if operator_profile else '',
                'rif': f"{operator_profile.rif_type}-{operator_profile.rif_number}" if operator_profile else '',
            },
            'statistics': {
                'total_active_tours': active_tours.count(),
                'total_tours': all_tours.count(),
                'total_reviews': total_reviews,
                'average_rating': round(average_rating, 1),
                'total_travelers': sum(tour.current_bookings for tour in all_tours),
            },
            'active_tours': active_tours_data,
            'past_tours': inactive_tours_data,
            'recent_reviews': reviews_data,
        }
        
        return Response(profile_data)