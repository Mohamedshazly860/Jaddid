from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from community.services import NotificationService
from community.models import Notification


@receiver(post_save, sender=Order)
def notify_order_status_change(sender, instance, created, **kwargs):
    """Send notification when order status changes to DELIVERED"""
    if not created and instance.order_status == Order.DELIVERED:
        # Notify buyer for each item in the order
        for item in instance.items.all():
            product_id = item.product.id if item.product else None
            material_id = item.material_listing.id if item.material_listing else None
            
            # Create notification for products
            if product_id:
                NotificationService.create_notification(
                    user=instance.buyer,
                    notification_type=Notification.ORDER_STATUS,
                    title_en="Order Delivered",
                    title_ar="تم تسليم الطلب",
                    msg_en=f"Your order item '{item.product.title}' has been delivered successfully.",
                    msg_ar=f"تم تسليم منتج '{item.product.title}' من طلبك بنجاح.",
                    order_id=instance.order_id,
                    product_id=product_id
                )
            # Create notification for material listings
            elif material_id:
                NotificationService.create_notification(
                    user=instance.buyer,
                    notification_type=Notification.ORDER_STATUS,
                    title_en="Order Delivered",
                    title_ar="تم تسليم الطلب",
                    msg_en=f"Your order item '{item.material_listing.material.name}' has been delivered successfully.",
                    msg_ar=f"تم تسليم مادة '{item.material_listing.material.name}' من طلبك بنجاح.",
                    order_id=instance.order_id,
                    product_id=None  # No product_id for materials
                )

        # Notify seller
        NotificationService.create_notification(
            user=instance.seller,
            notification_type=Notification.ORDER_STATUS,
            title_en="Order Delivered",
            title_ar="تم تسليم الطلب",
            msg_en=f"Order {instance.order_id} has been delivered to the buyer.",
            msg_ar=f"تم تسليم الطلب {instance.order_id} للمشتري.",
            order_id=instance.order_id
        )