from rest_framework import serializers


class ChatInputSerializer(serializers.Serializer):
    """Validate a chat message submitted to the AI assistant.
    Max_length is set to 1000 characters to prevent abuse especially denial of wallet attack 
    and ensure performance."""

    message = serializers.CharField(required=True, allow_blank=False, max_length=1000)
