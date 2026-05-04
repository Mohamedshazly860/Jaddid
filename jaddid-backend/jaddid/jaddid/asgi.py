"""
ASGI config for jaddid project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

# import os

# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# import community.routing

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jaddid.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": URLRouter(
#         community.routing.websocket_urlpatterns
#     ),
# })

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jaddid.settings')

# تأكد إن دي أول حاجة بتناديها
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from jaddid.middleware import WebSocketJWTAuthMiddleware
import community.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app, # دي المسؤولة عن الـ Login والـ APIs
    "websocket": WebSocketJWTAuthMiddleware(
        URLRouter(
            community.routing.websocket_urlpatterns
        )
    ),
})