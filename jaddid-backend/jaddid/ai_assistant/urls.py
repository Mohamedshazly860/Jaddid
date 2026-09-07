from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.ChatView.as_view(), name='ai-chat'),
]


# curl -X POST http://localhost:8000/api/ai-assistant/chat/ \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg4OTExMTQyLCJpYXQiOjE3ODg4MjQ3NDIsImp0aSI6ImU4MGRlOWYzMDkxYjQ3OThiYTJiOTk0N2U0NjNiODU4IiwidXNlcl9pZCI6IjAyYTIyM2FmLTIyZjktNGNiOC1hNWI4LTVmMzEzNDY3ZGEzZSJ9.-gtGdkAOXti5PS-46Yxhi-piFf_7IzbbUkFAwXHKqsY" \
#   -d '{"message": "Hello, what can you help me with?"}'


#   curl -X POST http://localhost:8000/api/accounts/login/ \
#   -H "Content-Type: application/json" \
#   -d '{"email": "mohamedshazly860@gmail.com", "password": "123"}'