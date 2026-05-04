


from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError 
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from accounts.serializers import ProfileSerializer
from .models import Review, Notification
from .serializers import ReviewSerializer, NotificationSerializer
from accounts.models import Profile
from .services import NotificationService
import logging

logger = logging.getLogger(__name__)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['rating', 'target_user', 'product_id']
    ordering_fields = ['rating', 'created_at']

    def perform_create(self, serializer):
        """
        Review creation with proper error handling
        """
        try:
            reviewer = self.request.user
            product_id = serializer.validated_data.get('product_id')
            order_id = serializer.validated_data.get('order_id')
            target_user = serializer.validated_data.get('target_user')

            if Review.objects.filter(
                reviewer=reviewer,
                order_id=order_id,
                product_id=product_id
            ).exists():
                raise ValidationError({
                    "error": "You have already reviewed this product for this order."
                })

            review = serializer.save(reviewer=reviewer)
            
            try:
                NotificationService.notify_new_review(
                    target_user=target_user,
                    reviewer=reviewer,
                    product_id=product_id,
                    rating=review.rating
                )
            except Exception as e:
                logger.warning(f"Failed to send review notification: {e}")
            
            logger.info(f"Review created successfully by {reviewer.email} for product {product_id}")
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error creating review: {e}", exc_info=True)
            raise ValidationError({
                "error": f"Failed to create review: {str(e)}"
            })

    def create(self, request, *args, **kwargs):
        """
        Override create to ensure proper response even if notification fails
        """
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except ValidationError as e:
            return Response(
                e.detail if hasattr(e, 'detail') else {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in review creation: {e}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[^/.]+)')
    def for_product(self, request, product_id=None):
        """Action for URL: /api/community/reviews/product/{id}/"""
        reviews = self.get_queryset().filter(product_id=product_id)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='material-listing/(?P<material_id>[^/.]+)')
    def for_material(self, request, material_id=None):
        """Action for URL: /api/community/reviews/material-listing/{id}/"""
        reviews = self.get_queryset().filter(product_id=material_id)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """users will be able to view notifications sent to them only"""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = NotificationService.get_unread_count(request.user)
        return Response({'unread_count': count})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profile.objects.filter(review_count__gt=0).order_by('-average_rating')
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        "returns top sellers with at least 1 review"
        top_sellers = self.get_queryset()[:5]
        serializer = self.get_serializer(top_sellers, many=True)
        return Response(serializer.data)