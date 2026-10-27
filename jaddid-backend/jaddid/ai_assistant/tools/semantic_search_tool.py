"""Semantic marketplace search tool for the AI assistant."""

from typing import Literal

from langchain_core.tools import tool
from pydantic import BaseModel, ConfigDict, Field

from ..services.marketplace_vector_service import MarketplaceVectorService


class SemanticSearchInput(BaseModel):
    """Validated arguments accepted by :func:`semantic_search_items`."""

    model_config = ConfigDict(extra="forbid")

    query: str = Field(
        description="Natural language description of what the user needs. "
        "Use the user's own words — do not rephrase into product names."
    )
    item_type: Literal["both", "product", "material"] = Field(
        default="both",
        description="Whether to search finished products, raw materials, or both.",
    )
    limit: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Maximum number of results to return.",
    )


def _format_semantic_results(results: list[dict]) -> str:
    """Convert semantic search results into concise text for the model."""
    if not results:
        return "No items found matching your description."

    formatted_results = []
    for index, item in enumerate(results, start=1):
        if item.get("type") == "product":
            formatted_results.append(
                "\n".join(
                    (
                        f"{index}. Product: {item['title']}",
                        f"   ID: {item.get('product_id')}",
                        f"   Description: {item['description']}",
                        f"   Price: {item['price']}",
                        f"   Condition: {item['condition']}",
                        f"   Location: {item['location']}",
                        f"   Category: {item['category']}",
                    )
                )
            )
        else:
            formatted_results.append(
                "\n".join(
                    (
                        f"{index}. Material listing: {item['title']}",
                        f"   ID: {item.get('product_id')}",
                        f"   Description: {item['description']}",
                        f"   Price per {item['unit']}: {item['price_per_unit']}",
                        f"   Condition: {item['condition']}",
                        f"   Location: {item['location']}",
                        f"   Material: {item['material']}",
                        f"   Category: {item['category']}",
                    )
                )
            )

    return f"Found {len(results)} item(s):\n" + "\n\n".join(formatted_results)


@tool(args_schema=SemanticSearchInput)
def semantic_search_items(
    query: str,
    item_type: Literal["both", "product", "material"] = "both",
    limit: int = 5,
) -> str:
    """Search marketplace items by semantic meaning, not exact keywords.

    Use this tool when:
    - The user describes what they need without using exact product names
    - The user is unsure what they want ("something eco-friendly", "I need to carry things")
    - The user describes a use case rather than a product ("something for my factory floor")
    - Keyword search with search_items returned no results
    - The query is vague, descriptive, or uses synonyms

    Do NOT use this when the user gives an exact product name — use search_items instead.
    """
    try:
        results = MarketplaceVectorService().semantic_search(
            query=query,
            item_type=item_type,
            limit=limit,
        )
        return _format_semantic_results(results)
    except Exception:
        return "Unable to search marketplace items right now. Please try again."
