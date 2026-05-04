from django.db.models.signals import post_save
from django.dispatch import receiver
from .services import CourierService


print("!!!!!!!! SIGNALS FILE LOADED !!!!!!!!") # <--- Add this at line 1

@receiver(post_save, sender='orders.Order')
def auto_assign_courier(sender, instance, created, **kwargs):
    """Automatically assign a courier when an order is created"""
    if created and instance.order_status == "pending":
        print(f"!!! SIGNAL TRIGGERED FOR ORDER: {instance.order_id} !!!")
        try:
            # Call the service directly
            assignment = CourierService.assign_courier_to_order(instance)
            if assignment:
                print(f"!!! SUCCESS: Assigned Courier {assignment.courier.id} !!!")
            else:
                print("!!! FAILURE: No courier available nearby !!!")
        except Exception as e:
            print(f"!!! CRITICAL ERROR IN SIGNAL: {str(e)} !!!")