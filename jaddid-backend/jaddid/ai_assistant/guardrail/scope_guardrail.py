"""Semantic scope guardrail for the AI assistant.

Uses embedding similarity to determine whether a user message
is within the supported domain before passing it to the agent.
No second LLM call is made — classification is purely embedding-based.
"""

import numpy as np
from django.conf import settings
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

from .scope_examples import IN_SCOPE_EXAMPLES


class ScopeGuardrail:
    THRESHOLD = 0.45  # documented: permissive to avoid false rejections

    # Class-level cache — computed once, reused across all requests
    _scope_embeddings = None
    _embeddings_model = None

    @classmethod
    def _get_embeddings_model(cls):
        """Return the cached FastEmbed embeddings instance for the configured model."""
        if cls._embeddings_model is None:
            cls._embeddings_model = FastEmbedEmbeddings(
                model_name=settings.EMBEDDING_MODEL
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
