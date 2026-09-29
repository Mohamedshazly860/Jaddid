"""LangGraph workflow for retrieval-augmented marketplace conversations."""

from __future__ import annotations

from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import tools_condition

from ..services.llm_service import get_llm
from ..services.rag_service import RAGService
from ..services.search_service import ProductSearchService
from ..tools import SearchItemsInput, _format_results, search_items


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
        if tool_call["name"] == "search_items":
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
                results = []
                formatted = "Unable to search marketplace items right now."

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
    system_prompt = (
        """You are Jaddid's AI shopping assistant for a recycling marketplace.

        CORE BEHAVIOR — SEARCH FIRST, ASK LATER:
        - When a user mentions any product or material, search immediately using search_items
        - Never ask for price, condition, category, or location before searching
        - Show results first, then offer to refine if needed
        - Only ask a clarifying question if the user's request is completely ambiguous (e.g. just "hello" with no product intent)

        SEARCH STRATEGY:
        - Use the user's words directly as the search query
        - Start with broad searches — do not over-filter on first attempt
        - If search returns no results, try a broader query before telling the user nothing was found
        - If results exist, present them and ask if they want to filter by price or condition

        RESPONSE STYLE:
        - Be concise and direct — 1-2 sentences before showing results
        - Never ask more than one question at a time
        - Never ask for information you can search without

        KNOWLEDGE BASE:
        - Use retrieved context to answer policy, shipping, and platform questions
        - If context was retrieved, answer from it directly without asking follow-up questions
        """
    )
    if state["rag_context"]:
        system_prompt += f"\n\nRetrieved context:\n{state['rag_context']}"

    llm = get_llm().bind_tools([search_items])
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
