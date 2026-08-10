from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Review, Notification

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    order_id = serializers.UUIDField(required=True)
    product_id = serializers.UUIDField(required=True)
    reviewer = serializers.StringRelatedField(read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    target_user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=True,
        allow_null=False
    )

    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewer_name', 'target_user',
            'order_id', 'product_id', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ('reviewer', 'reviewer_name', 'created_at')
        ref_name = "CommunityReview"

    def validate(self, attrs):
        """Validation for required fields"""
        order_id = attrs.get("order_id")
        product_id = attrs.get("product_id")
        target_user = attrs.get("target_user")
        rating = attrs.get("rating")

        if not order_id:
            raise serializers.ValidationError({
                "order_id": "Order ID is required to create a review."
            })

        if not product_id:
            raise serializers.ValidationError({
                "product_id": "Product ID is required to create a review."
            })


        if not target_user:
            raise serializers.ValidationError({
                "target_user": "Target user (seller) is required to create a review."
            })

        if rating is not None and (rating < 1 or rating > 5):
            raise serializers.ValidationError({
                "rating": "Rating must be between 1 and 5."
            })

        return attrs

    def create(self, validated_data):
        """Create review with proper error handling"""
        try:
            review = Review.objects.create(**validated_data)
            return review
        except Exception as e:
            raise serializers.ValidationError({
                "error": f"Failed to create review: {str(e)}"
            })


class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')