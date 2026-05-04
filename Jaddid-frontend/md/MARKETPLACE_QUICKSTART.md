# Marketplace Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```bash
VITE_API_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Start Backend Server
Make sure your Django backend is running:
```bash
cd jaddid-backend/jaddid
python manage.py runserver
```

---

## 📍 Available Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Homepage with features |
| `/login` | Login | User authentication |
| `/register` | Register | New user signup |
| `/marketplace` | Marketplace | Browse products & materials |
| `/marketplace/product/:id` | Product Detail | View product details |
| `/marketplace/material/:id` | Material Detail | View material details |
| `/marketplace/cart` | Cart | Shopping cart |
| `/marketplace/orders` | Orders | Purchase & sales history |
| `/marketplace/favorites` | Favorites | Wishlist |
| `/marketplace/messages` | Messages | User messaging |

---

## 🎯 Key Features

### ✅ Implemented
- Browse products and materials
- Search and filter
- Product details with reviews
- Shopping cart management
- Order processing (buyer & seller flows)
- Favorites/Wishlist
- User messaging
- Responsive design

### 🔄 Ready to Extend
- Create new listings
- Image upload
- Review submission
- Advanced filtering
- Real-time notifications

---

## 🧪 Testing the Marketplace

### 1. Browse Marketplace
- Visit `http://localhost:5173/marketplace`
- Search for items
- Filter by category
- Try different sorting options

### 2. View Product Details
- Click on any product card
- Navigate image gallery
- Read reviews
- Add to favorites
- Add to cart

### 3. Cart Operations
- View cart at `/marketplace/cart`
- Adjust quantities
- Remove items
- Proceed to checkout

### 4. Manage Orders
- Visit `/marketplace/orders`
- View purchases (as buyer)
- View sales (as seller)
- Confirm/Complete/Cancel orders

### 5. Favorites
- Add items to favorites (heart icon)
- Visit `/marketplace/favorites`
- Quick add to cart from favorites

### 6. Messages
- Go to `/marketplace/messages`
- Send a new message
- View inbox and sent messages
- Mark messages as read

---

## 🔧 API Endpoints Used

### Products
- `GET /api/marketplace/products/` - List products
- `GET /api/marketplace/products/{id}/` - Product details
- `POST /api/marketplace/products/{id}/toggle_favorite/` - Toggle favorite

### Materials
- `GET /api/marketplace/material-listings/` - List materials
- `GET /api/marketplace/material-listings/{id}/` - Material details

### Cart
- `GET /api/marketplace/cart/` - Get cart
- `POST /api/marketplace/cart/add_item/` - Add to cart
- `POST /api/marketplace/cart/update_item/` - Update quantity
- `POST /api/marketplace/cart/remove_item/` - Remove item
- `POST /api/marketplace/cart/clear/` - Clear cart

### Orders
- `GET /api/marketplace/orders/purchases/` - My purchases
- `GET /api/marketplace/orders/sales/` - My sales
- `POST /api/marketplace/orders/` - Create order
- `POST /api/marketplace/orders/{id}/confirm/` - Confirm order
- `POST /api/marketplace/orders/{id}/complete/` - Complete order
- `POST /api/marketplace/orders/{id}/cancel/` - Cancel order

### Favorites
- `GET /api/marketplace/favorites/` - List favorites
- `DELETE /api/marketplace/favorites/{id}/` - Remove favorite

### Messages
- `GET /api/marketplace/messages/inbox/` - Inbox
- `GET /api/marketplace/messages/sent/` - Sent messages
- `POST /api/marketplace/messages/` - Send message
- `POST /api/marketplace/messages/{id}/mark_read/` - Mark as read

---

## 🎨 UI Components

All UI components are from **shadcn/ui**:
- `Button` - Various actions
- `Card` - Content containers
- `Badge` - Status indicators
- `Dialog` - Modals
- `Input` - Form inputs
- `Select` - Dropdowns
- `Tabs` - Tab navigation
- `Separator` - Dividers
- `Avatar` - User avatars
- `Toast` - Notifications

---

## 🐛 Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:8000/api/marketplace/products/

# If not, start backend
cd jaddid-backend/jaddid
python manage.py runserver
```

### CORS Issues
Make sure backend has CORS configured:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Authentication Issues
1. Check if token is stored: `localStorage.getItem('token')`
2. Login again at `/login`
3. Check backend user authentication

### 404 Errors
- Verify backend server is running
- Check API base URL in `.env`
- Verify endpoint paths match backend

---

## 📱 Mobile Testing

Test responsive design:
```bash
# Chrome DevTools
F12 → Toggle device toolbar

# Test on
- iPhone SE (375px)
- iPad (768px)
- Desktop (1920px)
```

---

## 🔐 Authentication Flow

1. User logs in at `/login`
2. Token stored in `localStorage`
3. Axios interceptor adds token to all requests
4. Protected routes redirect to login if no token

---

## 📦 Build for Production

```bash
# Build
npm run build

# Preview
npm run preview

# Output in 'dist' folder
```

---

## 🌟 Next Steps

1. **Test all features** using the testing guide
2. **Add your own products** (implement create form)
3. **Customize styling** in component files
4. **Add Arabic translations** using LanguageContext
5. **Deploy to production** (Netlify, Vercel)

---

## 📚 Additional Resources

- [Backend API Docs](http://localhost:8000/swagger/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [React Router Docs](https://reactrouter.com/)

---

**Happy coding! 🚀**
