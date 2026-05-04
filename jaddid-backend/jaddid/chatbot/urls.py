from django.urls import path
from .views import ChatbotView, ChatHistoryView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot'),
    path('history/', ChatHistoryView.as_view(), name='chat-history'),
]
