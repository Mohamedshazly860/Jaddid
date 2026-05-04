import uuid
from django.db import models
from django.conf import settings


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_reviews_given')
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_reviews_received')
    order_id = models.UUIDField(null=True, blank=True)
    product_id = models.UUIDField(null=True, blank=True)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.reviewer} for {self.target_user} - {self.rating}"


class Notification(models.Model):
    DISCOUNT = 'discount'
    UPDATE = 'update'
    NEW_PARTNER = 'new_partner'
    SYSTEM = 'system'
    ORDER_STATUS = 'order_status'

    TYPE_CHOICES = [
        (DISCOUNT, 'Discount'),
        (UPDATE, 'Update'),
        (NEW_PARTNER, 'New Partner'),
        (SYSTEM, 'System'),
        (ORDER_STATUS, 'Order Status'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title_en = models.CharField(max_length=255)
    title_ar = models.CharField(max_length=255)
    msg_en = models.TextField()
    msg_ar = models.TextField()
    is_read = models.BooleanField(default=False)
    order_id = models.UUIDField(null=True, blank=True)
    product_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user} - {self.type}"