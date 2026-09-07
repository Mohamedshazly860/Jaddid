"""OpenRouter-backed language model service.

LangChain imports are intentionally contained in this module so views can use
only :class:`LLMService`.
"""

from django.conf import settings
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI


# OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'


def get_llm() -> ChatOpenAI:
    """Create a ChatOpenAI client configured for OpenRouter."""
    return ChatOpenAI(
        model=settings.OPENROUTER_MODEL,
        api_key=settings.OPENROUTER_API_KEY,
        base_url=settings.OPENROUTER_BASE_URL,
    )


class LLMService:
    """Small application-facing wrapper around the configured LLM."""

    def chat(self, message: str) -> str:
        """Send a user message and return the model response as plain text."""
        response = get_llm().invoke([HumanMessage(content=message)])
        return str(response.content)
