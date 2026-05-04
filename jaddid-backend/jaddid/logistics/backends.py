from django.contrib.auth.backends import BaseBackend
from .models import Courier

class CourierBackend(BaseBackend):
    def get_user(self, user_id):
        try:
            return Courier.objects.get(pk=user_id)
        except Courier.DoesNotExist:
            return None
        
    # logistics/backends.py
    def get_user(self, user_id):
        try:
            return Courier.objects.get(pk=user_id)
        except Courier.DoesNotExist:
            return None