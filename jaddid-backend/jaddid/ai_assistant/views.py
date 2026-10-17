import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Conversation, ConversationMessage
from .serializers import ChatInputSerializer
from .services import LLMService
from .guardrail.scope_guardrail import ScopeGuardrail
from .security.rate_limiter import RateLimiter
from .security.sanitizer import InputSanitizer, ResponseSanitizer
from .security.injection_detector import InjectionDetector
from .security.security_logger import SecurityLogger
from django.conf import settings

logger = logging.getLogger(__name__)


class ChatView(APIView):
    """Authenticated endpoint for one-turn AI assistant conversations."""

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ChatInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        raw_message = serializer.validated_data['message']
        conversation_id = serializer.validated_data.get('conversation_id')


        #Input Sanitization
        try:
            message = InputSanitizer.sanitize(raw_message)
        except ValueError:
            return Response({"error": "Invalid message content"}, status=400)

        #Rate Limiting
        rate_limiter = RateLimiter(request.user)
        if not rate_limiter.is_allowed():
            SecurityLogger.log_rate_limit_hit(request.user)
            return Response({"error": "Too many messages. Please wait before sending more."}, status=429)


        #Scope Guardrail
        guardrail_result = ScopeGuardrail.check(message)
        if not guardrail_result['is_in_scope']:
            SecurityLogger.log_guardrail_rejection(
                request.user, message, guardrail_result['score']
            )
            return Response({
                'response': guardrail_result['rejection_message'],
                'products': [],
                'conversation_id': str(conversation_id) if conversation_id else None
            })

        #Injection Detection (Log only because guardrail handles rejection)
        matched_pattern = InjectionDetector.get_matched_pattern(message)
        if matched_pattern:
            SecurityLogger.log_injection_attempt(
                request.user, message, matched_pattern
            )



        #Conversation limits
        if conversation_id:
            try:
                conversation = Conversation.objects.get(
                    id=conversation_id,
                    user=request.user
                )
            except Conversation.DoesNotExist:
                conversation = Conversation.objects.create(user=request.user)
        else:
            conv_count = Conversation.objects.filter(user=request.user).count()
            if conv_count >= settings.CHAT_MAX_CONVERSATIONS_PER_USER:
                oldest = Conversation.objects.filter(
                    user=request.user
                ).order_by('updated_at').first()
                if oldest:
                    oldest.delete()
                SecurityLogger.log_conversation_limit(request.user)
            conversation = Conversation.objects.create(user=request.user)

        # Check message limit per conversation
        msg_count = conversation.messages.count()
        if msg_count >= settings.CHAT_MAX_MESSAGES_PER_CONVERSATION:
            conversation = Conversation.objects.create(user=request.user)

        # Load history
        history = conversation.get_recent_messages(limit=20)

        # Call LLM
        try:
            result = LLMService().chat(message=message, history=history)
        except Exception:
            logger.exception("AI service request failed")
            return Response({"error": "AI service unavailable"}, status=503)

        #Response sanitization
        sanitized_response, was_leaked = ResponseSanitizer.sanitize(result['response'])
        if was_leaked:
            SecurityLogger.log_response_leak(request.user, "system_prompt_leak")

        # Save messages
        ConversationMessage.objects.create(
            conversation=conversation,
            role='user',
            content=message,
            products=[]
        )
        ConversationMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=sanitized_response,
            products=result['products']
        )
        conversation.save()

        return Response({
            'response': sanitized_response,
            'products': result['products'],
            'conversation_id': str(conversation.id)
        })