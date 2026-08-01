from django.db import models
import uuid
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password, check_password
from accounts.models import User
from orders.models import Order


# Default coordinates (Cairo, Egypt)
DEFAULT_LATITUDE = 30.050180997609587
DEFAULT_LONGITUDE = 31.232585906982425


class Courier(models.Model):
    Transport_Choices = [
        ('CAR', 'Car'),
        ('MOTORCYCLE', 'Motorcycle'),
        ('BICYCLE', 'Bicycle')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=11)

    transport_type = models.CharField(max_length=28, choices=Transport_Choices)
    vehicle_number = models.CharField(max_length=50, blank=True)

    current_lat = models.FloatField(
        default=DEFAULT_LATITUDE,
        help_text="Current latitude — defaults to Cairo if not provided"
    )
    current_lng = models.FloatField(
        default=DEFAULT_LONGITUDE,
        help_text="Current longitude — defaults to Cairo if not provided"
    )

    is_available = models.BooleanField(
        default=True,
        help_text="Automatically set to False when assigned to an active order, "
                  "and back to True when the order is completed or cancelled."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Courier'
        verbose_name_plural = 'Couriers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_available']),
            models.Index(fields=['current_lat', 'current_lng']),
        ]

    def __str__(self):
        status = "Available" if self.is_available else "On Delivery"
        return f"{self.first_name} {self.last_name} - {self.transport_type} ({status})"

    def set_password(self, password):
        """Hash and set password"""
        self.password = make_password(password)

    def check_password(self, password):
        """Check if provided password matches stored hash"""
        return check_password(password, self.password)

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def mark_unavailable(self):
        """Call when courier is assigned to an order"""
        self.is_available = False
        self.save(update_fields=['is_available', 'updated_at'])

    def mark_available(self):
        """Call when courier finishes or is unassigned from an order"""
        self.is_available = True
        self.save(update_fields=['is_available', 'updated_at'])

    @property
    def is_authenticated(self):
        """
        Always return True to pass through DRF's IsAuthenticated
        permission checks for courier-based auth.
        """
        return True

    @property
    def is_active(self):
        """Backward-compatible alias for the availability flag."""
        return self.is_available

    @is_active.setter
    def is_active(self, value):
        self.is_available = value


class CourierAssignment(models.Model):
    """Tracks which courier is assigned to which order"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='courier_assignment'
    )
    courier = models.ForeignKey(
        Courier,
        on_delete=models.CASCADE,
        related_name='assignments'
    )

    # Assignment tracking
    assigned_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Rejection info
    rejected = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Courier Assignment'
        verbose_name_plural = 'Courier Assignments'
        ordering = ['-assigned_at']

    def __str__(self):
        return f"Order {self.order.id} --> {self.courier.get_full_name()}"


class LiveTracking(models.Model):
    """Real-time live tracking logs for courier during delivery"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='tracking_logs'
    )
    courier = models.ForeignKey(
        Courier,
        on_delete=models.CASCADE,
        related_name='tracking_logs'
    )

    # Location data
    latitude = models.FloatField()
    longitude = models.FloatField()

    # Distance and ETA
    distance_to_destination = models.FloatField(
        null=True,
        blank=True,
        help_text='Distance in kilometers'
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Live Tracking'
        verbose_name_plural = 'Live Tracking Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['order', '-timestamp']),
            models.Index(fields=['courier', '-timestamp'])
        ]

    def __str__(self):
        return f"{self.courier.get_full_name()} - {self.timestamp}"