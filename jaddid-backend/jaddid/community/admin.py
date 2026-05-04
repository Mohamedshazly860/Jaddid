

from django.contrib import admin
from .models import Review, Notification


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'reviewer', 'target_user', 'rating', 'created_at')
    search_fields = ('reviewer__email', 'target_user__email')
    list_filter = ('rating', 'created_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__email', 'title_en', 'title_ar')
