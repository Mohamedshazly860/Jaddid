import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ChatInputSerializer
from .services import LLMService


logger = logging.getLogger(__name__)


class ChatView(APIView):
    """Authenticated endpoint for one-turn AI assistant conversations."""

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ChatInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        message = serializer.validated_data['message']
        conversation_id = serializer.validated_data.get('conversation_id')

        if conversation_id:
            # If a conversation ID is provided, we can retrieve the conversation and its messages
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            except Conversation.DoesNotExist:
                conversation = Conversation.objects.create(user=request.user)
        else:
            conversation = Conversation.objects.create(user=request.user)


        history = conversation.get_receent_messages(limit=20)


        try:
            result = LLMService().chat(message=message, history=history)
        except Exception:
            logger.exception('AI service request failed')
            return Response(
                {'error': 'AI service unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        
        ConversationMessage.objects.create(
            conversation=conversation,
            role='user',
            content=message,
            products=[],
        )

        ConversationMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=result['response'],
            products=result['products'],
        )

        conversation.save()

        return Response(
            'response': result['response'],
            'products': result['products'],
            'conversation_id': str(conversation.id),
        )
