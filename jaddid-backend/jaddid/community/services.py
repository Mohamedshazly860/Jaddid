from .models import Notification
from accounts.models import Profile
import json
from django.conf import settings
from django.core.cache import cache


class NotificationService:
    """Service for handling notifications"""

    @staticmethod
    def create_notification(user, notification_type, title_en, title_ar, msg_en, msg_ar, order_id=None, product_id=None):
        """Create a notification and broadcast via WebSocket"""
        notification = Notification.objects.create(
            user=user,
            type=notification_type,
            title_en=title_en,
            title_ar=title_ar,
            msg_en=msg_en,
            msg_ar=msg_ar,
            order_id=order_id,
            product_id=product_id
        )

        # Broadcast via WebSocket
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'notifications_{user.id}',
            {
                'type': 'notification_message',
                'notification': {
                    'id': str(notification.id),
                    'type': notification.type,
                    'title_en': notification.title_en,
                    'title_ar': notification.title_ar,
                    'msg_en': notification.msg_en,
                    'msg_ar': notification.msg_ar,
                    'is_read': notification.is_read,
                    'order_id': str(notification.order_id) if notification.order_id else None,
                    'product_id': str(notification.product_id) if notification.product_id else None,
                    'created_at': notification.created_at.isoformat()
                }
            }
        )

        # Send push notification if user is offline
        NotificationService.send_push_notification(user, title_en, msg_en, notification.id)

        return notification

    @staticmethod
    def send_push_notification(user, title, body, notification_id):
        """Send push notification using FCM or similar"""
        try:
            profile = Profile.objects.get(user=user)
            if not profile.push_token:
                return

            # For now, we'll use a simple implementation
            # In production, integrate with FCM, OneSignal, etc.
            # This is a placeholder for the push notification logic
            print(f"Sending push notification to {user.email}: {title} - {body}")

            # Example FCM implementation (requires firebase-admin SDK)
            # from firebase_admin import messaging
            # message = messaging.Message(
            #     notification=messaging.Notification(
            #         title=title,
            #         body=body,
            #     ),
            #     token=profile.push_token,
            #     data={
            #         'notification_id': str(notification_id),
            #     }
            # )
            # response = messaging.send(message)
            # print(f'Successfully sent message: {response}')

        except Profile.DoesNotExist:
            pass
        except Exception as e:
            print(f"Error sending push notification: {e}")

    @staticmethod
    def get_unread_count(user):
        """Get unread notification count for user"""
        cache_key = f'notification_count_{user.id}'
        count = cache.get(cache_key)
        if count is None:
            count = Notification.objects.filter(user=user, is_read=False).count()
            cache.set(cache_key, count, 300)  # Cache for 5 minutes
        return count

    @staticmethod
    def mark_as_read(user, notification_ids):
        """Mark notifications as read"""
        Notification.objects.filter(user=user, id__in=notification_ids).update(is_read=True)
        # Invalidate cache
        cache.delete(f'notification_count_{user.id}')