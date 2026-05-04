# API Usage Examples - أمثلة استخدام API

## English Examples

### Authentication (to be implemented in accounts app)

```bash
# Login (example - implement in accounts app)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# Use token in requests
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  http://localhost:8000/api/marketplace/products/
```

### 1. Categories - الفئات

#### List all categories
```bash
GET /api/marketplace/categories/

# Response
[
  {
    "id": "uuid",
    "name": "Plastics",
    "name_ar": "البلاستيك",
    "description": "All plastic materials",
    "icon": "/media/categories/2025/12/plastic.jpg",
    "parent": null,
    "subcategories": [...],
    "is_active": true,
    "product_count": 15
  }
]
```

#### Get category tree
```bash
GET /api/marketplace/categories/tree/
```

#### Create category (Admin only)
```bash
POST /api/marketplace/categories/
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Metal Scraps",
  "name_ar": "خردة المعادن",
  "description": "Various metal materials",
  "parent": null,
  "is_active": true
}
```

### 2. Products - المنتجات

#### List products with filters
```bash
# All products
GET /api/marketplace/products/

# Filter by category
GET /api/marketplace/products/?category=uuid

# Filter by condition
GET /api/marketplace/products/?condition=good

# Price range
GET /api/marketplace/products/?min_price=100&max_price=500

# Search
GET /api/marketplace/products/?search=plastic

# Order by price
GET /api/marketplace/products/?ordering=price

# Multiple filters
GET /api/marketplace/products/?category=uuid&condition=good&min_price=100&ordering=-created_at
```

#### Get product details
```bash
GET /api/marketplace/products/{id}/

# Response
{
  "id": "uuid",
  "seller": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Company"
  },
  "category": {...},
  "title": "High-Quality Plastic Bottles",
  "title_ar": "زجاجات بلاستيك عالية الجودة",
  "description": "Clean recycled plastic bottles...",
  "description_ar": "زجاجات بلاستيك معاد تدويرها نظيفة...",
  "price": "250.00",
  "quantity": 100,
  "unit": "kg",
  "condition": "good",
  "status": "active",
  "location": "Cairo, Egypt",
  "latitude": "30.044420",
  "longitude": "31.235712",
  "images": [
    {
      "id": "uuid",
      "image": "/media/products/2025/12/bottle1.jpg",
      "is_primary": true,
      "order": 0
    }
  ],
  "views_count": 45,
  "favorites_count": 8,
  "is_favorited": false,
  "average_rating": 4.5,
  "review_count": 3,
  "created_at": "2025-12-10T10:00:00Z",
  "published_at": "2025-12-10T10:05:00Z"
}
```

#### Create product
```bash
POST /api/marketplace/products/
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "category": "uuid",
  "title": "Recycled Aluminum Cans",
  "title_ar": "علب الألومنيوم المعاد تدويرها",
  "description": "Clean aluminum cans ready for recycling",
  "description_ar": "علب ألومنيوم نظيفة جاهزة لإعادة التدوير",
  "price": 150.00,
  "quantity": 500,
  "unit": "kg",
  "condition": "good",
  "status": "draft",
  "location": "Alexandria, Egypt",
  "latitude": 31.200092,
  "longitude": 29.918739,
  "uploaded_images": [<file1>, <file2>, <file3>]
}
```

#### Update product
```bash
PUT /api/marketplace/products/{id}/
Content-Type: application/json
Authorization: Bearer <token>

{
  "price": 180.00,
  "quantity": 450,
  "status": "active"
}
```

#### Publish draft product
```bash
POST /api/marketplace/products/{id}/publish/
Authorization: Bearer <token>
```

#### Toggle favorite
```bash
POST /api/marketplace/products/{id}/toggle_favorite/
Authorization: Bearer <token>

# Response
{
  "message": "Product added to favorites",
  "is_favorited": true
}
```

#### Get my products
```bash
GET /api/marketplace/products/my_products/
Authorization: Bearer <token>
```

### 3. Favorites - المفضلة

#### List favorites
```bash
GET /api/marketplace/favorites/
Authorization: Bearer <token>

# Response
[
  {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "title": "Recycled Paper",
      "price": "50.00",
      "primary_image": "/media/products/paper.jpg"
    },
    "created_at": "2025-12-10T10:00:00Z"
  }
]
```

#### Add to favorites
```bash
POST /api/marketplace/favorites/
Content-Type: application/json
Authorization: Bearer <token>

{
  "product_id": "uuid"
}
```

#### Remove from favorites
```bash
DELETE /api/marketplace/favorites/{id}/
Authorization: Bearer <token>
```

### 4. Orders - الطلبات

#### Create order
```bash
POST /api/marketplace/orders/
Content-Type: application/json
Authorization: Bearer <token>

{
  "product_id": "uuid",
  "quantity": 50,
  "notes": "Please deliver to warehouse",
  "delivery_address": "123 Main St, Cairo"
}

# Response
{
  "id": "uuid",
  "order_number": "ORD-20251210120000-A1B2C3D4",
  "buyer": "uuid",
  "buyer_name": "John Doe",
  "seller": "uuid",
  "seller_name": "Jane Smith",
  "product": "uuid",
  "product_title": "Recycled Plastic",
  "quantity": 50,
  "unit_price": "250.00",
  "total_price": "12500.00",
  "status": "pending",
  "payment_status": "unpaid",
  "created_at": "2025-12-10T12:00:00Z"
}
```

#### List my purchases
```bash
GET /api/marketplace/orders/purchases/
Authorization: Bearer <token>
```

#### List my sales
```bash
GET /api/marketplace/orders/sales/
Authorization: Bearer <token>
```

#### Confirm order (seller)
```bash
POST /api/marketplace/orders/{id}/confirm/
Authorization: Bearer <token>
```

#### Complete order (seller)
```bash
POST /api/marketplace/orders/{id}/complete/
Authorization: Bearer <token>
```

#### Cancel order
```bash
POST /api/marketplace/orders/{id}/cancel/
Authorization: Bearer <token>
```

### 5. Reviews - المراجعات

#### Create review
```bash
POST /api/marketplace/reviews/
Content-Type: application/json
Authorization: Bearer <token>

{
  "product_id": "uuid",
  "order": "uuid",
  "rating": 5,
  "title": "Excellent quality!",
  "comment": "The material quality exceeded my expectations. Highly recommended!"
}
```

#### Get product reviews
```bash
GET /api/marketplace/products/{id}/reviews/
```

#### Get my reviews
```bash
GET /api/marketplace/reviews/my_reviews/
Authorization: Bearer <token>
```

### 6. Messages - الرسائل

#### Send message
```bash
POST /api/marketplace/messages/
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipient_id": "uuid",
  "product_id": "uuid",
  "subject": "Question about product",
  "message": "Is this item still available? Can you provide more details?"
}
```

#### Get inbox
```bash
GET /api/marketplace/messages/inbox/
Authorization: Bearer <token>
```

#### Get sent messages
```bash
GET /api/marketplace/messages/sent/
Authorization: Bearer <token>
```

#### Mark as read
```bash
POST /api/marketplace/messages/{id}/mark_read/
Authorization: Bearer <token>
```

#### Get unread count
```bash
GET /api/marketplace/messages/unread_count/
Authorization: Bearer <token>

# Response
{
  "unread_count": 3
}
```

### 7. Reports - التقارير

#### Report product
```bash
POST /api/marketplace/reports/
Content-Type: application/json
Authorization: Bearer <token>

{
  "product_id": "uuid",
  "reason": "spam",
  "description": "This listing appears to be spam and contains misleading information."
}
```

#### Get my reports
```bash
GET /api/marketplace/reports/my_reports/
Authorization: Bearer <token>
```

---

## Arabic Examples - أمثلة بالعربية

### 1. إنشاء منتج جديد

```bash
POST /api/marketplace/products/
Authorization: Bearer <token>

{
  "category": "uuid",
  "title": "بلاستيك معاد تدويره",
  "title_ar": "بلاستيك معاد تدويره",
  "description": "Recycled plastic in excellent condition",
  "description_ar": "بلاستيك معاد تدويره في حالة ممتازة",
  "price": 200.00,
  "quantity": 100,
  "unit": "كجم",
  "condition": "good",
  "status": "active",
  "location": "القاهرة، مصر"
}
```

### 2. البحث عن منتجات

```bash
# البحث بالعربية
GET /api/marketplace/products/?search=بلاستيك

# التصفية حسب الفئة والسعر
GET /api/marketplace/products/?category=uuid&min_price=100&max_price=500
```

### 3. إنشاء طلب

```bash
POST /api/marketplace/orders/
Authorization: Bearer <token>

{
  "product_id": "uuid",
  "quantity": 50,
  "notes": "يرجى التوصيل للمستودع",
  "delivery_address": "شارع الهرم، الجيزة، مصر"
}
```

### 4. إرسال رسالة

```bash
POST /api/marketplace/messages/
Authorization: Bearer <token>

{
  "recipient_id": "uuid",
  "product_id": "uuid",
  "subject": "استفسار عن المنتج",
  "message": "هل المنتج متاح؟ هل يمكنك تقديم المزيد من التفاصيل؟"
}
```

---

## Python Examples using requests

```python
import requests

BASE_URL = "http://localhost:8000/api/marketplace"
TOKEN = "your-jwt-token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# List products
response = requests.get(f"{BASE_URL}/products/", headers=headers)
products = response.json()

# Create product
product_data = {
    "category": "uuid",
    "title": "Recycled Materials",
    "description": "High quality recycled materials",
    "price": 150.00,
    "quantity": 100,
    "unit": "kg",
    "condition": "good",
    "status": "active",
    "location": "Cairo, Egypt"
}
response = requests.post(f"{BASE_URL}/products/", json=product_data, headers=headers)
new_product = response.json()

# Toggle favorite
product_id = "uuid"
response = requests.post(f"{BASE_URL}/products/{product_id}/toggle_favorite/", headers=headers)
result = response.json()

# Create order
order_data = {
    "product_id": "uuid",
    "quantity": 50,
    "notes": "Urgent delivery needed"
}
response = requests.post(f"{BASE_URL}/orders/", json=order_data, headers=headers)
order = response.json()

# Send message
message_data = {
    "recipient_id": "uuid",
    "product_id": "uuid",
    "subject": "Question",
    "message": "Is this available?"
}
response = requests.post(f"{BASE_URL}/messages/", json=message_data, headers=headers)
```

---

## JavaScript/Fetch Examples

```javascript
const BASE_URL = 'http://localhost:8000/api/marketplace';
const TOKEN = 'your-jwt-token';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// Get products
fetch(`${BASE_URL}/products/`, { headers })
  .then(res => res.json())
  .then(data => console.log(data));

// Create product
const productData = {
  category: 'uuid',
  title: 'Recycled Materials',
  description: 'High quality',
  price: 150.00,
  quantity: 100,
  unit: 'kg',
  condition: 'good',
  status: 'active',
  location: 'Cairo'
};

fetch(`${BASE_URL}/products/`, {
  method: 'POST',
  headers,
  body: JSON.stringify(productData)
})
  .then(res => res.json())
  .then(data => console.log(data));

// Toggle favorite
fetch(`${BASE_URL}/products/{id}/toggle_favorite/`, {
  method: 'POST',
  headers
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Resource deleted successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Pagination

All list endpoints support pagination:

```bash
GET /api/marketplace/products/?page=2

# Response
{
  "count": 100,
  "next": "http://localhost:8000/api/marketplace/products/?page=3",
  "previous": "http://localhost:8000/api/marketplace/products/?page=1",
  "results": [...]
}
```

---

## Tips - نصائح

### English
- Always include Authorization header for protected endpoints
- Use filters and search to optimize queries
- Handle pagination for large result sets
- Check status codes for error handling
- Use Swagger UI for interactive testing

### العربية
- قم دائمًا بتضمين رأس التفويض للنقاط المحمية
- استخدم الفلاتر والبحث لتحسين الاستعلامات
- تعامل مع ترقيم الصفحات لمجموعات النتائج الكبيرة
- تحقق من رموز الحالة لمعالجة الأخطاء
- استخدم Swagger UI للاختبار التفاعلي
