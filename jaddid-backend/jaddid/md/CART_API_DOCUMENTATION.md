# Shopping Cart API Documentation

## Overview
The Shopping Cart API provides complete cart management functionality for the Jaddid marketplace, supporting both **Products** and **Material Listings**.

---

## Models

### Cart Model
- **Description**: One cart per user (one-to-one relationship)
- **Fields**:
  - `id` (UUID): Unique identifier
  - `user` (OneToOne): Associated user
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp
- **Properties**:
  - `total_items`: Total number of items in cart
  - `total_price`: Sum of all item subtotals

### CartItem Model
- **Description**: Individual items in the cart
- **Fields**:
  - `id` (UUID): Unique identifier
  - `cart` (FK): Associated cart
  - `product` (FK, optional): Product reference
  - `material_listing` (FK, optional): Material listing reference
  - `quantity` (Decimal): Item quantity
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp
- **Properties**:
  - `unit_price`: Price per unit
  - `subtotal`: quantity × unit_price
  - `item`: Returns the product or material listing
- **Constraints**:
  - Must have either product OR material_listing (not both, not neither)
  - Unique cart-product combination
  - Unique cart-material combination

---

## API Endpoints

### Base URL
```
/api/marketplace/cart/
```

### Authentication
All cart endpoints require authentication (Bearer token).

---

## Endpoints

### 1. Get Cart
**GET** `/api/marketplace/cart/`

Gets the current user's cart (creates one if doesn't exist).

**Response:**
```json
{
  "id": "uuid",
  "user": "user_id",
  "user_email": "user@example.com",
  "items": [
    {
      "id": "item_uuid",
      "product": {
        "id": "product_uuid",
        "title": "Product Name",
        "price": 100.00,
        ...
      },
      "material_listing": null,
      "quantity": 2,
      "unit_price": 100.00,
      "subtotal": 200.00,
      "item_type": "product",
      "created_at": "2025-12-13T10:00:00Z",
      "updated_at": "2025-12-13T10:00:00Z"
    }
  ],
  "total_items": 1,
  "total_price": 200.00,
  "created_at": "2025-12-13T09:00:00Z",
  "updated_at": "2025-12-13T10:00:00Z"
}
```

---

### 2. Add Item to Cart
**POST** `/api/marketplace/cart/add_item/`

Adds a product or material listing to the cart. If item already exists, increases quantity.

**Request Body (Product):**
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

**Request Body (Material):**
```json
{
  "material_listing_id": "uuid",
  "quantity": 5.5
}
```

**Response (Success):**
```json
{
  "detail": "Item added to cart",
  "cart": {
    "id": "uuid",
    "items": [...],
    "total_items": 2,
    "total_price": 450.00
  }
}
```

**Response (Item Already Exists):**
```json
{
  "detail": "Item quantity updated",
  "item": {
    "id": "item_uuid",
    "quantity": 4,
    "subtotal": 400.00
  }
}
```

**Validation Errors:**
- Product/material not found
- Product/material not active
- Insufficient stock
- Both product_id and material_listing_id provided
- Neither product_id nor material_listing_id provided

---

### 3. Update Item Quantity
**POST** `/api/marketplace/cart/update_item/`

Updates the quantity of an existing cart item.

**Request Body:**
```json
{
  "item_id": "cart_item_uuid",
  "quantity": 3
}
```

**Response:**
```json
{
  "detail": "Item quantity updated",
  "item": {
    "id": "item_uuid",
    "quantity": 3,
    "unit_price": 100.00,
    "subtotal": 300.00
  }
}
```

**Errors:**
- `item_id is required` (400)
- `Valid quantity is required` (400)
- `Cart item not found` (404)

---

### 4. Remove Item from Cart
**POST** `/api/marketplace/cart/remove_item/`

Removes an item from the cart.

**Request Body:**
```json
{
  "item_id": "cart_item_uuid"
}
```

**Response:**
```json
{
  "detail": "Item removed from cart",
  "cart": {
    "id": "uuid",
    "items": [...],
    "total_items": 1,
    "total_price": 200.00
  }
}
```

**Errors:**
- `item_id is required` (400)
- `Cart item not found` (404)

---

### 5. Clear Cart
**POST** `/api/marketplace/cart/clear/`

Removes all items from the cart.

**Request Body:** (empty)

**Response:**
```json
{
  "detail": "Cart cleared",
  "cart": {
    "id": "uuid",
    "items": [],
    "total_items": 0,
    "total_price": 0.00
  }
}
```

---

## Usage Examples

### JavaScript/Fetch API

#### Get Cart
```javascript
const response = await fetch('/api/marketplace/cart/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const cart = await response.json();
```

#### Add Product to Cart
```javascript
const response = await fetch('/api/marketplace/cart/add_item/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_id: 'product-uuid-here',
    quantity: 2
  })
});
const result = await response.json();
```

#### Add Material to Cart
```javascript
const response = await fetch('/api/marketplace/cart/add_item/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    material_listing_id: 'material-uuid-here',
    quantity: 10.5
  })
});
const result = await response.json();
```

#### Update Quantity
```javascript
const response = await fetch('/api/marketplace/cart/update_item/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    item_id: 'cart-item-uuid',
    quantity: 5
  })
});
const result = await response.json();
```

#### Remove Item
```javascript
const response = await fetch('/api/marketplace/cart/remove_item/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    item_id: 'cart-item-uuid'
  })
});
const result = await response.json();
```

#### Clear Cart
```javascript
const response = await fetch('/api/marketplace/cart/clear/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const result = await response.json();
```

---

## Integration with Orders

When a user is ready to checkout, you can:

1. Get the cart items
2. Create orders for each item (or implement a bulk checkout endpoint)
3. Clear the cart after successful order creation

Example workflow:
```javascript
// 1. Get cart
const cart = await getCart();

// 2. Create orders from cart items
for (const item of cart.items) {
  await createOrder({
    seller: item.product ? item.product.seller : item.material_listing.seller,
    product: item.product?.id,
    material_listing: item.material_listing?.id,
    quantity: item.quantity,
    unit_price: item.unit_price
  });
}

// 3. Clear cart
await clearCart();
```

---

## Admin Panel

The Cart and CartItem models are registered in Django Admin with:

### Cart Admin Features:
- List display: user, total items, total price, timestamps
- Search by user email
- Inline CartItem editing
- Read-only pricing fields

### CartItem Admin Features:
- List display: user, item type, item name, quantity, prices
- Search by user, product, material
- Visual indicators for product vs material
- Automatic price calculations

---

## Business Logic

### Auto-creation
- Cart is automatically created when user first adds an item
- One cart per user (enforced by OneToOne relationship)

### Quantity Management
- If item already in cart, quantity is incremented (not replaced)
- Quantity validation against available stock
- Decimal quantities supported for materials (e.g., 5.5 kg)

### Stock Validation
- Checks product/material status (must be 'active')
- Validates quantity against available stock
- Prevents adding unavailable items

### Price Calculations
- Unit price fetched from product/material at time of addition
- Subtotal calculated automatically (quantity × unit_price)
- Total cart price is sum of all subtotals

---

## Testing Checklist

- [ ] Cart auto-creation on first item add
- [ ] Add product to cart
- [ ] Add material to cart
- [ ] Prevent adding both product and material in same request
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear entire cart
- [ ] Quantity validation (stock availability)
- [ ] Status validation (active items only)
- [ ] Price calculations (subtotal, total)
- [ ] Duplicate item handling (quantity increment)
- [ ] Authentication required for all endpoints

---

## Dependencies

**Models:**
- `accounts.User` - Cart owner
- `marketplace.Product` - Products in cart
- `marketplace.MaterialListing` - Materials in cart

**Only depends on accounts app** ✅

---

## Notes

- Cart persists across sessions
- Cart is not cleared automatically
- Price is snapshot at time of adding to cart (not live price)
- Consider implementing cart expiration/cleanup job for old carts
- Consider bulk checkout endpoint for better UX
