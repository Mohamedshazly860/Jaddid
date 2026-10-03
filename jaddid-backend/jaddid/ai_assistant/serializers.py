from rest_framework import serializers


class ChatInputSerializer(serializers.Serializer):
    """Validate a chat message submitted to the AI assistant.
    Max_length is set to 1000 characters to prevent abuse especially denial of wallet attack 
    and ensure performance."""

    message = serializers.CharField(required=True, allow_blank=False, max_length=1000)
    conversation_id = serializers.UUIDField(required=True, allow_null=True)



class ChatOutputSerializer(serializers.Serializer):
    """Validate the response from AI assistant"""
    response = serializers.CharField()
    products = serializers.ListField()
    conversation_id = serializers.UUIDField()