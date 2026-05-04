from rest_framework import serializers
from .models import ChatHistory


class ChatHistorySerializer(serializers.ModelSerializer):
    """Serializer for chat history"""
    
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatHistory
        fields = [
            'id', 'user', 'user_email', 'user_message', 
            'bot_response', 'message_time', 'intent', 'categories'
        ]
        read_only_fields = ['id', 'user', 'message_time']
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'


class ChatMessageSerializer(serializers.Serializer):
    """Serializer for incoming chat messages"""
    
    message = serializers.CharField(max_length=1000, required=True)
