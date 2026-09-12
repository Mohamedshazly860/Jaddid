from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from ai_assistant.services.search_service import ProductSearchService
from marketplace.models import Category, Material, MaterialListing, Product


class ProductSearchServiceTests(TestCase):
    def setUp(self):
        self.seller = get_user_model().objects.create_user(
            email="seller@example.com",
            password="StrongPass123",
            first_name="Marketplace",
            last_name="Seller",
        )
        self.category = Category.objects.create(name="Plastic")
        self.material = Material.objects.create(
            name="PET plastic",
            category=self.category,
        )
        self.service = ProductSearchService()

        self.active_product = self.create_product(
            title="Vintage Bottle Planter",
            price=Decimal("10.00"),
        )
        self.expensive_product = self.create_product(
            title="Premium Recycled Chair",
            price=Decimal("100.00"),
        )
        self.inactive_product = self.create_product(
            title="Inactive Bottle Planter",
            status=Product.SOLD,
        )
        self.out_of_stock_product = self.create_product(
            title="Out of Stock Bottle Planter",
            quantity=0,
        )
        self.active_material = self.create_material_listing(
            title="Clean PET flakes",
            price_per_unit=Decimal("8.00"),
        )
        self.inactive_material = self.create_material_listing(
            title="Sold PET flakes",
            status=MaterialListing.SOLD,
        )
        self.out_of_stock_material = self.create_material_listing(
            title="Empty PET flakes",
            quantity=Decimal("0"),
        )

    def create_product(self, **overrides):
        values = {
            "seller": self.seller,
            "category": self.category,
            "title": "Recycled Product",
            "description": "A recyclable finished good",
            "price": Decimal("20.00"),
            "quantity": 1,
            "condition": Product.GOOD,
            "status": Product.ACTIVE,
            "location": "Cairo",
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def create_material_listing(self, **overrides):
        values = {
            "seller": self.seller,
            "material": self.material,
            "title": "PET material listing",
            "description": "Sorted recyclable plastic",
            "price_per_unit": Decimal("15.00"),
            "unit": "kg",
            "quantity": Decimal("5.00"),
            "condition": MaterialListing.GOOD,
            "status": MaterialListing.ACTIVE,
            "location": "Cairo",
        }
        values.update(overrides)
        return MaterialListing.objects.create(**values)

    def test_valid_search_returns_matching_results(self):
        results = self.service.search(query="vintage", item_type="product")

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], self.active_product.title)

    def test_empty_query_returns_active_items(self):
        results = self.service.search(query="", item_type="both", limit=10)
        titles = {result["title"] for result in results}

        self.assertIn(self.active_product.title, titles)
        self.assertIn(self.active_material.title, titles)

    def test_price_filtering_uses_the_item_price(self):
        results = self.service.search(
            item_type="both",
            min_price=Decimal("7.00"),
            max_price=Decimal("10.00"),
            limit=10,
        )
        titles = {result["title"] for result in results}

        self.assertEqual(titles, {self.active_product.title, self.active_material.title})

    def test_limit_is_enforced_and_never_exceeds_ten(self):
        for number in range(12):
            self.create_product(title=f"Extra product {number}")

        results = self.service.search(item_type="product", limit=100)

        self.assertEqual(len(results), 10)
        self.assertLessEqual(len(results), 10)

    def test_inactive_products_are_never_returned(self):
        results = self.service.search(query="bottle", item_type="product")
        titles = {result["title"] for result in results}

        self.assertIn(self.active_product.title, titles)
        self.assertNotIn(self.inactive_product.title, titles)

    def test_out_of_stock_items_are_never_returned(self):
        results = self.service.search(query="flakes", item_type="both", limit=10)
        titles = {result["title"] for result in results}

        self.assertIn(self.active_material.title, titles)
        self.assertNotIn(self.out_of_stock_material.title, titles)

        product_results = self.service.search(query="bottle", item_type="product")
        product_titles = {result["title"] for result in product_results}
        self.assertNotIn(self.out_of_stock_product.title, product_titles)

    def test_seller_email_is_never_in_returned_fields(self):
        results = self.service.search(item_type="both", limit=10)

        for result in results:
            self.assertNotIn("seller", result)
            self.assertNotIn("seller_email", result)
            self.assertNotIn(self.seller.email, result.values())

    def test_item_type_filtering_returns_requested_models_only(self):
        product_results = self.service.search(item_type="product", limit=10)
        material_results = self.service.search(item_type="material", limit=10)
        both_results = self.service.search(item_type="both", limit=10)

        self.assertTrue(product_results)
        self.assertTrue(material_results)
        self.assertTrue(all("price" in result for result in product_results))
        self.assertTrue(all("price_per_unit" in result for result in material_results))
        self.assertIn(self.active_product.title, {item["title"] for item in both_results})
        self.assertIn(self.active_material.title, {item["title"] for item in both_results})
