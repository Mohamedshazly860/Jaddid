from decimal import Decimal
from unittest.mock import MagicMock, patch
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from ai_assistant.services.marketplace_vector_service import MarketplaceVectorService
from marketplace.models import Category, Product


@override_settings(SEMANTIC_SEARCH_MIN_SCORE=0.35)
class MarketplaceVectorServiceSemanticSearchTests(TestCase):
    def setUp(self):
        self.seller = get_user_model().objects.create_user(
            email="semantic-search@example.com",
            password="StrongPass123",
            first_name="Semantic",
            last_name="Search",
        )
        self.category = Category.objects.create(name="Plastic")
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            title="PostgreSQL product",
            description="Hydrated from PostgreSQL",
            price=Decimal("42.50"),
            quantity=2,
            condition=Product.GOOD,
            status=Product.ACTIVE,
            location="Cairo",
        )

        self.collection = MagicMock()
        self.collection.aggregate.return_value = []
        self.embeddings = MagicMock()
        self.embeddings.embed_query.return_value = [1.0, 0.0]
        self.service = MarketplaceVectorService()

        collection_patcher = patch.object(
            self.service,
            "_get_collection",
            return_value=self.collection,
        )
        embeddings_patcher = patch.object(
            self.service,
            "_get_embeddings_model",
            return_value=self.embeddings,
        )
        collection_patcher.start()
        embeddings_patcher.start()
        self.addCleanup(collection_patcher.stop)
        self.addCleanup(embeddings_patcher.stop)

    def test_vector_id_missing_from_postgresql_produces_no_result(self):
        self.collection.aggregate.return_value = [
            {
                "product_id": str(uuid4()),
                "type": "product",
                "score": 1.0,
            }
        ]

        results = self.service.semantic_search("plastic product")

        self.assertEqual(results, [])

    def test_results_below_minimum_score_are_dropped(self):
        self.collection.aggregate.return_value = [
            {
                "product_id": str(self.product.id),
                "type": "product",
                "score": 0.34,
            }
        ]

        results = self.service.semantic_search("plastic product")

        self.assertEqual(results, [])

    def test_price_is_hydrated_from_postgresql(self):
        self.collection.aggregate.return_value = [
            {
                "product_id": str(self.product.id),
                "type": "product",
                "score": 0.9,
                "price": "9999.99",
            }
        ]

        results = self.service.semantic_search("plastic product")

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], str(self.product.id))
        self.assertEqual(results[0]["price"], "42.50")
