"""
Django signals for automatic marketplace vectorization.

These signals ensure that whenever a Product or MaterialListing
is saved or deleted, its vector in MongoDB is kept in sync.

The entire signal handler is wrapped in try/except — AI vectorization
must never crash or block a marketplace save operation.
"""

import logging

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from marketplace.models import MaterialListing, Product


logger = logging.getLogger(__name__)


@receiver(post_save, sender=Product)
def sync_product_vector(sender, instance, **kwargs):
    """Vectorize or remove product vector when product is saved."""
    try:
        from .services.marketplace_vector_service import MarketplaceVectorService

        service = MarketplaceVectorService()
        if instance.status == Product.ACTIVE and instance.quantity > 0:
            service.vectorize_product(instance)
        else:
            service.remove_vector(str(instance.id))
    except Exception:
        logger.exception("Failed to sync product vector for product %s", instance.id)


@receiver(post_delete, sender=Product)
def remove_product_vector_on_delete(sender, instance, **kwargs):
    """Remove product vector when product is hard deleted."""
    try:
        from .services.marketplace_vector_service import MarketplaceVectorService

        MarketplaceVectorService().remove_vector(str(instance.id))
    except Exception:
        logger.exception("Failed to remove product vector for product %s", instance.id)


@receiver(post_save, sender=MaterialListing)
def sync_material_vector(sender, instance, **kwargs):
    """Vectorize or remove material vector when material listing is saved."""
    try:
        from .services.marketplace_vector_service import MarketplaceVectorService

        service = MarketplaceVectorService()
        if instance.status == MaterialListing.ACTIVE and instance.quantity > 0:
            service.vectorize_material(instance)
        else:
            service.remove_vector(str(instance.id))
    except Exception:
        logger.exception(
            "Failed to sync material vector for material %s", instance.id
        )


@receiver(post_delete, sender=MaterialListing)
def remove_material_vector_on_delete(sender, instance, **kwargs):
    """Remove material vector when material listing is hard deleted."""
    try:
        from .services.marketplace_vector_service import MarketplaceVectorService

        MarketplaceVectorService().remove_vector(str(instance.id))
    except Exception:
        logger.exception(
            "Failed to remove material vector for material %s", instance.id
        )
