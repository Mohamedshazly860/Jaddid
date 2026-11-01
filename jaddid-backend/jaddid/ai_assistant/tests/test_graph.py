"""Tests for the retrieval-and-tool-calling assistant graph."""

from unittest.mock import patch

from django.test import SimpleTestCase
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from ai_assistant.agent.graph import build_graph
from ai_assistant.tools import search_items
from ai_assistant.tools.semantic_search_tool import semantic_search_items


class ScriptedLLM:
    """Small LLM double that returns one predefined response per invocation."""

    def __init__(self, responses):
        self.responses = iter(responses)
        self.invocations = []
        self.bound_tools = None

    def bind_tools(self, tools):
        self.bound_tools = tools
        return self

    def invoke(self, messages):
        self.invocations.append(messages)
        return next(self.responses)


class AssistantGraphTests(SimpleTestCase):
    def invoke_graph(self, message, llm):
        with patch("ai_assistant.agent.graph.get_llm", return_value=llm):
            return build_graph().invoke(
                {"messages": [HumanMessage(content=message)], "rag_context": ""}
            )

    @patch("ai_assistant.agent.graph.RAGService.retrieve", return_value=[])
    def test_english_message_uses_latest_message_language_rule(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="Hello!")])

        self.invoke_graph("hello", llm)

        prompt = llm.invocations[0][0].content
        self.assertIn("same language as the user's latest message", prompt)
        self.assertNotIn("Reply in Arabic only", prompt)

    @patch("ai_assistant.agent.graph.RAGService.retrieve", return_value=[])
    def test_arabic_message_uses_arabic_language_rule(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="مرحبًا")])

        self.invoke_graph("مرحبا", llm)

        prompt = llm.invocations[0][0].content
        self.assertIn("Reply in Arabic only", prompt)

    @patch("ai_assistant.agent.graph.RAGService.retrieve", return_value=[])
    def test_misspelled_english_message_uses_english_language_rule(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="Hello!")])

        self.invoke_graph("helo", llm)

        prompt = llm.invocations[0][0].content
        self.assertIn("same language as the user's latest message", prompt)
        self.assertNotIn("Reply in Arabic only", prompt)

    @patch(
        "ai_assistant.agent.graph.RAGService.retrieve",
        return_value=["Returns are accepted within 14 days."],
    )
    def test_language_rule_is_after_retrieved_context(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="Returns are accepted within 14 days.")])

        self.invoke_graph("What is the return policy?", llm)

        prompt = llm.invocations[0][0].content
        self.assertGreater(
            prompt.index("same language as the user's latest message"),
            prompt.index("Returns are accepted within 14 days."),
        )

    @patch("ai_assistant.agent.graph.RAGService.retrieve", return_value=[])
    def test_system_prompt_specifies_egp(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="Hello!")])

        self.invoke_graph("hello", llm)

        self.assertIn("EGP", llm.invocations[0][0].content)

    @patch("ai_assistant.agent.graph.RAGService.retrieve", return_value=[])
    @patch("ai_assistant.services.search_service.ProductSearchService.search", return_value=[])
    def test_general_conversation_returns_response_without_calling_tools(
        self, mock_search, mock_retrieve
    ):
        llm = ScriptedLLM([AIMessage(content="Hello! How can I help?")])

        result = self.invoke_graph("Hello", llm)

        self.assertEqual(result["messages"][-1].content, "Hello! How can I help?")
        self.assertEqual(len(llm.invocations), 1)
        self.assertEqual(llm.bound_tools, [search_items, semantic_search_items])
        mock_retrieve.assert_called_once_with("Hello")
        mock_search.assert_not_called()


    @patch("ai_assistant.agent.graph.RAGService.retrieve", return_value=[])
    @patch(
        "ai_assistant.agent.graph.ProductSearchService.search",
        return_value=[
            {
                "title": "Recycled Bottle",
                "description": "Good quality",
                "price": "15.00",
                "condition": "good",
                "quantity": 5,
                "location": "Cairo",
                "category": "Plastics",
            }
        ],
    )
    def test_product_query_invokes_search_items_tool(self, mock_search, mock_retrieve):
        llm = ScriptedLLM(
            [
                AIMessage(
                    content="",
                    tool_calls=[
                        {
                            "name": "search_items",
                            "args": {"query": "recycled bottle"},
                            "id": "search-1",
                        }
                    ],
                ),
                AIMessage(content="I found a recycled bottle for you."),
            ]
        )

        result = self.invoke_graph("Find a recycled bottle", llm)

        self.assertEqual(result["messages"][-1].content, "I found a recycled bottle for you.")
        mock_retrieve.assert_called_once_with("Find a recycled bottle")
        mock_search.assert_called_once()

    @patch(
        "ai_assistant.agent.graph.RAGService.retrieve",
        return_value=["Returns are accepted within 14 days."],
    )
    def test_policy_query_includes_rag_context_in_prompt(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="Returns are accepted within 14 days.")])

        self.invoke_graph("What is the return policy?", llm)

        mock_retrieve.assert_called_once_with("What is the return policy?")
        prompt = llm.invocations[0][0]
        self.assertIsInstance(prompt, SystemMessage)
        self.assertIn("Retrieved context:", prompt.content)
        self.assertIn("Returns are accepted within 14 days.", prompt.content)

    @patch(
        "ai_assistant.agent.graph.RAGService.retrieve",
        side_effect=Exception("Vector store unavailable"),
    )
    def test_rag_failure_does_not_prevent_a_response(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="I can still help with that.")])

        result = self.invoke_graph("How does Jaddid work?", llm)

        mock_retrieve.assert_called_once_with("How does Jaddid work?")
        self.assertEqual(result["messages"][-1].content, "I can still help with that.")
        self.assertNotIn("Retrieved context:", llm.invocations[0][0].content)

    @patch("ai_assistant.agent.graph.RAGService.retrieve", return_value=[])
    def test_final_response_content_is_always_a_plain_string(self, mock_retrieve):
        llm = ScriptedLLM([AIMessage(content="Plain text response")])

        result = self.invoke_graph("Hello", llm)

        self.assertIsInstance(result["messages"][-1].content, str)
        self.assertEqual(result["messages"][-1].content, "Plain text response")
