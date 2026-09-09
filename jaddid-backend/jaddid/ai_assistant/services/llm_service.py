"""Groq-backed language model service.

LangChain imports are intentionally contained in this module so views can use
only :class:`LLMService`.
"""

from django.conf import settings
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI


def get_llm() -> ChatOpenAI:
    """Create a ChatOpenAI client configured for Groq's compatible API."""
    return ChatOpenAI(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        base_url=settings.GROQ_BASE_URL,
    )


class LLMService:
    """Small application-facing wrapper around the configured LLM."""

    def chat(self, message: str) -> str:
        """Send a user message and return the model response as plain text."""
        response = get_llm().invoke([HumanMessage(content=message)])
        return str(response.content)
