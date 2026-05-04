from django.db import models
import uuid
from django.contrib.auth.hashers import make_password, check_password
from accounts.models import User
from orders.models import Order
# Create your models here.

class Courier(models.Model):
    Transport_Choices=[
    ('CAR', 'Car'),
    ('MOTORCYCLE', 'Motorcycle'),
    ('BICYCLE', 'Bicycle')
    ]

    id=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email=models.EmailField(unique=True)
    password=models.CharField(max_length=128)

    first_name=models.CharField(max_length=150)
    last_name=models.CharField(max_length=150)
    phone=models.CharField(max_length=11)
    
    transport_type=models.CharField(max_length=28, choices=Transport_Choices)
    vehicle_number=models.CharField(max_length=50, blank=True)

    current_lat=models.FloatField(null=True, blank=True, help_text="current latitude")
    current_lng=models.FloatField(null=True, blank=True, help_text="current longitude")
    
    is_active=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name='Courier'
        verbose_name_plural = 'Couriers'
        ordering=['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
            models.Index(fields=['current_lat', 'current_lng']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.transport_type}"
    
    def set_password(self, password):
        """set and hash passwrod"""
        self.password=make_password(password)

    def check_password(self, password):
        """check if password is correct"""
        return check_password(password, self.password)
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    

    @property
    def is_authenticated(self):
        """
        Always return True. This allows the object to pass 
        through 'IsAuthenticated' permission checks.
        """
        return True
    

class CourierAssignment(models.Model):
    """Tracks which courier is assigned to which order"""
    id=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order=models.OneToOneField(Order, on_delete=models.CASCADE, related_name='courier_assignment')
    courier=models.ForeignKey(Courier, on_delete=models.CASCADE, related_name='assignments')
    
    #assignment tracking
    assigned_at=models.DateTimeField(auto_now_add=True)
    accepted=models.BooleanField(default=False)
    accepted_at=models.DateTimeField(null=True, blank=True)
    completed_at=models.DateTimeField(null=True, blank=True)

    #rejection info
    rejected=models.BooleanField(default=False)
    rejection_reason=models.TextField(blank=True)
    rejected_at=models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name='Courier Assignment'
        verbose_name_plural='Courier Assignments'
        ordering=['-assigned_at']

def __str__(self):
    return f"Order {self.order.id} --> {self.courier.get_full_name()}"
        

class LiveTracking(models.Model):
    """Real-time live tracking logs for courier during delivery"""
    id=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order=models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='tracking_logs'
    )
    courier=models.ForeignKey(
        Courier,
        on_delete=models.CASCADE,
        related_name='tracking_logs'
    )

    #location data
    latitude=models.FloatField()
    longitude=models.FloatField()

    #Distance and ETA
    distance_to_destination=models.FloatField(
        null=True,
        blank=True,
        help_text='distance in kilometers'
    )

    timestamp=models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name='Live Tracking'
        verbose_name_plural='Live Tracking Logs'
        ordering=['-timestamp']
        indexes=[
            models.Index(fields=['order', '-timestamp']),
            models.Index(fields=['courier', '-timestamp'])
        ]

def __str__(self):
    return f"{self.courier.get_full_name()} - {self.timestamp}"
        

