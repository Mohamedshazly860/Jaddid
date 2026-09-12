"""Service layer for the AI assistant app."""

from .llm_service import LLMService, get_llm
from .search_service import ProductSearchService

__all__ = ['LLMService', 'ProductSearchService', 'get_llm']
