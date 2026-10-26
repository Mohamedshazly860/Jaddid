"""Marketplace vectorization service.

Embeds Product and MaterialListing objects into MongoDB Atlas
for semantic similarity search. Runs independently from the
knowledge base RAG collection.
"""

import logging

from django.conf import settings
from langchain_cohere import CohereEmbeddings
from pymongo import MongoClient
from pymongo.errors import PyMongoError


logger = logging.getLogger(__name__)


class MarketplaceVectorService:
    """Embed and search marketplace products and material listings."""

    _embeddings_model = None

    @classmethod
    def _get_embeddings_model(cls):
        """Return the cached Cohere embeddings model."""
        if cls._embeddings_model is None:
            cls._embeddings_model = CohereEmbeddings(
                model=settings.EMBEDDING_MODEL,
                cohere_api_key=settings.COHERE_API_KEY,
            )
        return cls._embeddings_model

    def _get_collection(self):
        """Return the MongoDB collection used for marketplace vectors."""
        try:
            client = MongoClient(settings.MONGODB_URI)
            return client[settings.MONGODB_DB_NAME][
                settings.MONGODB_PRODUCT_COLLECTION
            ]
        except PyMongoError as exc:
            raise RuntimeError(
                "Unable to connect to the marketplace vector collection."
            ) from exc

    def _build_product_text(self, product) -> str:
        """Build searchable text from a marketplace product."""
        parts = [
            product.title,
            product.description[:300],
            product.condition,
            product.category.name,
            product.location,
        ]
        return " ".join(str(part) for part in parts if part)

    def _build_material_text(self, material) -> str:
        """Build searchable text from a material listing."""
        parts = [
            material.title,
            material.description[:300],
            material.condition,
            material.material.name,
            material.material.category.name,
            material.location,
            material.unit,
        ]
        return " ".join(str(part) for part in parts if part)

    def vectorize_product(self, product) -> bool:
        """Embed and upsert a product into the marketplace vector collection."""
        try:
            text = self._build_product_text(product)
            embedding = self._get_embeddings_model().embed_query(text)
            self._get_collection().update_one(
                {"product_id": str(product.id)},
                {
                    "$set": {
                        "product_id": str(product.id),
                        "type": "product",
                        "title": product.title,
                        "description": product.description[:300],
                        "price": str(product.price),
                        "condition": product.condition,
                        "location": product.location,
                        "category": product.category.name,
                        "embedding": embedding,
                        "status": product.status,
                        "quantity": float(product.quantity),
                    }
                },
                upsert=True,
            )
            return True
        except Exception:
            logger.exception("Failed to vectorize product %s", getattr(product, "id", None))
            return False

    def vectorize_material(self, material) -> bool:
        """Embed and upsert a material listing into the vector collection."""
        try:
            text = self._build_material_text(material)
            embedding = self._get_embeddings_model().embed_query(text)
            self._get_collection().update_one(
                {"product_id": str(material.id)},
                {
                    "$set": {
                        "product_id": str(material.id),
                        "type": "material",
                        "title": material.title,
                        "description": material.description[:300],
                        "price_per_unit": str(material.price_per_unit),
                        "unit": material.unit,
                        "condition": material.condition,
                        "location": material.location,
                        "material": material.material.name,
                        "category": material.material.category.name,
                        "embedding": embedding,
                        "status": material.status,
                        "quantity": float(material.quantity),
                    }
                },
                upsert=True,
            )
            return True
        except Exception:
            logger.exception(
                "Failed to vectorize material %s", getattr(material, "id", None)
            )
            return False

    def remove_vector(self, item_id: str) -> bool:
        """Remove a marketplace vector by its marketplace item ID."""
        try:
            self._get_collection().delete_one({"product_id": item_id})
            return True
        except Exception:
            logger.exception("Failed to remove marketplace vector %s", item_id)
            return False

    def semantic_search(
        self, query: str, item_type: str = "both", limit: int = 5
    ) -> list[dict]:
        """Return active marketplace items semantically similar to ``query``."""
        try:
            limit = max(1, min(10, limit))
            query_embedding = self._get_embeddings_model().embed_query(query)
            vector_stage = {
                "$vectorSearch": {
                    "index": settings.MONGODB_VECTOR_PRODUCT_INDEX,
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": limit * 10,
                    "limit": limit,
                }
            }
            pipeline = [vector_stage]
            if item_type in ("product", "material"):
                pipeline.append({"$match": {"type": item_type}})
            pipeline.extend(
                [
                    {
                        "$match": {
                            "status": "active",
                            "quantity": {"$gt": 0},
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "product_id": 1,
                            "type": 1,
                            "title": 1,
                            "description": 1,
                            "price": 1,
                            "price_per_unit": 1,
                            "unit": 1,
                            "condition": 1,
                            "location": 1,
                            "category": 1,
                            "material": 1,
                        }
                    },
                ]
            )
            return list(self._get_collection().aggregate(pipeline))
        except Exception:
            logger.exception("Failed to perform marketplace semantic search")
            return []
