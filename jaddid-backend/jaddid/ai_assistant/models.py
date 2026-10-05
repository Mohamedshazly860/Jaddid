from django.db import models
import uuid
from django.conf import settings

class Conversation(models.Model):
    """Model represernting a conversation between the user and the LLM"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_conversations")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def get_receent_messages(self, limit: int = 20):
        """Return the most recent messages in the conversation."""
        return self.messages.order_by("-created_at")[:limit][::-1]

    

class ConversationMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    products = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    

    class Meta:
        ordering = ["created_at"]