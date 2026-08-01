from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CourierAssignment
from .services import CourierService


print("!!!!!!!! SIGNALS FILE LOADED !!!!!!!!") # <--- DEBUGGING PURPOSES ONLY

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


# These automatically manage courier availability based on assignment state.
# No manual toggling needed anywhere in your views or serializers.
@receiver(post_save, sender=CourierAssignment)
def sync_courier_availability(sender, instance, created, **kwargs):
    """
    - When a new assignment is created → courier becomes unavailable
    - When assignment is marked completed or rejected → courier becomes available again
    """
    courier = instance.courier

    if created:
        # A new assignment was just created — lock the courier
        courier.mark_unavailable()
        return

    # Assignment was updated — check if it's now finished
    assignment_finished = (
        instance.completed_at is not None or  # order delivered
        instance.rejected is True              # courier rejected the order
    )

    if assignment_finished and not courier.is_available:
        courier.mark_available()