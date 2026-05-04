from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings

from .models import Courier


class CourierJWTAuthentication(JWTAuthentication):
    """Extend SimpleJWT's JWTAuthentication to support authenticating Courier
    instances when the token contains a `user_type: 'courier'` claim and a
    `courier_id` claim. Falls back to the default behavior for regular users.
    """

    def get_user(self, validated_token):
        user_type = validated_token.get('user_type')

        # If token was issued for a courier, return Courier instance
        if user_type == 'courier':
            courier_id = validated_token.get('courier_id')
            if not courier_id:
                raise InvalidToken('Token contained no courier id')

            try:
                return Courier.objects.get(id=courier_id)
            except Courier.DoesNotExist:
                raise AuthenticationFailed('Courier not found', code='user_not_found')

        # Otherwise, fall back to default user lookup (AUTH_USER_MODEL)
        return super().get_user(validated_token)
