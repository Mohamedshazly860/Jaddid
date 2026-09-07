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
        serializer.is_valid(raise_exception=True)

        try:
            response = LLMService().chat(serializer.validated_data['message'])
        except Exception:
            logger.exception('AI service request failed')
            return Response(
                {'error': 'AI service unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({'response': response}, status=status.HTTP_200_OK)
