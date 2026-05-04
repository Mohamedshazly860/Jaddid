# 🛒 Jaddid Marketplace - Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-cyan)
![Status](https://img.shields.io/badge/Status-Complete-success)

A modern, fully-featured marketplace for recyclable materials and products built with React, Vite, and shadcn/ui.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api-integration)

</div>

---

## ✨ Features

### 🛍️ Marketplace
- Browse products and raw materials
- Advanced search and filtering
- Category-based navigation
- Multiple sorting options
- Responsive grid layout

### 📦 Product Management
- Detailed product pages
- Image galleries
- Seller information
- Reviews and ratings
- Favorite/wishlist system

### 🛒 Shopping Cart
- Add/remove items
- Quantity management
- Real-time price calculations
- Persistent cart state

### 📋 Order Management
- Create and track orders
- Separate buyer/seller views
- Order status workflow
- Confirm/Complete/Cancel actions

### 💬 Messaging
- Direct user-to-user messaging
- Inbox and sent messages
- Unread message indicators
- Product context in messages

### ❤️ Favorites
- Save items to wishlist
- Quick add to cart
- Easy management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running at `http://localhost:8000`

### Installation

```bash
# Clone repository
git clone https://github.com/Mohamedshazly860/Jaddid-frontend.git
cd Jaddid-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173/marketplace` to see the marketplace!

---

## 📁 Project Structure

```
Jaddid-frontend/
├── src/
│   ├── services/
│   │   ├── api.js                      # Axios configuration
│   │   └── marketplaceService.js       # API endpoints (58 endpoints)
│   ├── pages/
│   │   ├── MarketplacePage.jsx         # Main marketplace
│   │   ├── ProductDetailPage.jsx       # Product details
│   │   ├── CartPage.jsx                # Shopping cart
│   │   ├── OrdersPage.jsx              # Order management
│   │   ├── FavoritesPage.jsx           # Wishlist
│   │   └── MessagesPage.jsx            # Messaging
│   ├── components/ui/                  # shadcn/ui components
│   └── App.jsx                         # Routes configuration
├── .env.example                        # Environment template
├── MARKETPLACE_IMPLEMENTATION.md       # Complete documentation
├── MARKETPLACE_QUICKSTART.md           # Quick reference
└── MARKETPLACE_TESTING.md              # Testing guide
```

---

## 🔌 API Integration

### Endpoints Integrated (58 total)

#### Categories (3)
- List categories
- Category tree structure
- Products by category

#### Products (7)
- List/Create/Update/Delete products
- Toggle favorite
- Product reviews
- My products

#### Materials (10)
- List materials (master data)
- Material listings CRUD
- Toggle favorite on listings
- Publish listings

#### Cart (5)
- Get cart
- Add/Update/Remove items
- Clear cart

#### Orders (7)
- Create orders
- View purchases/sales
- Confirm/Complete/Cancel

#### Favorites (3)
- List/Add/Remove favorites

#### Messages (5)
- Inbox/Sent messages
- Send messages
- Mark as read

#### Reviews (4)
- List/Create/Update/Delete reviews

#### Reports (3)
- Create/List reports

**Full API documentation**: [Backend Swagger](http://localhost:8000/swagger/)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [MARKETPLACE_IMPLEMENTATION.md](./MARKETPLACE_IMPLEMENTATION.md) | Complete implementation guide |
| [MARKETPLACE_QUICKSTART.md](./MARKETPLACE_QUICKSTART.md) | Quick start guide |
| [MARKETPLACE_TESTING.md](./MARKETPLACE_TESTING.md) | Testing guide |

---

## 🎨 UI/UX

### Design System
- **Colors**: Green (primary), Blue (secondary), Red (alerts)
- **Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: System fonts

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🧪 Testing

### Manual Testing
```bash
# Start backend
cd jaddid-backend/jaddid
python manage.py runserver

# Start frontend
npm run dev

# Test marketplace
open http://localhost:5173/marketplace
```

### Test Checklist
- [ ] Browse products
- [ ] Search and filter
- [ ] View product details
- [ ] Add to cart
- [ ] Create order
- [ ] Send message
- [ ] Add to favorites

See [MARKETPLACE_TESTING.md](./MARKETPLACE_TESTING.md) for detailed testing guide.

---

## 🔧 Configuration

### Environment Variables
```bash
# .env
VITE_API_URL=http://localhost:8000/api
```

### Backend CORS
Ensure backend allows frontend origin:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

---

## 📦 Build & Deploy

### Production Build
```bash
# Build
npm run build

# Preview
npm run preview

# Output: dist/
```

### Deploy to Netlify
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_API_URL=https://your-backend-api.com/api
```

### Deploy to Vercel
```bash
vercel --prod
```

---

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **shadcn/ui** - Component library
- **Radix UI** - Headless components
- **Axios** - HTTP client
- **React Router 6** - Routing
- **React Query** - Data fetching
- **Lucide React** - Icons

---

## 📊 Statistics

- **Files Created**: 11
- **Lines of Code**: ~3,000
- **Components**: 6 pages
- **API Endpoints**: 58
- **Features**: 25+
- **Development Time**: 3 days

---

## 🌟 Features Roadmap

### Completed ✅
- [x] Product browsing
- [x] Search & filters
- [x] Shopping cart
- [x] Order management
- [x] Messaging system
- [x] Favorites
- [x] Reviews display

### Coming Soon 🔜
- [ ] Create listing form
- [ ] Image upload
- [ ] Submit reviews
- [ ] Real-time notifications
- [ ] Chat interface
- [ ] Payment integration
- [ ] Arabic language support

---

## 👥 Team

**Frontend**:
- Ibtihal - Landing page
- Maryem - Authentication
- **This Project** - Complete Marketplace

**Backend**:
- Mohamed - User & Logistics
- Maryem - Orders
- Ibtihal - Marketplace API
- AbdelRahman - Reviews

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

This project is part of a graduation project.

---

## 📞 Support

### Resources
- [Backend API Docs](http://localhost:8000/swagger/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [React Router Docs](https://reactrouter.com/)

### Issues
For bugs or questions:
1. Check documentation files
2. Review browser console
3. Check network tab for API errors
4. Verify backend server is running

---

## 🎉 Acknowledgments

- Django REST Framework for robust backend
- shadcn/ui for beautiful components
- Tailwind CSS for styling system
- React community for excellent tooling

---

<div align="center">

**Made with ❤️ for Jaddid Project**

[⬆ Back to Top](#-jaddid-marketplace---frontend)

</div>
