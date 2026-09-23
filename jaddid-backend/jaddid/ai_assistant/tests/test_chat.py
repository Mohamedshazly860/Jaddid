from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class ChatViewTests(TestCase):
    endpoint = '/api/ai-assistant/chat/'

    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='chat-user@example.com',
            password='StrongPass123',
            first_name='Chat',
            last_name='User',
        )

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    @patch('ai_assistant.services.llm_service.LLMService.chat')
    def test_unauthenticated_request_returns_401(self, mock_chat):
        response = self.client.post(self.endpoint, {'message': 'Hello'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        mock_chat.assert_not_called()

    @patch('ai_assistant.services.llm_service.LLMService.chat')
    def test_missing_message_returns_400(self, mock_chat):
        self.authenticate()

        response = self.client.post(self.endpoint, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_chat.assert_not_called()

    @patch('ai_assistant.services.llm_service.LLMService.chat')
    def test_empty_message_returns_400(self, mock_chat):
        self.authenticate()

        response = self.client.post(self.endpoint, {'message': ''}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_chat.assert_not_called()

    @patch(
        'ai_assistant.services.llm_service.LLMService.chat',
        return_value={'response': 'How can I help?', 'products': []},
    )
    def test_valid_request_returns_llm_response(self, mock_chat):
        self.authenticate()

        response = self.client.post(self.endpoint, {'message': 'Hello'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'response': 'How can I help?', 'products': []})
        mock_chat.assert_called_once_with('Hello')

    @patch(
        'ai_assistant.services.llm_service.LLMService.chat',
        side_effect=Exception('LLM unavailable'),
    )
    def test_llm_exception_returns_503(self, mock_chat):
        self.authenticate()

        response = self.client.post(self.endpoint, {'message': 'Hello'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        mock_chat.assert_called_once_with('Hello')
