"""Groq-backed language model service.

LangChain imports are intentionally contained in this module so views can use
only :class:`LLMService`.
"""

from django.conf import settings
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_groq import ChatGroq

def get_llm() -> ChatGroq:
    """Create a ChatGroq client configured for Groq's compatible API."""
    return ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        base_url=settings.GROQ_BASE_URL,
    )


class LLMService:
    """Small application-facing wrapper around the configured LLM."""

    def chat(self, message: str) -> str:
        """Return an answer, executing a requested marketplace search if needed."""
        # Importing lazily prevents a cycle while ``ai_assistant.tools`` imports
        # the marketplace search service.
        from ..tools import search_items

        llm = get_llm().bind_tools([search_items])
        messages = [HumanMessage(content=message)]
        response = llm.invoke(messages)

        if not response.tool_calls:
            return str(response.content)

        messages.append(response)
        for tool_call in response.tool_calls:
            if tool_call["name"] == search_items.name:
                tool_result = search_items.invoke(tool_call["args"])
            else:
                tool_result = "Requested tool is unavailable."

            messages.append(
                ToolMessage(
                    content=str(tool_result),
                    tool_call_id=tool_call["id"],
                )
            )

        response = llm.invoke(messages)
        return str(response.content)
