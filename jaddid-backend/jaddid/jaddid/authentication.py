"""
Custom JWT Authentication that doesn't raise exceptions for missing/invalid tokens
This allows public endpoints to work while still supporting JWT authentication
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework.exceptions import AuthenticationFailed as DRFAuthenticationFailed


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that returns None instead of raising exceptions
    when token is invalid or missing, allowing AllowAny and IsAuthenticatedOrReadOnly
    permissions to work properly.
    """
    
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed, DRFAuthenticationFailed, Exception):
            # Return None to allow anonymous access instead of raising 401
            return None
            return None
