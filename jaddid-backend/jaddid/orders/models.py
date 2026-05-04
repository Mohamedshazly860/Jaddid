import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User
from marketplace.models import Product, MaterialListing
from decimal import Decimal

class Order(models.Model):
    """Main Order model"""

    PRODUCT = 'product'
    MATERIAL = 'material'
    ORDER_TYPE_CHOICES = [
        (PRODUCT, 'Product'),
        (MATERIAL, 'Material')
    ]

    PENDING = 'pending'
    CONFIRMED = 'confirmed'  
    IN_PROGRESS = 'in_progress'
    COURIER_ASSIGNED = 'courier_assigned'
    ON_THE_WAY = 'on_the_way'
    DELIVERED = 'delivered'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

    
    ORDER_STATUS_CHOICES = [
        (PENDING, 'Pending'),  # ADD THIS
        (CONFIRMED, 'Confirmed'),  # ADD THIS
        (IN_PROGRESS, 'In Progress'),
        (COURIER_ASSIGNED, 'Courier Assigned'),  # ADD THIS
        (ON_THE_WAY, 'On the Way'),  # ADD THIS
        (DELIVERED, 'Delivered'),
        (COMPLETED, 'Completed'),  # ADD THIS
        (CANCELLED, 'Cancelled')
    ]

    order_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_as_buyer')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_as_seller')
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    delivery_address = models.TextField(blank=True)
    customer_lat = models.FloatField(null=True, blank=True, help_text="Customer Latitude")
    customer_lng = models.FloatField(null=True, blank=True, help_text="Customer Longitude")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, help_text="Sum of item prices")
    service_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, help_text="10% service fee")
    delivery_fee = models.DecimalField(max_digits=12, decimal_places=2, default=20.0, help_text="Delivery fee (20 EGP)")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, help_text="Final total with all fees")    
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default=PENDING)
    payment_status = models.CharField(max_length=20,
    choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed')
    ], default='pending')
    payment_method_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', '-created_at']),
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['order_status']),
        ]



    def __str__(self):
        return f"Order {self.order_id} from {self.buyer.email} to {self.seller.email}"

    def calculate_fees(self):
        """Calculate service fee (10%) and set delivery fee (20 EGP)"""
        self.service_fee = (self.subtotal * Decimal('0.10')).quantize(Decimal('0.01'))
        self.delivery_fee = Decimal('20.00')
        self.total_price = self.subtotal + self.service_fee + self.delivery_fee

    def save(self, *args, **kwargs):
        if self.order_status == 'delivered':
            self.payment_status = 'paid' if self.order_status == 'delivered' else 'unpaid'
            if not self.delivered_at:
                self.delivered_at = timezone.now()
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    """Individual items in an order"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    material_listing = models.ForeignKey(MaterialListing, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ['-id']
        indexes = [
            models.Index(fields=['order']),
        ]

    def __str__(self):
        if self.product:
            return f"{self.quantity} x {self.product.title}"
        elif self.material_listing:
            return f"{self.quantity} x {self.material_listing.material.name}"
        return f"OrderItem {self.id}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if (self.product and self.material_listing) or (not self.product and not self.material_listing):
            raise ValidationError("Each item must have either product or material_listing, not both or none.")


class OrderStatusTracking(models.Model):
    """Tracks every order status change"""

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_logs')
    old_status = models.CharField(max_length=20, null=True, blank=True)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['new_status']),
        ]

    def __str__(self):
        return f"Order {self.order.order_id} status change: {self.old_status} → {self.new_status}"
