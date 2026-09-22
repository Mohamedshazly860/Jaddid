"""Groq-backed language model service.

LangChain imports are intentionally contained in this module so views can use
only :class:`LLMService`.
"""

from django.conf import settings
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

def get_llm() -> ChatGroq:
    """Create a ChatGroq client configured for Groq's compatible API."""
    return ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        base_url=settings.GROQ_BASE_URL,
    )


class LLMService:
    """Application-facing wrapper around the assistant LangGraph."""

    def chat(self, message: str) -> str:
        """Return the final graph response as the view's expected plain string."""
        # Import lazily because the graph imports ``get_llm`` from this module.
        from ..agent.graph import build_graph

        result = build_graph().invoke(
            {"messages": [HumanMessage(content=message)], "rag_context": ""}
        )
        return str(result["messages"][-1].content)
