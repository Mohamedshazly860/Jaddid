"""Semantic scope guardrail for the AI assistant.

Uses embedding similarity to determine whether a user message
is within the supported domain before passing it to the agent.
No second LLM call is made — classification is purely embedding-based.
"""

import re

import numpy as np
from django.conf import settings
from langchain_cohere import CohereEmbeddings
from .scope_examples import IN_SCOPE_EXAMPLES


class ScopeGuardrail:
    THRESHOLD = 0.35  # documented: permissive to avoid false rejections

    # Class-level cache — computed once, reused across all requests
    _scope_embeddings = None
    _embeddings_model = None

    @classmethod
    def _get_embeddings_model(cls):
        """Return the cached FastEmbed embeddings instance for the configured model."""
        if cls._embeddings_model is None:
            cls._embeddings_model = CohereEmbeddings(
            model=settings.EMBEDDING_MODEL,
            cohere_api_key=settings.COHERE_API_KEY
        )
        return cls._embeddings_model

    @classmethod
    def _get_scope_embeddings(cls):
        """Return cached embeddings for the supported in-scope examples."""
        if cls._scope_embeddings is None:
            model = cls._get_embeddings_model()
            cls._scope_embeddings = np.asarray(
                model.embed_documents(IN_SCOPE_EXAMPLES),
                dtype=np.float32,
            )
        return cls._scope_embeddings

    @staticmethod
    def _cosine_similarity(vec_a, vec_b) -> float:
        """Compute cosine similarity between two vectors."""
        a = np.asarray(vec_a, dtype=np.float32)
        b = np.asarray(vec_b, dtype=np.float32)
        denominator = np.linalg.norm(a) * np.linalg.norm(b)
        if denominator == 0:
            return 0.0
        return float(np.dot(a, b) / denominator)

    @classmethod
    def check(cls, message: str) -> dict:
        """Check whether a message falls within the supported marketplace scope."""
        if not isinstance(message, str) or not message.strip():
            return {
                "is_in_scope": True,
                "score": 1.0,
                "rejection_message": "",
            }

        try:
            model = cls._get_embeddings_model()
            msg_embedding = np.asarray(model.embed_query(message), dtype=np.float32)
            scope_embeddings = cls._get_scope_embeddings()

            scores = [
                cls._cosine_similarity(msg_embedding, example_embedding)
                for example_embedding in scope_embeddings
            ]
            max_score = float(max(scores)) if scores else 0.0
            is_in_scope = max_score >= cls.THRESHOLD

            rejection_message = ""
            if not is_in_scope:
                if re.search(r"[\u0600-\u06FF]", message):
                    rejection_message = (
                        "أنا هنا للمساعدة في المنتجات المعاد تدويرها والمواد الخام والطلبات والشحن "
                        "والإرجاع وكل ما يتعلق بمنصة جديد. لا أستطيع المساعدة في أسئلة خارج نطاق المنصة."
                    )
                else:
                    rejection_message = (
                        "I can help with recycled products, raw materials, orders, shipping, returns, "
                        "and other topics related to the Jaddid marketplace. I’m not able to help with "
                        "general questions outside this scope."
                    )

            return {
                "is_in_scope": is_in_scope,
                "score": max_score,
                "rejection_message": rejection_message,
            }
        except Exception:
            return {
                "is_in_scope": True,
                "score": 1.0,
                "rejection_message": "",
            }
