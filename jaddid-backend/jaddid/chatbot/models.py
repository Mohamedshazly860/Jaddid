from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class ChatHistory(models.Model):
    """Store chat history for the AI chatbot"""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_history',
        verbose_name=_("User"),
        null=True,
        blank=True
    )
    user_message = models.TextField(_("User Message"))
    bot_response = models.TextField(_("Bot Response"))
    message_time = models.DateTimeField(auto_now_add=True)
    
    # Optional: Store context for debugging
    intent = models.CharField(_("Intent"), max_length=50, blank=True)
    categories = models.JSONField(_("Categories"), default=list, blank=True)

    class Meta:
        verbose_name = _("Chat History")
        verbose_name_plural = _("Chat Histories")
        ordering = ['-message_time']
        indexes = [
            models.Index(fields=['-message_time']),
            models.Index(fields=['user', '-message_time']),
        ]

    def __str__(self):
        user_label = self.user.email if self.user else "Anonymous"
        return f"{user_label}: {self.user_message[:50]} @ {self.message_time}"
