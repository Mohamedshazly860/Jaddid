# Marketplace API Testing Guide

## 🧪 Testing Methodology

This guide provides step-by-step instructions for testing all marketplace features and API endpoints.

---

## 📋 Prerequisites

### 1. Backend Setup
```bash
# Start backend server
cd jaddid-backend/jaddid
python manage.py runserver
```

Verify backend is running:
```bash
curl http://localhost:8000/api/marketplace/products/
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start dev server
npm run dev
```

### 3. Test User Account
Create a test user via:
- Register page: `http://localhost:5173/register`
- Or Django admin: `http://localhost:8000/admin/`

---

## 🎯 Feature Testing Checklist

### 1️⃣ Marketplace Browsing (Public Access)

#### Test Case 1.1: View Marketplace
- [ ] Navigate to `/marketplace`
- [ ] Verify products grid displays
- [ ] Verify materials grid displays
- [ ] Check responsive layout (mobile/tablet/desktop)
- [ ] Verify images load correctly

**Expected API Call**:
```
GET /api/marketplace/products/
GET /api/marketplace/material-listings/
GET /api/marketplace/categories/
```

#### Test Case 1.2: Search Functionality
- [ ] Enter search term "plastic"
- [ ] Click search button
- [ ] Verify filtered results display
- [ ] Clear search and verify all items return

**Expected API Call**:
```
GET /api/marketplace/products/?search=plastic
```

#### Test Case 1.3: Category Filter
- [ ] Select a category from dropdown
- [ ] Verify only items in that category display
- [ ] Select "All Categories"
- [ ] Verify all items return

**Expected API Call**:
```
GET /api/marketplace/products/?category={category_id}
```

#### Test Case 1.4: Sorting
- [ ] Sort by "Newest First" - verify order
- [ ] Sort by "Price: Low to High" - verify order
- [ ] Sort by "Price: High to Low" - verify order
- [ ] Sort by "Most Viewed" - verify order

**Expected API Call**:
```
GET /api/marketplace/products/?ordering=-created_at
GET /api/marketplace/products/?ordering=price
GET /api/marketplace/products/?ordering=-price
```

---

### 2️⃣ Product Detail Page (Public Access)

#### Test Case 2.1: View Product Details
- [ ] Click on any product card
- [ ] Verify redirect to `/marketplace/product/{id}`
- [ ] Verify product title, description, price display
- [ ] Verify seller information displays
- [ ] Check view count increments on page load

**Expected API Call**:
```
GET /api/marketplace/products/{id}/
GET /api/marketplace/products/{id}/reviews/
```

#### Test Case 2.2: Image Gallery
- [ ] Verify main image displays
- [ ] Click thumbnail images
- [ ] Verify main image updates
- [ ] Test with products having multiple images

#### Test Case 2.3: Reviews Section
- [ ] Scroll to reviews section
- [ ] Verify reviews display with ratings
- [ ] Verify "No reviews yet" message if no reviews
- [ ] Check star rating visualization

---

### 3️⃣ Authentication Required Features

#### Test Case 3.1: Login Required Actions
Test these actions **without** logging in:
- [ ] Click "Add to Cart" - should redirect to login
- [ ] Click favorite heart - should show login prompt
- [ ] Try to access `/marketplace/cart` - should redirect to login
- [ ] Try to access `/marketplace/orders` - should redirect to login

Then **login** and verify access is granted.

---

### 4️⃣ Cart Management (Authenticated)

#### Test Case 4.1: Add to Cart
- [ ] Login to application
- [ ] Navigate to marketplace
- [ ] Click "Add to Cart" on a product
- [ ] Verify success toast appears
- [ ] Navigate to `/marketplace/cart`
- [ ] Verify item appears in cart

**Expected API Calls**:
```
POST /api/marketplace/cart/add_item/
Body: { "product_id": "uuid", "quantity": 1 }

GET /api/marketplace/cart/
```

#### Test Case 4.2: Update Quantity
- [ ] Go to cart page
- [ ] Click "+" button on quantity
- [ ] Verify quantity increases
- [ ] Verify subtotal updates
- [ ] Click "-" button
- [ ] Verify quantity decreases
- [ ] Try to set quantity to 0 or negative (should be prevented)

**Expected API Call**:
```
POST /api/marketplace/cart/update_item/
Body: { "item_id": "uuid", "quantity": 3 }
```

#### Test Case 4.3: Remove Item
- [ ] Click "Remove" button on cart item
- [ ] Verify confirmation (if implemented)
- [ ] Verify item is removed from cart
- [ ] Verify total price updates

**Expected API Call**:
```
POST /api/marketplace/cart/remove_item/
Body: { "item_id": "uuid" }
```

#### Test Case 4.4: Clear Cart
- [ ] Add multiple items to cart
- [ ] Click "Clear Cart" button
- [ ] Verify all items removed
- [ ] Verify empty cart state displays

**Expected API Call**:
```
POST /api/marketplace/cart/clear/
```

---

### 5️⃣ Order Management (Authenticated)

#### Test Case 5.1: Create Order (as Buyer)
- [ ] Add item to cart
- [ ] Go to cart page
- [ ] Click "Proceed to Checkout"
- [ ] Fill in delivery details
- [ ] Submit order
- [ ] Verify order appears in "Purchases" tab

**Expected API Call**:
```
POST /api/marketplace/orders/
Body: {
  "product_id": "uuid",
  "quantity": 1,
  "delivery_address": "123 Main St",
  "notes": "Optional notes"
}
```

#### Test Case 5.2: View Orders
- [ ] Navigate to `/marketplace/orders`
- [ ] Click "Purchases" tab
- [ ] Verify your orders display
- [ ] Click on an order
- [ ] Verify order details modal opens
- [ ] Check order status badge

**Expected API Call**:
```
GET /api/marketplace/orders/purchases/
```

#### Test Case 5.3: Order Actions (as Seller)
First, create a product and have another user order it.

- [ ] Click "Sales" tab
- [ ] Find order with "Pending" status
- [ ] Click "Confirm" button
- [ ] Verify status changes to "Confirmed"
- [ ] Click "Complete" button
- [ ] Verify status changes to "Completed"

**Expected API Calls**:
```
POST /api/marketplace/orders/{id}/confirm/
POST /api/marketplace/orders/{id}/complete/
```

#### Test Case 5.4: Cancel Order
- [ ] Find order with "Pending" status
- [ ] Click "Cancel" button
- [ ] Verify order status changes to "Cancelled"
- [ ] Verify "Cancel" button no longer available

**Expected API Call**:
```
POST /api/marketplace/orders/{id}/cancel/
```

---

### 6️⃣ Favorites/Wishlist (Authenticated)

#### Test Case 6.1: Add to Favorites
- [ ] Navigate to marketplace
- [ ] Click heart icon on product card
- [ ] Verify heart fills with color
- [ ] Verify success toast
- [ ] Navigate to product detail page
- [ ] Verify heart is filled there too

**Expected API Call**:
```
POST /api/marketplace/products/{id}/toggle_favorite/
```

#### Test Case 6.2: View Favorites
- [ ] Navigate to `/marketplace/favorites`
- [ ] Verify favorited items display
- [ ] Verify item count is correct
- [ ] Click "View Details" on an item
- [ ] Verify redirects to product page

**Expected API Call**:
```
GET /api/marketplace/favorites/
```

#### Test Case 6.3: Remove from Favorites
- [ ] On favorites page, click trash icon
- [ ] Verify item is removed
- [ ] Verify item count updates
- [ ] Go back to marketplace
- [ ] Verify heart is not filled on that product

**Expected API Call**:
```
DELETE /api/marketplace/favorites/{id}/
```

#### Test Case 6.4: Add to Cart from Favorites
- [ ] On favorites page, click cart icon
- [ ] Verify success toast
- [ ] Navigate to cart
- [ ] Verify item is in cart

---

### 7️⃣ Messaging System (Authenticated)

#### Test Case 7.1: Send Message
- [ ] Navigate to `/marketplace/messages`
- [ ] Click "New Message" button
- [ ] Fill in recipient ID
- [ ] Enter subject
- [ ] Type message
- [ ] Click "Send Message"
- [ ] Verify success toast

**Expected API Call**:
```
POST /api/marketplace/messages/
Body: {
  "recipient_id": "uuid",
  "subject": "Test message",
  "message": "Hello, is this available?"
}
```

#### Test Case 7.2: View Inbox
- [ ] Click "Inbox" tab
- [ ] Verify received messages display
- [ ] Verify unread count badge
- [ ] Click on a message
- [ ] Verify message detail opens
- [ ] Verify message is marked as read
- [ ] Verify badge count decreases

**Expected API Calls**:
```
GET /api/marketplace/messages/inbox/
POST /api/marketplace/messages/{id}/mark_read/
```

#### Test Case 7.3: View Sent Messages
- [ ] Click "Sent" tab
- [ ] Verify sent messages display
- [ ] Verify recipient names correct
- [ ] Click on a message
- [ ] Verify message content displays

**Expected API Call**:
```
GET /api/marketplace/messages/sent/
```

---

## 🔍 API Response Validation

### Success Response Format
Most endpoints return:
```json
{
  "id": "uuid",
  "created_at": "2025-12-17T10:00:00Z",
  "updated_at": "2025-12-17T10:00:00Z",
  // ... other fields
}
```

### Paginated Response Format
List endpoints return:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/marketplace/products/?page=2",
  "previous": null,
  "results": [
    { /* item 1 */ },
    { /* item 2 */ }
  ]
}
```

### Error Response Format
```json
{
  "detail": "Error message",
  "field_name": ["Specific field error"]
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Symptom**: "Access-Control-Allow-Origin" error in console

**Solution**:
```python
# backend settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Issue 2: 401 Unauthorized
**Symptom**: All API calls return 401

**Solutions**:
1. Verify token in localStorage: `localStorage.getItem('token')`
2. Login again
3. Check token expiration
4. Verify backend JWT settings

### Issue 3: 404 Not Found
**Symptom**: API endpoints return 404

**Solutions**:
1. Verify backend server is running
2. Check API base URL in `.env`
3. Verify endpoint path matches backend routes

### Issue 4: Empty Data
**Symptom**: Pages load but no data displays

**Solutions**:
1. Check browser console for errors
2. Verify backend has data (use Swagger UI)
3. Check network tab for API responses
4. Verify data parsing in component

---

## 📊 Performance Testing

### Load Time Targets
- Marketplace page: < 2 seconds
- Product detail: < 1 second
- Cart operations: < 500ms
- API responses: < 300ms

### Network Monitoring
Use Chrome DevTools Network tab:
1. Check API response times
2. Verify no redundant calls
3. Check payload sizes
4. Monitor failed requests

---

## ✅ Test Summary Template

```markdown
## Test Session: [Date]

### Environment
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Browser: Chrome/Firefox/Safari
- User: test@example.com

### Results
- [ ] Marketplace Browsing: PASS/FAIL
- [ ] Product Details: PASS/FAIL
- [ ] Cart Management: PASS/FAIL
- [ ] Order Processing: PASS/FAIL
- [ ] Favorites: PASS/FAIL
- [ ] Messaging: PASS/FAIL

### Issues Found
1. [Description of issue]
2. [Description of issue]

### Notes
- Any additional observations
- Performance notes
- UX feedback
```

---

## 🎯 Automated Testing (Future)

For automated testing, consider:

```javascript
// Example with Testing Library
import { render, screen, waitFor } from '@testing-library/react';
import MarketplacePage from './MarketplacePage';

test('displays products on load', async () => {
  render(<MarketplacePage />);
  
  await waitFor(() => {
    expect(screen.getByText(/marketplace/i)).toBeInTheDocument();
  });
});
```

---

## 📞 Support

If you encounter issues:
1. Check this testing guide
2. Review [MARKETPLACE_IMPLEMENTATION.md](./MARKETPLACE_IMPLEMENTATION.md)
3. Check backend Swagger docs: http://localhost:8000/swagger/
4. Review browser console errors
5. Check network tab for API responses

---

**Happy Testing! 🧪**
