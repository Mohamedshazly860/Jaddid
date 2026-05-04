import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .services import NotificationService

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("WebSocket connect attempt")
        await self.accept()
        print("WebSocket connection accepted")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        if hasattr(self, 'group_name') and self.user:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get('type') == 'authenticate':
                token_string = data.get('token')
                if token_string:
                    from jaddid.middleware import get_user_from_token
                    self.user = await get_user_from_token(token_string)
                    if self.user and self.user.is_authenticated:
                        self.group_name = f'notifications_{self.user.id}'
                        await self.channel_layer.group_add(
                            self.group_name,
                            self.channel_name
                        )
                        await self.send(text_data=json.dumps({
                            'type': 'authenticated',
                            'success': True
                        }))
                        print(f"WebSocket authenticated for user: {self.user}")
                    else:
                        await self.send(text_data=json.dumps({
                            'type': 'authenticated',
                            'success': False,
                            'error': 'Invalid token'
                        }))
                        await self.close()
                else:
                    await self.close()
        except json.JSONDecodeError:
            await self.close()

    async def notification_message(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event['notification']
        }))