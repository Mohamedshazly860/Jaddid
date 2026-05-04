# Jaddid Backend - Recyclable Materials Marketplace API

![Django](https://img.shields.io/badge/Django-4.2.7-green)
![DRF](https://img.shields.io/badge/DRF-3.14.0-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)

## 📋 Overview

Jaddid is a comprehensive Django REST Framework API for a recyclable materials marketplace. It enables users to buy and sell recyclable materials with features like product listings, orders, reviews, messaging, and reporting.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- pip
- Virtual environment

### Installation

```powershell
# 1. Clone the repository
git clone https://github.com/Mohamedshazly860/jaddid-backend.git
cd jaddid-backend

# 2. Activate virtual environment
.\env\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# 5. Create PostgreSQL database
# Use pgAdmin or:
# psql -U postgres -c "CREATE DATABASE jaddid_db;"

# 6. Navigate to Django project
cd jaddid

# 7. Run migrations
python manage.py makemigrations
python manage.py migrate

# 8. Create superuser
python manage.py createsuperuser

# 9. Run development server
python manage.py runserver
```

## 📁 Project Structure

```
jaddid-backend/
├── jaddid/
│   ├── accounts/              # User management
│   ├── marketplace/           # Marketplace app (NEW)
│   │   ├── models.py         # 8 models
│   │   ├── serializers.py    # 10 serializers
│   │   ├── views.py          # 7 viewsets
│   │   ├── admin.py          # Admin configuration
│   │   ├── urls.py           # API routes
│   │   └── permissions.py    # Custom permissions
│   └── jaddid/               # Project settings
├── env/                      # Virtual environment
├── .env                      # Environment variables
├── requirements.txt          # Dependencies
└── README.md                 # This file
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=jaddid_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📚 API Documentation

Once the server is running, access:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/
- **Admin Panel**: http://localhost:8000/admin/

## 🎯 Features

### Marketplace App
- ✅ Product listings with images
- ✅ Categories (hierarchical)
- ✅ Orders & order tracking
- ✅ Reviews & ratings
- ✅ Favorites/Wishlist
- ✅ Messaging system
- ✅ Reporting system
- ✅ Bilingual support (EN/AR)

### Models (8)
1. **Category** - Product categories
2. **Product** - Product listings
3. **ProductImage** - Product images
4. **Favorite** - User wishlist
5. **Order** - Purchase orders
6. **Review** - Product reviews
7. **Message** - User messaging
8. **Report** - Content reports

## 🔐 API Endpoints

### Categories
- `GET /api/marketplace/categories/` - List categories
- `GET /api/marketplace/categories/{id}/` - Category details
- `GET /api/marketplace/categories/tree/` - Category tree

### Products
- `GET /api/marketplace/products/` - List products
- `GET /api/marketplace/products/{id}/` - Product details
- `POST /api/marketplace/products/` - Create product
- `PUT /api/marketplace/products/{id}/` - Update product
- `DELETE /api/marketplace/products/{id}/` - Delete product
- `POST /api/marketplace/products/{id}/toggle_favorite/` - Toggle favorite
- `POST /api/marketplace/products/{id}/publish/` - Publish product

### Orders
- `GET /api/marketplace/orders/` - List orders
- `GET /api/marketplace/orders/purchases/` - User purchases
- `GET /api/marketplace/orders/sales/` - User sales
- `POST /api/marketplace/orders/` - Create order
- `POST /api/marketplace/orders/{id}/confirm/` - Confirm order
- `POST /api/marketplace/orders/{id}/complete/` - Complete order
- `POST /api/marketplace/orders/{id}/cancel/` - Cancel order

### Reviews
- `GET /api/marketplace/reviews/` - List reviews
- `POST /api/marketplace/reviews/` - Create review

### Messages
- `GET /api/marketplace/messages/inbox/` - Inbox
- `GET /api/marketplace/messages/sent/` - Sent messages
- `POST /api/marketplace/messages/` - Send message
- `POST /api/marketplace/messages/{id}/mark_read/` - Mark as read

### Favorites
- `GET /api/marketplace/favorites/` - List favorites
- `POST /api/marketplace/favorites/` - Add favorite
- `DELETE /api/marketplace/favorites/{id}/` - Remove favorite

### Reports
- `GET /api/marketplace/reports/` - List reports
- `POST /api/marketplace/reports/` - Create report

## 🔒 Permissions

- **IsAuthenticatedOrReadOnly** - Public read, auth write
- **IsSellerOrReadOnly** - Only seller can edit product
- **IsOwnerOrReadOnly** - Only owner can edit resource
- **IsAdminOrReadOnly** - Only admin can edit

## 🗄️ Database Schema

### Key Features
- UUID primary keys for security
- Bilingual fields (EN/AR)
- Optimized indexes
- Foreign key relationships
- Automatic timestamps

## 👥 Team Collaboration

### Git Workflow
```bash
# Pull latest
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Description"

# Push to GitHub
git push origin feature/your-feature
```

### Database Setup
Each team member should:
1. Create local `jaddid_db` database
2. Configure `.env` with local credentials
3. Run migrations independently
4. Never commit `.env` file

## 📖 Full Documentation

For complete documentation in English and Arabic, see:
- **[MARKETPLACE_DOCUMENTATION.md](MARKETPLACE_DOCUMENTATION.md)** - Complete documentation
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database setup guide

## 🧪 Testing

```bash
# Run checks
python manage.py check

# Test database
python manage.py check --database default

# Run tests
python manage.py test marketplace
```

## 📦 Dependencies

Main packages:
- Django 4.2.7
- djangorestframework 3.14.0
- djangorestframework-simplejwt 5.3.0
- psycopg2-binary 2.9.11
- django-cors-headers 4.3.0
- django-filter 23.3
- drf-yasg 1.21.7
- Pillow 11.0.0

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

This project is part of a graduation project for [Your University].

## 👨‍💻 Team

- **Project Lead**: Mohamed Shazly (@Mohamedshazly860)
- **Backend Developer**: [Your Name]
- **Database**: PostgreSQL
- **Framework**: Django REST Framework

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Contact the team lead
- Check documentation files

## 🎉 Acknowledgments

- Django community
- DRF contributors
- Team members
- Project supervisors

---

**Status**: ✅ Ready for team integration
**Version**: 1.0.0
**Last Updated**: December 2025
