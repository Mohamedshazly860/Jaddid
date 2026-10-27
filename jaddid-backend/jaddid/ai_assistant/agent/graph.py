"""LangGraph workflow for retrieval-augmented marketplace conversations."""

from __future__ import annotations

from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import tools_condition

from ..services.llm_service import get_llm
from ..services.marketplace_vector_service import MarketplaceVectorService
from ..services.rag_service import RAGService
from ..services.search_service import ProductSearchService
from ..tools import SearchItemsInput, _format_results, search_items
from ..tools.semantic_search_tool import semantic_search_items


_TOOL_MAP = {
    "search_items": search_items,
    "semantic_search_items": semantic_search_items,
}


class AgentState(TypedDict):
    """State carried through one assistant conversation."""

    messages: Annotated[list, add_messages]
    rag_context: str
    found_products: list


def _last_human_message(messages: list) -> str:
    """Return the most recent user message, if one is present."""
    for message in reversed(messages):
        if isinstance(message, HumanMessage):
            return str(message.content)
    return ""


def retrieve_context(state: AgentState) -> dict:
    """Retrieve knowledge-base context without making RAG availability fatal."""
    query = _last_human_message(state["messages"])
    try:
        chunks = RAGService().retrieve(query)
        context = "\n\n".join(str(chunk) for chunk in chunks)
    except Exception:
        context = ""
    return {
        "rag_context": context,
        "found_products": state.get("found_products", []),
    }


def execute_tools_and_capture(state: AgentState) -> dict:
    """Execute tool calls and capture structured product data in state.

    Replaces ToolNode + extract_products with a single atomic node.
    Products are stored directly in AgentState — no global side channel.
    Each request has its own state so this is fully thread safe.
    """
    last_message = state["messages"][-1]
    tool_messages = []
    found_products = []

    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]

        if tool_name == "search_items":
            try:
                validated = SearchItemsInput(**tool_call["args"])
                results = ProductSearchService().search(
                    query=validated.query,
                    item_type=validated.item_type,
                    category=validated.category,
                    min_price=validated.min_price,
                    max_price=validated.max_price,
                    condition=validated.condition,
                    location=validated.location,
                    limit=validated.limit,
                )
                found_products = results
                formatted = _format_results(results)
            except Exception:
                formatted = "Unable to search marketplace items right now."

        elif tool_name == "semantic_search_items":
            try:
                from ..tools.semantic_search_tool import (
                    SemanticSearchInput,
                    _format_semantic_results,
                )
                validated = SemanticSearchInput(**tool_call["args"])
                results = MarketplaceVectorService().semantic_search(
                    query=validated.query,
                    item_type=validated.item_type,
                    limit=validated.limit,
                )
                formatted = _format_semantic_results(results)
                for result in results:
                    result["id"] = result.pop("product_id", None)
                found_products = results
            except Exception:
                formatted = "Unable to perform semantic search right now."

        else:
            formatted = f"Unknown tool: {tool_name}"

        tool_messages.append(
            ToolMessage(
                content=formatted,
                tool_call_id=tool_call["id"],
            )
        )

    return {
        "messages": tool_messages,
        "found_products": found_products,
    }


def agent(state: AgentState) -> dict:
    """Ask the model either to answer or request a marketplace-tool call."""
    system_prompt = """You are Jaddid's friendly AI shopping assistant for a recycling marketplace in Egypt.

PERSONALITY:
- Warm, helpful, and encouraging — like a knowledgeable friend
- Celebrate sustainability: "Great choice going green!"
- Be concise but never cold or robotic
- Use the user's language — respond in Arabic if they write in Arabic, English otherwise

FORMATTING — always use markdown:
- Use **bold** for product names and prices
- Use bullet points for listing features or multiple items
- Keep responses short — one sentence introduction then results
- Never write walls of text

TOOL SELECTION:
- User gives exact product name → use search_items (keyword search)
- User describes a need, use case, or is vague → use semantic_search_items
- Keyword search returned nothing → try semantic_search_items automatically
- User asks about policies, shipping, returns → answer from retrieved context

SEARCH BEHAVIOR:
- Search immediately, never ask for details first
- If no results found with one tool, try the other automatically
- Present results warmly: "I found some great options for you! 🌿"

HANDLING UNCERTAIN USERS:
- "I'm not sure what I need" → use semantic_search_items with their context
- "Something for..." → use semantic_search_items directly
- Suggest categories if truly lost: "We have recycled products, raw materials, furniture, plastics, metals..."
"""
    if state["rag_context"]:
        system_prompt += f"\n\nRetrieved context:\n{state['rag_context']}"

    llm = get_llm().bind_tools([search_items, semantic_search_items])
    response = llm.invoke([SystemMessage(content=system_prompt), *state["messages"]])
    return {"messages": [response]}


def build_graph():
    """Compile and return the retrieval-and-tool-calling assistant graph."""
    workflow = StateGraph(AgentState)
    workflow.add_node("retrieve_context", retrieve_context)
    workflow.add_node("agent", agent)
    workflow.add_node("tools", execute_tools_and_capture)

    workflow.add_edge(START, "retrieve_context")
    workflow.add_edge("retrieve_context", "agent")
    workflow.add_conditional_edges(
        "agent",
        tools_condition,
        {"tools": "tools", END: END},
    )
    workflow.add_edge("tools", "agent")

    return workflow.compile()
