"""MongoDB Atlas Vector Search retrieval support for the AI assistant."""

from __future__ import annotations

from django.conf import settings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient
from pymongo.errors import PyMongoError


class RAGServiceError(Exception):
    """Raised when the knowledge-base vector search cannot be used."""


class RAGService:
    """Retrieve relevant knowledge-base chunks from MongoDB Atlas."""
    _embeddings = None

    def _get_embeddings(self):
        if RAGService._embeddings is None:
            RAGService._embeddings = HuggingFaceEmbeddings(
                model_name=settings.EMBEDDING_MODEL
            )
        return RAGService._embeddings


    def get_vector_store(self) -> MongoDBAtlasVectorSearch:
        """Build the configured Atlas vector store.

        ``MongoClient`` connects lazily, so connection failures that occur while
        searching are also translated by :meth:`retrieve`.
        """
        try:
            client = MongoClient(settings.MONGODB_URI)
            collection = client[settings.MONGODB_DB_NAME][settings.MONGODB_COLLECTION]
            return MongoDBAtlasVectorSearch(
                collection=collection,
                embedding=self._get_embeddings(),
                index_name=settings.MONGODB_VECTOR_INDEX_NAME,
            )
        except PyMongoError as exc:
            raise RAGServiceError(
                "Unable to connect to MongoDB Atlas Vector Search. "
                "Check the MongoDB connection settings."
            ) from exc
        except (AttributeError, TypeError, ValueError) as exc:
            raise RAGServiceError(
                "RAG service configuration is invalid. Ensure MONGODB_URI, "
                "MONGODB_DB_NAME, MONGODB_COLLECTION, and EMBEDDING_MODEL are set."
            ) from exc

    def get_retriever(self, k: int = 3):
        """Return a retriever configured to return the ``k`` best chunks."""
        return self.get_vector_store().as_retriever(search_kwargs={"k": k})

    def retrieve(self, query: str, k: int = 3) -> list[str]:
        """Return the page content of the ``k`` most relevant chunks."""
        try:
            documents = self.get_retriever(k=k).invoke(query)
            return [document.page_content for document in documents]
        except PyMongoError as exc:
            raise RAGServiceError(
                "Unable to retrieve knowledge-base content from MongoDB Atlas Vector Search."
            ) from exc
