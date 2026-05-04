from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Profile
# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """custom user admin"""
    list_display=[
        'email', 
        'first_name', 
        'last_name', 
        'role', 
        'is_verified',
        'is_active', 
        'date_joined'
    ]
    list_filter = [
        'role', 
        'is_active', 
        'is_staff', 
        'is_verified',
        'date_joined'
    ]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name')
        }),
        (_('Role & Permissions'), {
            'fields': (
                'role',
                'is_verified'
            )
        }),
        (_('Django Permissions'), {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            ),
            'classes': ('collapse',)
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'role'
            ),
        }),
    )
    
    readonly_fields = ['date_joined', 'created_at', 'updated_at', 'last_login']

    class ProfileInline(admin.StackedInline):
        """Inline Profile in User Admin"""
        model = Profile
        can_delete = False
        verbose_name_plural = 'Profile'
        fields = ['phone', 'address', 'bio', 'profile_image']


# Optionally, add ProfileInline to UserAdmin
# Uncomment if you want to see profile in user admin page
# UserAdmin.inlines = [ProfileInline]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Profile Admin"""
    
    list_display = ['user', 'phone', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone']
    list_filter = ['created_at']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at']
