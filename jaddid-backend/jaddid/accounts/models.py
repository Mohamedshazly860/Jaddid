from email.headerregistry import Address
from tabnanny import verbose
from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager
# Create your models here.

class User(AbstractBaseUser, PermissionsMixin):
    """Uses email instead of username for authentication"""
    #Role_Choices
    Individual="Individual"
    Factory="Factory"
    Company="Company"
    Admin="Admin"

    Role_Choices=[
        (Individual, "Individual"),
        (Factory, "Factory"),
        (Company, "Company"),
        (Admin, "Admin")
    ]

    #Language_choices
    English="en"
    Arabic="ar"

    Language_choices=[
        (English, "en"),
        (Arabic, "ar")
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(
        _("email address"),
        unique=True, 
        error_messages={
            "unique":_("A user with this email already exists")
        })
    first_name=models.CharField(_("First Name") ,max_length=100)
    last_name=models.CharField(_("Last Name"), max_length=100)
    role=models.CharField(max_length=20,
        choices=Role_Choices,
        default=Individual)
    is_verified=models.BooleanField(_("verified"), default=False)
    is_staff=models.BooleanField(_("Staff"), default=False)
    is_active=models.BooleanField(_("Active"), default=True)
    date_joined=models.DateTimeField(_("date joined"), default=timezone.now)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    objects=CustomUserManager()

    USERNAME_FIELD="email"
    REQUIRED_FIELDS=["first_name", "last_name"]

    class meta:
        verbose_name=_('user')
        verbose_name_plural=('users')
        ordering=['-created_at']
        indexes=[
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['-created_at'])
            ]
        
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        full_name=f"{self.first_name} {self.last_name}"
        return full_name.strip()
    
    def get_shotr_name(self):
        return self.first_name




class Profile(models.Model):
    """User Profile Model"""

    id=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user=models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone=models.CharField(_('phone number'), max_length=11, blank=True)
    address=models.TextField(_('address'), blank=True)
    bio=models.TextField(_("biography"), blank=True, max_length=500)
    profile_image=models.ImageField(_("profile Image"),
        upload_to="profiles/%Y/%m/",
        null=True,
        blank=True
        )
    average_rating=models.FloatField(default=0.0)
    review_count=models.PositiveBigIntegerField(default=0)
    push_token = models.TextField(_("push token"), blank=True, null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name=_("profile")
        verbose_name_plural=_("profiles")

    def __str__(self):
        return f"{self.user.get_full_name}'s profile"