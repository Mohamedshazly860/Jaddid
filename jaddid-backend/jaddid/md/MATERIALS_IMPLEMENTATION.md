# Materials Implementation Guide
# دليل تنفيذ المواد الخام

---

## English Documentation

### Overview
This document explains the implementation of the **Materials System** which is now **separated from Products**. The system distinguishes between:

- **Materials** = Raw materials sold by weight/quantity (e.g., wood chips, old clothes, plastic by kg)
- **Products** = Manufactured/handmade items (e.g., handmade bags from recycled fabric)

---

### 🎯 Why Separate Materials from Products?

#### The Problem
Previously, both materials and products used the same model, causing confusion in:
- Business logic (pricing, quantities, display)
- User experience (different workflows)
- Data management (different attributes needed)

#### The Solution
Complete separation with dedicated models, APIs, and workflows:

1. **Different Data Models**
   - Materials have: quantity by weight/volume, price per unit, minimum order quantities
   - Products have: single items, fixed prices, stock quantities

2. **Separate APIs**
   - `/api/marketplace/materials/` - Material master data
   - `/api/marketplace/material-listings/` - User listings of materials
   - `/api/marketplace/products/` - Product listings

3. **Unified Order System**
   - Orders support both types with `order_type` field
   - Proper tracking and logic for each type

---

### 📊 New Models

#### 1. Material (Master Data)
Master data for raw material types.

**Fields:**
- `id` (UUID) - Primary key
- `name` / `name_ar` - Material name (bilingual)
- `description` / `description_ar` - Description (bilingual)
- `category` (FK) - Material category
- `default_unit` - Default unit (kg, ton, bag, cubic meter, etc.)
- `icon` - Material icon image
- `is_active` - Active status
- `created_at` / `updated_at` - Timestamps

**Example Materials:**
- Wood chips (نشارة خشب)
- Old clothes (ملابس قديمة)
- Plastic bottles (زجاجات بلاستيك)
- Scrap metal (خردة معدنية)

#### 2. MaterialListing (User Listings)
User advertisements for selling raw materials.

**Fields:**
- `id` (UUID) - Primary key
- `seller` (FK) - User selling the material
- `material` (FK) - Reference to Material master data
- `title` / `title_ar` - Listing title (bilingual)
- `description` / `description_ar` - Description (bilingual)
- `quantity` (Decimal) - Available quantity
- `unit` - Unit of measurement
- `price_per_unit` (Decimal) - Price per unit
- `minimum_order_quantity` (Decimal) - Minimum order amount
- `condition` - Material condition (Excellent, Good, Acceptable, Poor)
- `status` - Listing status (Draft, Active, Sold, Reserved, Deleted)
- `location` / `latitude` / `longitude` - Location info
- `available_from` / `available_until` - Availability dates
- `notes` - Additional notes
- `views_count` / `favorites_count` - Engagement metrics
- `created_at` / `updated_at` / `published_at` - Timestamps

**Computed Property:**
- `total_price` - quantity × price_per_unit

#### 3. MaterialImage
Images for material listings.

**Fields:**
- `id` (UUID) - Primary key
- `material_listing` (FK) - Associated listing
- `image` - Image file
- `is_primary` - Primary image flag
- `order` - Display order
- `created_at` - Timestamp

---

### 🔄 Updated Models

#### Order Model
Now supports both products and materials with polymorphic relationships.

**New Fields:**
- `order_type` - 'product' or 'material'
- `material_listing` (FK) - Reference to material listing (nullable)
- `unit` - Unit of measurement

**Order Number Format:**
- Products: `PRD-20251211123456-ABC12345`
- Materials: `MAT-20251211123456-ABC12345`

**Validation:**
- Ensures order type matches the item (product OR material, not both)
- Auto-sets seller and unit price based on item type

#### Favorite Model
Supports favoriting both products and materials.

**Fields:**
- `product` (FK) - Product reference (nullable)
- `material_listing` (FK) - Material listing reference (nullable)

**Constraints:**
- Exactly one of product or material_listing must be set
- Unique constraint per user-product or user-material_listing

#### Review Model
Reviews for both products and materials.

**Fields:**
- `product` (FK) - Product reference (nullable)
- `material_listing` (FK) - Material listing reference (nullable)

**Validation:**
- Exactly one must be set
- Review linked to order for verification

#### Message Model
Messages about products or materials.

**Fields:**
- `product` (FK) - Product reference (nullable)
- `material_listing` (FK) - Material listing reference (nullable)

#### Report Model
Reports for products or materials.

**Fields:**
- `product` (FK) - Product reference (nullable)
- `material_listing` (FK) - Material listing reference (nullable)

**Validation:**
- Exactly one must be reported

---

### 🔌 API Endpoints

#### Material Master Data APIs

**GET** `/api/marketplace/materials/`
- List all active materials
- Filter by: category, is_active
- Search in: name, name_ar, description
- Order by: name, created_at

**GET** `/api/marketplace/materials/{id}/`
- Get material details

**GET** `/api/marketplace/materials/{id}/listings/`
- Get all active listings for this material

**POST** `/api/marketplace/materials/` (Admin only)
- Create new material type

**PUT/PATCH** `/api/marketplace/materials/{id}/` (Admin only)
- Update material type

**DELETE** `/api/marketplace/materials/{id}/` (Admin only)
- Delete material type

---

#### Material Listing APIs

**GET** `/api/marketplace/material-listings/`
- List all active material listings
- Filter by: material, condition, status, seller, price_per_unit, quantity
- Search in: title, description, location, material name
- Order by: price_per_unit, quantity, created_at, views_count, favorites_count
- Query params:
  - `min_price` / `max_price` - Price range
  - `min_quantity` / `max_quantity` - Quantity range

**GET** `/api/marketplace/material-listings/{id}/`
- Get listing details (increments view count)

**GET** `/api/marketplace/material-listings/my_listings/` 🔒
- Get current user's material listings

**POST** `/api/marketplace/material-listings/` 🔒
- Create new material listing
- Include: material, title, description, quantity, unit, price_per_unit, images

**PUT/PATCH** `/api/marketplace/material-listings/{id}/` 🔒
- Update listing (owner only)

**DELETE** `/api/marketplace/material-listings/{id}/` 🔒
- Delete listing (owner only)

**POST** `/api/marketplace/material-listings/{id}/toggle_favorite/` 🔒
- Add/remove from favorites

**GET** `/api/marketplace/material-listings/{id}/reviews/`
- Get reviews for listing

**POST** `/api/marketplace/material-listings/{id}/publish/` 🔒
- Publish draft listing (owner only)

---

#### Updated Endpoints

**Favorites** - Now support both types
```json
POST /api/marketplace/favorites/
{
  "product_id": "uuid" // OR
  "material_listing_id": "uuid"
}
```

**Orders** - Now support both types
```json
POST /api/marketplace/orders/
{
  "product_id": "uuid", // OR "material_listing_id": "uuid"
  "quantity": 50.5,
  "unit": "kg",
  "notes": "Need delivery by next week",
  "delivery_address": "123 Main St"
}
```

**Reviews** - Now support both types
```json
POST /api/marketplace/reviews/
{
  "product_id": "uuid", // OR "material_listing_id": "uuid"
  "order": "order_uuid",
  "rating": 5,
  "title": "Great quality material",
  "comment": "Very satisfied"
}
```

**Messages** - Now support both types
```json
POST /api/marketplace/messages/
{
  "recipient_id": "uuid",
  "product_id": "uuid", // OR "material_listing_id": "uuid"
  "subject": "Inquiry about quantity",
  "message": "Is 100kg available?"
}
```

**Reports** - Now support both types
```json
POST /api/marketplace/reports/
{
  "product_id": "uuid", // OR "material_listing_id": "uuid"
  "reason": "spam",
  "description": "Fake listing"
}
```

---

### 🎨 Serializers

**New Serializers:**
1. `MaterialSerializer` - Material master data
2. `MaterialImageSerializer` - Material listing images
3. `MaterialListingListSerializer` - List view (lightweight)
4. `MaterialListingDetailSerializer` - Detail view (complete)
5. `MaterialListingCreateUpdateSerializer` - Create/Update

**Updated Serializers:**
- `FavoriteSerializer` - Supports both product_id and material_listing_id
- `OrderSerializer` - Supports both types with order_type field
- `ReviewSerializer` - Supports both types
- `MessageSerializer` - Supports both types
- `ReportSerializer` - Supports both types

---

### 👮 Permissions

- **Public Access**: View materials and listings
- **Authenticated**: Create listings, place orders, add favorites
- **Owner Only**: Edit/delete own listings
- **Admin Only**: Manage material master data

---

### 🔧 Admin Panel

**New Admin Interfaces:**
1. **MaterialAdmin**
   - List display: name, category, default_unit, active listings count
   - Filters: is_active, category, created_at
   - Search: name, description

2. **MaterialListingAdmin**
   - List display: title, material, seller, quantity, price, total price, status
   - Filters: status, condition, material, dates
   - Search: title, description, location, material name, seller email
   - Inline: MaterialImageInline
   - Actions: Make active, Make draft, Make sold

**Updated Admin:**
- All admin panels updated to handle both products and materials

---

### 💾 Database Migrations

After implementing these changes, run:

```powershell
# Activate virtual environment
.\env\Scripts\Activate.ps1

# Create migrations
cd jaddid
python manage.py makemigrations marketplace

# Apply migrations
python manage.py migrate marketplace
```

---

### 🧪 Testing

**Test Material Master Data:**
```python
# Create material via admin panel
Material:
- Name: "Wood Chips"
- Name AR: "نشارة خشب"
- Category: Wood category
- Default Unit: "kg"
- Is Active: True
```

**Test Material Listing:**
```python
# Create listing via API
POST /api/marketplace/material-listings/
{
  "material": "material_uuid",
  "title": "Fresh Wood Chips Available",
  "title_ar": "نشارة خشب طازجة متاحة",
  "description": "High quality pine wood chips",
  "quantity": 500,
  "unit": "kg",
  "price_per_unit": 5.50,
  "minimum_order_quantity": 50,
  "condition": "excellent",
  "location": "Cairo, Egypt",
  "status": "active"
}
```

**Test Order:**
```python
# Order material
POST /api/marketplace/orders/
{
  "material_listing_id": "listing_uuid",
  "quantity": 100,
  "notes": "Deliver to warehouse",
  "delivery_address": "123 Industrial Zone"
}
# Response: Order MAT-20251211-XXXX created
```

---

### 📱 Frontend Integration

#### Two Separate Marketplaces

**Materials Marketplace:**
- Browse materials by type
- Search/filter by quantity, price per unit
- Order by weight/volume
- Minimum order quantities
- Bulk pricing

**Products Marketplace:**
- Browse handmade products
- Search/filter by price, condition
- Order individual items
- Fixed pricing

**Unified Features:**
- Same favorites system
- Same messaging system
- Same review system
- Same order tracking

---

### 🔍 Key Differences

| Feature | Materials | Products |
|---------|-----------|----------|
| Pricing | Per unit (kg, ton, bag) | Fixed price per item |
| Quantity | Decimal (50.5 kg) | Integer (5 pieces) |
| Unit | Variable (kg, ton, m³) | Piece, Item |
| Min Order | Often required | Usually not needed |
| Condition | Excellent to Poor | New to Poor |
| Primary Use | Bulk trading | Individual sales |
| Order Type | `material` | `product` |

---

### 🚀 Future Enhancements

1. **Bulk Pricing Tiers**
   - Different prices for quantity ranges
   - Volume discounts

2. **Material Specifications**
   - Moisture content
   - Purity percentage
   - Grade/quality levels

3. **Delivery Options**
   - Pickup only
   - Delivery available
   - Shipping integration

4. **Material Requests**
   - Buyers post requirements
   - Sellers respond with quotes

5. **Quality Certificates**
   - Upload test results
   - Verification badges

---

## Arabic Documentation - التوثيق العربي

### نظرة عامة
يشرح هذا المستند تنفيذ **نظام المواد الخام** الذي تم **فصله عن المنتجات**. يميز النظام بين:

- **المواد الخام** = مواد تُباع بالوزن/الكمية (مثل نشارة الخشب، ملابس قديمة، بلاستيك بالكيلو)
- **المنتجات** = عناصر مصنعة/يدوية (مثل حقائب يدوية من قماش معاد تدويره)

---

### 🎯 لماذا فصل المواد عن المنتجات؟

#### المشكلة
سابقاً، كانت المواد والمنتجات تستخدم نفس النموذج، مما يسبب لبساً في:
- منطق الأعمال (التسعير، الكميات، العرض)
- تجربة المستخدم (سير عمل مختلف)
- إدارة البيانات (حاجة لسمات مختلفة)

#### الحل
فصل كامل بنماذج وواجهات برمجية وتدفقات عمل مخصصة:

1. **نماذج بيانات مختلفة**
   - المواد لها: كمية بالوزن/الحجم، سعر للوحدة، كميات طلب دنيا
   - المنتجات لها: عناصر فردية، أسعار ثابتة، كميات مخزون

2. **واجهات برمجية منفصلة**
   - `/api/marketplace/materials/` - البيانات الرئيسية للمواد
   - `/api/marketplace/material-listings/` - إعلانات المستخدمين للمواد
   - `/api/marketplace/products/` - قوائم المنتجات

3. **نظام طلبات موحد**
   - الطلبات تدعم كلا النوعين بحقل `order_type`
   - تتبع ومنطق مناسب لكل نوع

---

### 📊 النماذج الجديدة

#### 1. Material (البيانات الرئيسية)
بيانات رئيسية لأنواع المواد الخام.

**الحقول:**
- `id` (UUID) - المفتاح الأساسي
- `name` / `name_ar` - اسم المادة (ثنائي اللغة)
- `description` / `description_ar` - الوصف (ثنائي اللغة)
- `category` (FK) - فئة المادة
- `default_unit` - الوحدة الافتراضية (كجم، طن، كيس، متر مكعب، إلخ)
- `icon` - أيقونة المادة
- `is_active` - حالة النشاط
- `created_at` / `updated_at` - طوابع زمنية

**أمثلة المواد:**
- نشارة خشب (Wood chips)
- ملابس قديمة (Old clothes)
- زجاجات بلاستيك (Plastic bottles)
- خردة معدنية (Scrap metal)

#### 2. MaterialListing (إعلانات المستخدمين)
إعلانات المستخدمين لبيع المواد الخام.

**الحقول:**
- `id` (UUID) - المفتاح الأساسي
- `seller` (FK) - المستخدم البائع للمادة
- `material` (FK) - مرجع للبيانات الرئيسية للمادة
- `title` / `title_ar` - عنوان الإعلان (ثنائي اللغة)
- `description` / `description_ar` - الوصف (ثنائي اللغة)
- `quantity` (عشري) - الكمية المتاحة
- `unit` - وحدة القياس
- `price_per_unit` (عشري) - السعر لكل وحدة
- `minimum_order_quantity` (عشري) - الحد الأدنى لكمية الطلب
- `condition` - حالة المادة (ممتاز، جيد، مقبول، ضعيف)
- `status` - حالة الإعلان (مسودة، نشط، مباع، محجوز، محذوف)
- `location` / `latitude` / `longitude` - معلومات الموقع
- `available_from` / `available_until` - تواريخ التوفر
- `notes` - ملاحظات إضافية
- `views_count` / `favorites_count` - مقاييس التفاعل
- `created_at` / `updated_at` / `published_at` - طوابع زمنية

**خاصية محسوبة:**
- `total_price` - الكمية × السعر لكل وحدة

---

### 🔌 نقاط نهاية API

#### واجهات البيانات الرئيسية للمواد

**GET** `/api/marketplace/materials/`
- عرض جميع المواد النشطة
- تصفية حسب: الفئة، is_active
- بحث في: name، name_ar، description
- ترتيب حسب: name، created_at

**GET** `/api/marketplace/materials/{id}/`
- الحصول على تفاصيل المادة

**GET** `/api/marketplace/materials/{id}/listings/`
- الحصول على جميع الإعلانات النشطة لهذه المادة

**POST** `/api/marketplace/materials/` (المسؤول فقط)
- إنشاء نوع مادة جديد

---

#### واجهات إعلانات المواد

**GET** `/api/marketplace/material-listings/`
- عرض جميع إعلانات المواد النشطة
- تصفية حسب: المادة، الحالة، الحالة، البائع، السعر، الكمية
- بحث في: العنوان، الوصف، الموقع، اسم المادة
- ترتيب حسب: price_per_unit، quantity، created_at، views_count
- معاملات الاستعلام:
  - `min_price` / `max_price` - نطاق السعر
  - `min_quantity` / `max_quantity` - نطاق الكمية

**GET** `/api/marketplace/material-listings/{id}/`
- الحصول على تفاصيل الإعلان (يزيد عدد المشاهدات)

**GET** `/api/marketplace/material-listings/my_listings/` 🔒
- الحصول على إعلانات المواد الخاصة بالمستخدم الحالي

**POST** `/api/marketplace/material-listings/` 🔒
- إنشاء إعلان مادة جديد
- يتضمن: material، title، description، quantity، unit، price_per_unit، images

**POST** `/api/marketplace/material-listings/{id}/toggle_favorite/` 🔒
- إضافة/إزالة من المفضلة

**POST** `/api/marketplace/material-listings/{id}/publish/` 🔒
- نشر إعلان مسودة (المالك فقط)

---

### 🔍 الاختلافات الرئيسية

| الميزة | المواد | المنتجات |
|--------|--------|----------|
| التسعير | لكل وحدة (كجم، طن، كيس) | سعر ثابت لكل عنصر |
| الكمية | عشري (50.5 كجم) | عدد صحيح (5 قطع) |
| الوحدة | متغير (كجم، طن، م³) | قطعة، عنصر |
| الحد الأدنى للطلب | غالباً مطلوب | عادة غير مطلوب |
| الحالة | ممتاز إلى ضعيف | جديد إلى ضعيف |
| الاستخدام الأساسي | تجارة بالجملة | مبيعات فردية |
| نوع الطلب | `material` | `product` |

---

### 💾 ترحيلات قاعدة البيانات

بعد تنفيذ هذه التغييرات، قم بتشغيل:

```powershell
# تفعيل البيئة الافتراضية
.\env\Scripts\Activate.ps1

# إنشاء الترحيلات
cd jaddid
python manage.py makemigrations marketplace

# تطبيق الترحيلات
python manage.py migrate marketplace
```

---

### 🚀 التحسينات المستقبلية

1. **مستويات التسعير بالجملة**
   - أسعار مختلفة لنطاقات الكمية
   - خصومات الحجم

2. **مواصفات المواد**
   - محتوى الرطوبة
   - نسبة النقاء
   - مستويات الدرجة/الجودة

3. **خيارات التوصيل**
   - الاستلام فقط
   - التوصيل متاح
   - تكامل الشحن

4. **طلبات المواد**
   - المشترون ينشرون المتطلبات
   - البائعون يستجيبون بعروض أسعار

5. **شهادات الجودة**
   - تحميل نتائج الاختبار
   - شارات التحقق

---

## Summary - الملخص

### English
The Materials system is now **completely separated from Products**:
- ✅ 3 new models (Material, MaterialListing, MaterialImage)
- ✅ 5 new serializers with full validation
- ✅ 2 new viewsets with comprehensive endpoints
- ✅ Updated 5 models to support both types (Order, Favorite, Review, Message, Report)
- ✅ Database constraints for data integrity
- ✅ Admin interfaces for both materials and products
- ✅ Bilingual support throughout
- ✅ Complete API documentation

### العربية
نظام المواد الآن **منفصل تماماً عن المنتجات**:
- ✅ 3 نماذج جديدة (Material، MaterialListing، MaterialImage)
- ✅ 5 مسلسلات جديدة مع التحقق الكامل
- ✅ 2 مجموعات عرض جديدة مع نقاط نهاية شاملة
- ✅ تحديث 5 نماذج لدعم كلا النوعين (Order، Favorite، Review، Message، Report)
- ✅ قيود قاعدة البيانات لسلامة البيانات
- ✅ واجهات إدارة للمواد والمنتجات
- ✅ دعم ثنائي اللغة في كل مكان
- ✅ توثيق API كامل

---

**Project**: Jaddid Recyclable Materials Marketplace  
**Version**: 2.0.0  
**Date**: December 2025  
**Team**: Jaddid Development Team
