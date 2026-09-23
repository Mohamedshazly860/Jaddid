"""LangGraph workflow for retrieval-augmented marketplace conversations."""

from __future__ import annotations

import re
from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from ..services.llm_service import get_llm
from ..services.rag_service import RAGService
from ..tools import search_items


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


_PRODUCT_RESULT = re.compile(
    r"(?:^|\n)\s*\d+\.\s+Product:\s*(?P<title>[^\n]+)(?P<fields>.*?)(?=\n\s*\d+\.\s+(?:Product|Material listing):|\Z)",
    re.DOTALL,
)


def _parse_product_results(content: object) -> list[dict]:
    """Parse the public product format returned by ``search_items``."""
    text = str(content)
    products = []
    field_names = {
        "Description": "description",
        "Price": "price",
        "Condition": "condition",
        "Quantity available": "quantity",
        "Location": "location",
        "Category": "category",
    }
    for match in _PRODUCT_RESULT.finditer(text):
        product = {"title": match.group("title").strip()}
        for line in match.group("fields").splitlines():
            line = line.strip()
            if ":" not in line:
                continue
            label, value = (part.strip() for part in line.split(":", 1))
            if label in field_names:
                product[field_names[label]] = value
        if len(product) == 1:
            return []
        products.append(product)
    return products


_tool_node = ToolNode([search_items])


def execute_tools(state: AgentState) -> dict:
    """Run marketplace tools and retain any product results for downstream use."""
    result = _tool_node.invoke(state)
    messages = result.get("messages", [])
    last_message = messages[-1] if messages else None
    if not isinstance(last_message, ToolMessage):
        return {"messages": messages, "found_products": []}
    try:
        products = _parse_product_results(last_message.content)
    except Exception:
        products = []
    return {"messages": messages, "found_products": products}


def agent(state: AgentState) -> dict:
    """Ask the model either to answer or request a marketplace-tool call."""
    system_prompt = (
        "You are Jaddid's AI shopping assistant for a recycling marketplace. "
        "Use retrieved context when answering policy or platform questions. "
        "Use the search_items tool when users ask about products or materials."
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
    workflow.add_node("tools", execute_tools)

    workflow.add_edge(START, "retrieve_context")
    workflow.add_edge("retrieve_context", "agent")
    workflow.add_conditional_edges(
        "agent",
        tools_condition,
        {"tools": "tools", END: END},
    )
    workflow.add_edge("tools", "agent")

    return workflow.compile()
