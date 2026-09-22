"""LangGraph workflow for retrieval-augmented marketplace conversations."""

from __future__ import annotations

from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
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
    return {"rag_context": context}


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
    workflow.add_node("tools", ToolNode([search_items]))

    workflow.add_edge(START, "retrieve_context")
    workflow.add_edge("retrieve_context", "agent")
    workflow.add_conditional_edges(
        "agent",
        tools_condition,
        {"tools": "tools", END: END},
    )
    workflow.add_edge("tools", "agent")

    return workflow.compile()
