"""Safe marketplace search support for the AI assistant.

The service deliberately exposes a small, fixed set of filters and fields.  It
does not accept model field names or queryset expressions from callers.
"""

from django.db.models import Q

from marketplace.models import MaterialListing, Product


class ProductSearchService:
    """Search active, in-stock marketplace products and material listings."""

    _ITEM_TYPES = {"both", "product", "material"}

    def search(
        self,
        query=None,
        item_type="both",
        category=None,
        min_price=None,
        max_price=None,
        condition=None,
        location=None,
        limit=5,
    ) -> list[dict]:
        """Return safe marketplace search results for the supplied filters.

        ``limit`` is applied to the combined result set, so callers can never
        receive more than ten entries, including when both models are queried.
        """
        normalized_item_type = str(item_type).lower()
        if normalized_item_type not in self._ITEM_TYPES:
            return []

        result_limit = self._clamp_limit(limit)
        results = []

        if normalized_item_type in {"both", "product"}:
            products = self._product_queryset(
                query=query,
                category=category,
                min_price=min_price,
                max_price=max_price,
                condition=condition,
                location=location,
            )[:result_limit]
            results.extend(self._serialize_products(products))

        if normalized_item_type in {"both", "material"}:
            materials = self._material_queryset(
                query=query,
                category=category,
                min_price=min_price,
                max_price=max_price,
                condition=condition,
                location=location,
            )[:result_limit]
            results.extend(self._serialize_materials(materials))

        return results[:result_limit]

    @staticmethod
    def _clamp_limit(limit) -> int:
        """Coerce a tool argument to the allowed inclusive range."""
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 5
        return max(1, min(limit, 10))

    @staticmethod
    def _product_queryset(
        *, query, category, min_price, max_price, condition, location
    ):
        products = Product.objects.filter(status=Product.ACTIVE, quantity__gt=0)

        if query:
            products = products.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            )
        if category:
            products = products.filter(category__name__icontains=category)
        if min_price is not None:
            products = products.filter(price__gte=min_price)
        if max_price is not None:
            products = products.filter(price__lte=max_price)
        if condition:
            products = products.filter(condition=condition)
        if location:
            products = products.filter(location__icontains=location)

        return products

    @staticmethod
    def _material_queryset(
        *, query, category, min_price, max_price, condition, location
    ):
        materials = MaterialListing.objects.filter(
            status=MaterialListing.ACTIVE,
            quantity__gt=0,
        )

        if query:
            materials = materials.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            )
        if category:
            materials = materials.filter(
                material__category__name__icontains=category
            )
        if min_price is not None:
            materials = materials.filter(price_per_unit__gte=min_price)
        if max_price is not None:
            materials = materials.filter(price_per_unit__lte=max_price)
        if condition:
            materials = materials.filter(condition=condition)
        if location:
            materials = materials.filter(location__icontains=location)

        return materials

    @staticmethod
    def _serialize_products(products) -> list[dict]:
        return [
            {
                "title": product["title"],
                "description": product["description"],
                "price": product["price"],
                "condition": product["condition"],
                "quantity": product["quantity"],
                "location": product["location"],
                "category": product["category__name"],
            }
            for product in products.values(
                "title",
                "description",
                "price",
                "condition",
                "quantity",
                "location",
                "category__name",
            )
        ]

    @staticmethod
    def _serialize_materials(materials) -> list[dict]:
        return [
            {
                "title": material["title"],
                "description": material["description"],
                "price_per_unit": material["price_per_unit"],
                "unit": material["unit"],
                "condition": material["condition"],
                "quantity": material["quantity"],
                "location": material["location"],
                "material": material["material__name"],
                "category": material["material__category__name"],
            }
            for material in materials.values(
                "title",
                "description",
                "price_per_unit",
                "unit",
                "condition",
                "quantity",
                "location",
                "material__name",
                "material__category__name",
            )
        ]
