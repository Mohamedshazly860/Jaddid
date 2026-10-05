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
    )


class LLMService:
    """Application-facing wrapper around the assistant LangGraph."""

    def chat(self, message: str, history: list = None) -> dict:
        """Return the assistant response together with products found."""
        # Import lazily because the graph imports ``get_llm`` from this module.
        from ..agent.graph import build_graph
        from langchain_core.messages import AIMessage, HumanMessage

        history_messages = []
        if history:
            for msg in history:
                if msg.role == "user":
                    history_messages.append(HumanMessage(content=msg.content))
                elif msg.role == "assistant":
                    history_messages.append(AIMessage(content=msg.content))

        
        history_messages.append(HumanMessage(content=message))

        result = build_graph().invoke(
            {
                "messages": history_messages,
                "rag_context": "",
                "found_products": [],
            }
        )
        response_message = next(
            (m for m in reversed(result.get("messages", []))
            if isinstance(m, AIMessage)),
            None,
        )
        response_text = str(response_message.content) if response_message else ""
        found_products = result.get("found_products", []) or []
        return {
            "response": response_text,
            "products": found_products,
        }
