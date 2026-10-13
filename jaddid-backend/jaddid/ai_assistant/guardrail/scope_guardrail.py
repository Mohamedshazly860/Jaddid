"""Semantic scope guardrail for the AI assistant.

Uses embedding similarity to determine whether a user message
is within the supported domain before passing it to the agent.
No second LLM call is made — classification is purely embedding-based.
"""

from django.conf import settings
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings


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
