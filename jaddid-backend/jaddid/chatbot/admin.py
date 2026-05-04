from django.contrib import admin
from .models import ChatHistory


@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_message_preview', 'message_time', 'intent')
    list_filter = ('message_time', 'intent')
    search_fields = ('user__email', 'user_message', 'bot_response')
    readonly_fields = ('message_time',)
    date_hierarchy = 'message_time'
    
    def user_message_preview(self, obj):
        return obj.user_message[:100] + '...' if len(obj.user_message) > 100 else obj.user_message
    user_message_preview.short_description = 'User Message'
