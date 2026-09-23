"""Groq-backed language model service.

LangChain imports are intentionally contained in this module so views can use
only :class:`LLMService`.
"""

from django.conf import settings
from langchain_core.messages import AIMessage, HumanMessage
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

    def chat(self, message: str) -> dict:
        """Return the assistant response together with products found."""
        # Import lazily because the graph imports ``get_llm`` from this module.
        from ..agent.graph import build_graph

        result = build_graph().invoke(
            {
                "messages": [HumanMessage(content=message)],
                "rag_context": "",
                "found_products": [],
            }
        )
        response_message = next(
            (
                graph_message
                for graph_message in reversed(result.get("messages", []))
                if isinstance(graph_message, AIMessage)
            ),
            None,
        )
        response_text = str(response_message.content) if response_message else ""
        found_products = result.get("found_products", []) or []
        return {
            "response": response_text,
            "products": found_products,
        }
