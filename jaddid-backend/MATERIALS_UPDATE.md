# 🔄 Materials Implementation - Quick Start Guide

## What Changed?

The marketplace now has **TWO separate systems**:

### 1. **Materials** (NEW! 🆕)
Raw materials sold by weight/quantity:
- Wood chips, plastic, metal, old clothes
- Priced per unit (kg, ton, bag, etc.)
- Minimum order quantities
- Bulk trading focus

### 2. **Products** (Existing)
Handmade/manufactured items:
- Individual pieces
- Fixed pricing
- Single item sales

---

## Quick Migration Steps

### 1. Apply Database Migrations

```powershell
# Navigate to project
cd "d:\ARCH\Python Full Stack 2025\Graduation Project\Grad Repo\jaddid-backend"

# Activate virtual environment
.\env\Scripts\Activate.ps1

# Navigate to Django project
cd jaddid

# Apply migrations
python manage.py migrate marketplace
```

### 2. Test the Changes

```powershell
# Check for issues
python manage.py check

# Run development server
python manage.py runserver
```

### 3. Access New Endpoints

- **Materials API**: http://localhost:8000/api/marketplace/materials/
- **Material Listings API**: http://localhost:8000/api/marketplace/material-listings/
- **Swagger Docs**: http://localhost:8000/swagger/

---

## What Works Differently Now?

### Orders
```python
# Material Order
POST /api/marketplace/orders/
{
  "material_listing_id": "uuid",
  "quantity": 50.5,  # Decimal for materials
  "unit": "kg",
  "notes": "Need delivery by next week"
}

# Product Order (unchanged)
POST /api/marketplace/orders/
{
  "product_id": "uuid",
  "quantity": 5,  # Integer for products
  "notes": "Gift wrap please"
}
```

### Favorites
```python
# Favorite a Material
POST /api/marketplace/favorites/
{
  "material_listing_id": "uuid"
}

# Favorite a Product
POST /api/marketplace/favorites/
{
  "product_id": "uuid"
}
```

### Reviews, Messages, Reports
All now accept **either** `product_id` **OR** `material_listing_id`

---

## New Admin Features

1. **Material Master Data**: http://localhost:8000/admin/marketplace/material/
2. **Material Listings**: http://localhost:8000/admin/marketplace/materiallisting/

---

## Documentation

- **Full Implementation Guide**: [MATERIALS_IMPLEMENTATION.md](jaddid/md/MATERIALS_IMPLEMENTATION.md)
- **Updated Marketplace Docs**: [MARKETPLACE_DOCUMENTATION.md](jaddid/md/MARKETPLACE_DOCUMENTATION.md)

---

## Database Schema Changes

### New Tables
- `marketplace_material` - Material master data
- `marketplace_materiallisting` - User material listings
- `marketplace_materialimage` - Material listing images

### Updated Tables
- `marketplace_order` - Added `order_type`, `material_listing_id`, `unit`
- `marketplace_favorite` - Added `material_listing_id`
- `marketplace_review` - Added `material_listing_id`
- `marketplace_message` - Added `material_listing_id`
- `marketplace_report` - Added `material_listing_id`

### New Constraints
- Check constraints ensure data integrity
- Unique constraints for favorites
- Order type consistency validation

---

## Next Steps

1. ✅ **Run migrations** (see step 1 above)
2. ✅ **Test endpoints** using Swagger UI
3. 📝 **Add material master data** via admin panel
4. 📝 **Create test material listings**
5. 🎨 **Update frontend** to support both marketplaces

---

## Need Help?

- Check [MATERIALS_IMPLEMENTATION.md](jaddid/md/MATERIALS_IMPLEMENTATION.md) for detailed API docs
- Check [MARKETPLACE_DOCUMENTATION.md](jaddid/md/MARKETPLACE_DOCUMENTATION.md) for complete reference

---

**Version**: 2.0.0  
**Date**: December 2025  
**Status**: ✅ Ready for Migration
