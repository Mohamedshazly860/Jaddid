"""LangChain tools exposed by the AI assistant."""

from decimal import Decimal
from typing import Literal

from langchain_core.tools import tool
from pydantic import BaseModel, ConfigDict, Field

from .services import ProductSearchService


class SearchItemsInput(BaseModel):
    """Validated arguments accepted by :func:`search_items`."""

    model_config = ConfigDict(extra="forbid")

    query: str | None = Field(
        default=None,
        description="Text to match in an item's title or description.",
    )
    item_type: Literal["both", "product", "material"] = Field(
        default="both",
        description="Whether to search finished products, raw materials, or both.",
    )
    category: str | None = Field(
        default=None,
        description="Category name to match.",
    )
    min_price: Decimal | None = Field(
        default=None,
        description="Minimum item price (or price per unit for materials).",
    )
    max_price: Decimal | None = Field(
        default=None,
        description="Maximum item price (or price per unit for materials).",
    )
    condition: str | None = Field(
        default=None,
        description="Item condition, such as good, new, or excellent.",
    )
    location: str | None = Field(
        default=None,
        description="Location text to match.",
    )
    limit: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Maximum number of results to return, from 1 through 10.",
    )


def _format_results(results: list[dict]) -> str:
    """Convert allowlisted search data into concise text for the model."""
    if not results:
        return "No items found matching your criteria."

    formatted_results = []
    for index, item in enumerate(results, start=1):
        if "price" in item:
            formatted_results.append(
                "\n".join(
                    (
                        f"{index}. Product: {item['title']}",
                        f"   Description: {item['description']}",
                        f"   Price: {item['price']}",
                        f"   Condition: {item['condition']}",
                        f"   Quantity available: {item['quantity']}",
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
                        f"   Description: {item['description']}",
                        f"   Price per {item['unit']}: {item['price_per_unit']}",
                        f"   Condition: {item['condition']}",
                        f"   Quantity available: {item['quantity']} {item['unit']}",
                        f"   Location: {item['location']}",
                        f"   Material: {item['material']}",
                        f"   Category: {item['category']}",
                    )
                )
            )

    return f"Found {len(results)} item(s):\n" + "\n\n".join(formatted_results)


@tool(
    args_schema=SearchItemsInput,
    handle_validation_error="Invalid search arguments. Please provide valid search filters.",
)
def search_items(
    query: str | None = None,
    item_type: Literal["both", "product", "material"] = "both",
    category: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    condition: str | None = None,
    location: str | None = None,
    limit: int = 5,
) -> str:
    """Search active, in-stock marketplace products and raw material listings.

    Use this tool when a user asks to find, browse, or compare recyclable
    marketplace items. It can search title/description text and narrow results
    by item type, category, price, condition, or location. Results contain only
    public listing information and never seller contact details.
    """
    try:
        results = ProductSearchService().search(
            query=query,
            item_type=item_type,
            category=category,
            min_price=min_price,
            max_price=max_price,
            condition=condition,
            location=location,
            limit=limit,
        )
        return _format_results(results)
    except Exception:
        return "Unable to search marketplace items right now. Please try again later."
