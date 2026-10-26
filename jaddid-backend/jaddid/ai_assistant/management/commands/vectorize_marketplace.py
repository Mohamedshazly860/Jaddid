from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Vectorize all active marketplace products and material listings into MongoDB."

    def handle(self, *args, **options):
        from marketplace.models import MaterialListing, Product
        from ai_assistant.services.marketplace_vector_service import (
            MarketplaceVectorService,
        )

        service = MarketplaceVectorService()

        products = Product.objects.filter(
            status=Product.ACTIVE,
            quantity__gt=0,
        ).select_related("category")

        product_count = 0
        product_failed = 0
        self.stdout.write(f"Vectorizing {products.count()} active products...")

        for product in products:
            if service.vectorize_product(product):
                product_count += 1
            else:
                product_failed += 1
                self.stderr.write(self.style.ERROR(f"Failed: {product.title}"))

        materials = MaterialListing.objects.filter(
            status=MaterialListing.ACTIVE,
            quantity__gt=0,
        ).select_related("material__category")

        material_count = 0
        material_failed = 0
        self.stdout.write(
            f"Vectorizing {materials.count()} active material listings..."
        )

        for material in materials:
            if service.vectorize_material(material):
                material_count += 1
            else:
                material_failed += 1
                self.stderr.write(self.style.ERROR(f"Failed: {material.title}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Products: {product_count} vectorized, {product_failed} failed. "
                f"Materials: {material_count} vectorized, {material_failed} failed."
            )
        )
