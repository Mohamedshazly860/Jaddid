# شرح مفصل للكود - Detailed Code Explanation
# توثيق تقني كامل لتطبيق Marketplace

**آخر تحديث: ديسمبر 11, 2025**

---

## 📋 فهرس المحتويات - Table of Contents

1. [نظرة عامة - Overview](#overview)
2. [Models - النماذج](#models)
3. [لماذا نحتاج ProductImage و MaterialImage؟](#why-images)
4. [Serializers - المسلسلات](#serializers)
5. [Views - طبقة العرض](#views)
6. [Admin - لوحة الإدارة](#admin)
7. [Permissions - الصلاحيات](#permissions)
8. [URLs - المسارات](#urls)
9. [Settings Configuration - إعدادات المشروع](#settings)

---

## 📊 نظرة عامة - Overview {#overview}

### نظام مزدوج للتعامل مع المواد القابلة لإعادة التدوير

التطبيق يدعم نوعين من العناصر:

#### 1️⃣ **Materials System** (نظام المواد الخام)
- **Master Data**: قائمة موحدة للمواد (خشب، بلاستيك، ورق، معادن)
- **Material Listings**: إعلانات البائعين للمواد الخام
- **MaterialImage**: صور متعددة لكل إعلان مادة
- **Use Case**: شراء كميات كبيرة من المواد الخام لإعادة التدوير

#### 2️⃣ **Products System** (نظام المنتجات)
- **Direct Listings**: منتجات فردية للبيع المباشر
- **ProductImage**: صور متعددة لكل منتج
- **Use Case**: بيع منتجات معاد تدويرها أو منتجات مستعملة

### الفرق بين Material و Product

| Feature | Material | Product |
|---------|----------|---------|
| **البيانات الأساسية** | من Master Data (Material model) | بيانات حرة (عنوان مباشر) |
| **التسعير** | سعر لكل وحدة (price_per_unit) | سعر إجمالي (price) |
| **الكمية** | DecimalField (دقيق: 2.5 kg) | PositiveIntegerField (عدد صحيح) |
| **الحد الأدنى** | minimum_order_quantity | لا يوجد |
| **الاستخدام** | تجاري، كميات كبيرة | فردي، منتجات محددة |
| **الصور** | MaterialImage model | ProductImage model |

---

## 1. Models - النماذج {#models}

### 📁 الملف: `marketplace/models.py`

النماذج هي أساس قاعدة البيانات. كل نموذج = جدول في قاعدة البيانات.

---

### 🔸 Model 1: Category (الفئات)

**الهدف:** تصنيف كل من Materials و Products

```python
class Category(models.Model):
    """Product Category Model for organizing recyclable materials"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("Category Name"), max_length=100, unique=True)
    name_ar = models.CharField(_("Arabic Name"), max_length=100, blank=True)
    description = models.TextField(_("Description"), blank=True)
    icon = models.ImageField(
        _("Category Icon"), 
        upload_to="categories/%Y/%m/", 
        null=True, 
        blank=True
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='subcategories',
        null=True,
        blank=True,
        verbose_name=_("Parent Category")
    )
    is_active = models.BooleanField(_("Active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### **شرح الحقول:**

| الحقل | النوع | الشرح |
|------|------|-------|
| `id` | UUIDField | معرّف فريد بصيغة UUID بدلاً من الأرقام التسلسلية للأمان |
| `name` | CharField | اسم الفئة بالإنجليزي (إلزامي، فريد) |
| `name_ar` | CharField | اسم الفئة بالعربي (اختياري) |
| `description` | TextField | وصف الفئة (اختياري) |
| `icon` | ImageField | أيقونة/صورة الفئة، يتم حفظها في `media/categories/2025/12/` |
| `parent` | ForeignKey | علاقة ذاتية للفئات الفرعية (Category → Subcategory) |
| `is_active` | BooleanField | هل الفئة نشطة أم لا (افتراضي: نشطة) |
| `created_at` | DateTimeField | تاريخ الإنشاء (تلقائي) |
| `updated_at` | DateTimeField | تاريخ آخر تحديث (تلقائي) |

#### **لماذا استخدمنا UUID؟**
- ✅ أمان أعلى من الأرقام التسلسلية
- ✅ لا يمكن تخمين الـ IDs
- ✅ مناسب للتطبيقات الموزعة
- ✅ يمنع هجمات Enumeration

#### **العلاقة الذاتية (Self-Referential):**
```python
parent = models.ForeignKey('self', ...)
```
- تسمح بإنشاء **هيكل شجري** للفئات
- مثال: "Plastics" → "PET Bottles", "HDPE Containers", "Plastic Bags"
- `related_name='subcategories'`: للوصول للفئات الفرعية

**مثال استخدام:**
```python
plastic_category = Category.objects.get(name="Plastics")
subcategories = plastic_category.subcategories.all()  # جميع أنواع البلاستيك
```

#### **Meta Class:**
```python
class Meta:
    verbose_name = _("Category")
    verbose_name_plural = _("Categories")
    ordering = ['name']
    indexes = [
        models.Index(fields=['name']),
        models.Index(fields=['is_active']),
    ]
```
- `ordering`: ترتيب النتائج حسب الاسم
- `indexes`: فهارس للبحث السريع (Index على name و is_active)

---

### 🔸 Model 2: Material (المواد الخام - Master Data)

**الهدف:** قاعدة بيانات موحدة للمواد القابلة لإعادة التدوير

```python
class Material(models.Model):
    """Master Data for Raw Materials (e.g., wood chips, old clothes, plastic)"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("Material Name"), max_length=100, unique=True)
    name_ar = models.CharField(_("Arabic Name"), max_length=100, blank=True)
    description = models.TextField(_("Description"), blank=True)
    description_ar = models.TextField(_("Arabic Description"), blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='materials',
        verbose_name=_("Category")
    )
    default_unit = models.CharField(
        _("Default Unit"),
        max_length=50,
        default='kg',
        help_text=_("Common unit: kg, ton, bag, item, cubic meter, etc.")
    )
    icon = models.ImageField(
        _("Material Icon"), 
        upload_to="materials/%Y/%m/", 
        null=True, 
        blank=True
    )
    is_active = models.BooleanField(_("Active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### **شرح الحقول:**

| الحقل | النوع | الشرح |
|------|------|-------|
| `name` | CharField | اسم المادة (فريد) - مثال: "Plastic PET", "Wood Chips" |
| `name_ar` | CharField | الاسم بالعربي (اختياري) |
| `description` | TextField | وصف المادة واستخداماتها |
| `description_ar` | TextField | الوصف بالعربي |
| `category` | ForeignKey | التصنيف (بلاستيك، معادن، ورق، إلخ) |
| `default_unit` | CharField | الوحدة الافتراضية (kg, ton, bag) |
| `icon` | ImageField | أيقونة المادة |

#### **لماذا PROTECT في on_delete؟**

```python
on_delete=models.PROTECT
```

- **PROTECT**: يمنع حذف Category لو فيها Materials مرتبطة
- يحمي سلامة البيانات (Data Integrity)
- بدلاً من CASCADE اللي يحذف كل حاجة تلقائياً

#### **Master Data Pattern:**

**المميزات:**
- ✅ توحيد المصطلحات (consistency)
- ✅ سهولة البحث والفلترة
- ✅ إحصائيات دقيقة لكل مادة
- ✅ منع التكرار والأخطاء الإملائية

**مثال:**
```
Material: "Plastic PET Bottles"
  └─ MaterialListing 1: "500 kg PET bottles @ $2/kg"
  └─ MaterialListing 2: "1 ton clear PET @ $1.8/kg"
  └─ MaterialListing 3: "200 kg colored PET @ $1.5/kg"
```

**الفرق بين Material و MaterialListing:**

| جانب | Material | MaterialListing |
|------|----------|-----------------|
| **العدد** | محدود (Master Data) | غير محدود (User Generated) |
| **من ينشئ؟** | Admin فقط | أي بائع مسجل |
| **البيانات** | عامة (اسم، وصف، فئة) | تفصيلية (سعر، كمية، موقع، صور) |
| **مثال** | "Plastic PET" | "500kg PET @ $2/kg in Cairo" |

---

### 🔸 Model 3: MaterialListing (إعلانات المواد)

**الهدف:** إعلان البائع لبيع مادة خام

```python
class MaterialListing(models.Model):
    """User's Material Listing/Advertisement for selling raw materials"""
    
    # Listing Status Choices
    DRAFT = 'draft'
    ACTIVE = 'active'
    SOLD = 'sold'
    RESERVED = 'reserved'
    DELETED = 'deleted'
    
    STATUS_CHOICES = [
        (DRAFT, _('Draft')),
        (ACTIVE, _('Active')),
        (SOLD, _('Sold')),
        (RESERVED, _('Reserved')),
        (DELETED, _('Deleted')),
    ]
    
    # Material Condition Choices
    EXCELLENT = 'excellent'
    GOOD = 'good'
    ACCEPTABLE = 'acceptable'
    POOR = 'poor'
    
    CONDITION_CHOICES = [
        (EXCELLENT, _('Excellent')),
        (GOOD, _('Good')),
        (ACCEPTABLE, _('Acceptable')),
        (POOR, _('Poor')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='material_listings',
        verbose_name=_("Seller")
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name='listings',
        verbose_name=_("Material")
    )
    
    # Listing Information
    title = models.CharField(_("Listing Title"), max_length=200)
    title_ar = models.CharField(_("Arabic Title"), max_length=200, blank=True)
    description = models.TextField(_("Description"))
    description_ar = models.TextField(_("Arabic Description"), blank=True)
    
    # Quantity & Pricing
    quantity = models.DecimalField(
        _("Quantity"),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    unit = models.CharField(
        _("Unit"),
        max_length=50,
        help_text=_("Unit of measurement (kg, ton, bag, item, cubic meter, etc.)")
    )
    price_per_unit = models.DecimalField(
        _("Price per Unit"),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    minimum_order_quantity = models.DecimalField(
        _("Minimum Order Quantity"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Minimum quantity required for purchase")
    )
    
    # Material Details
    condition = models.CharField(
        _("Condition"),
        max_length=20,
        choices=CONDITION_CHOICES,
        default=GOOD
    )
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT
    )
    
    # Location
    location = models.CharField(_("Location"), max_length=255)
    latitude = models.DecimalField(
        _("Latitude"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        _("Longitude"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    # Additional Information
    available_from = models.DateField(_("Available From"), null=True, blank=True)
    available_until = models.DateField(_("Available Until"), null=True, blank=True)
    notes = models.TextField(_("Additional Notes"), blank=True)
    
    # Engagement Metrics
    views_count = models.PositiveIntegerField(_("Views Count"), default=0)
    favorites_count = models.PositiveIntegerField(_("Favorites Count"), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(_("Published At"), null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.status == self.ACTIVE and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
    
    @property
    def total_price(self):
        """Calculate total price = quantity × price_per_unit"""
        if self.quantity and self.price_per_unit:
            return self.quantity * self.price_per_unit
        return 0
```

#### **DecimalField للكميات:**

```python
quantity = models.DecimalField(max_digits=10, decimal_places=2)
```

**لماذا ليس Integer؟**
- ✅ يدعم الكسور العشرية: 2.5 kg, 1.75 ton
- ✅ دقة عالية للتجارة
- ✅ مرونة في الوحدات
- ✅ يتجنب أخطاء التقريب في Float

**مثال:**
```python
quantity = 2.5  # 2.5 طن
price_per_unit = 500.00  # $500 للطن
total_price = 2.5 × 500 = $1,250
```

#### **التسعير المرن:**

```python
price_per_unit = models.DecimalField(...)
minimum_order_quantity = models.DecimalField(null=True, blank=True)
```

**السيناريو:**
- السعر: $2 لكل kg
- الحد الأدنى: 100 kg
- إذاً أقل طلب = $200

#### **فترة التوفر:**

```python
available_from = models.DateField(null=True, blank=True)
available_until = models.DateField(null=True, blank=True)
```

**Use Case:**
```
"500 kg wood chips available from 15 Dec to 31 Dec"
```

#### **Override save() Method:**

```python
def save(self, *args, **kwargs):
    if self.status == self.ACTIVE and not self.published_at:
        self.published_at = timezone.now()
    super().save(*args, **kwargs)
```

**ماذا يحدث؟**
1. لو الإعلان أصبح `active` لأول مرة
2. احفظ `published_at` بالتاريخ الحالي
3. نفذ الحفظ العادي
4. يُستخدم لترتيب الإعلانات حسب تاريخ النشر

#### **Property Method:**

```python
@property
def total_price(self):
    return self.quantity * self.price_per_unit
```

**الفائدة:**
- حساب تلقائي للسعر الإجمالي
- لا يُحفظ في قاعدة البيانات
- يُحسب عند الطلب فقط

**الاستخدام:**
```python
listing = MaterialListing.objects.get(id='...')
print(f"Total: ${listing.total_price}")  # لا حاجة للأقواس ()
```

---

### 🔸 Model 4: MaterialImage (صور المواد)

**الهدف:** صور متعددة لكل إعلان مادة

```python
class MaterialImage(models.Model):
    """Material Listing Images Model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_("Material Listing")
    )
    image = models.ImageField(
        _("Image"),
        upload_to="material_listings/%Y/%m/"
    )
    is_primary = models.BooleanField(_("Primary Image"), default=False)
    order = models.PositiveIntegerField(_("Order"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Material Image")
        verbose_name_plural = _("Material Images")
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"Image for {self.material_listing.material.name}"
```

#### **العلاقة One-to-Many:**

```
MaterialListing 1 ←→ Many MaterialImage
```

**مثال:**
```
MaterialListing: "500 kg Plastic PET"
  ├─ MaterialImage 1 (is_primary=True, order=0): Overall view
  ├─ MaterialImage 2 (is_primary=False, order=1): Close-up quality
  ├─ MaterialImage 3 (is_primary=False, order=2): Packaging
  └─ MaterialImage 4 (is_primary=False, order=3): Location
```

#### **الصورة الأساسية (Primary Image):**

```python
is_primary = models.BooleanField(_("Primary Image"), default=False)
```

- صورة واحدة فقط تكون `is_primary=True`
- تُعرض في القوائم والبطاقات (thumbnail)
- باقي الصور تظهر في صفحة التفاصيل

#### **ترتيب الصور (Order):**

```python
order = models.PositiveIntegerField(_("Order"), default=0)
```

- يحدد ترتيب عرض الصور (0, 1, 2, ...)
- في `Meta.ordering = ['order', '-created_at']`
- يسمح بإعادة ترتيب الصور بدون حذف وإعادة رفع

**الاستخدام:**
```python
listing = MaterialListing.objects.get(id='...')
primary = listing.images.filter(is_primary=True).first()
all_images = listing.images.all()  # مرتبة حسب order
```

---

### 🔸 Model 5: Product (المنتجات)

**الهدف:** منتجات فردية للبيع المباشر (ليس مواد خام)

```python
class Product(models.Model):
    """Recyclable Product Listing Model"""
    
    # Product Condition Choices
    NEW = 'new'
    LIKE_NEW = 'like_new'
    GOOD = 'good'
    FAIR = 'fair'
    POOR = 'poor'
    
    CONDITION_CHOICES = [
        (NEW, _('New')),
        (LIKE_NEW, _('Like New')),
        (GOOD, _('Good')),
        (FAIR, _('Fair')),
        (POOR, _('Poor')),
    ]
    
    # Product Status Choices
    DRAFT = 'draft'
    ACTIVE = 'active'
    SOLD = 'sold'
    RESERVED = 'reserved'
    DELETED = 'deleted'
    
    STATUS_CHOICES = [...]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_("Seller")
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name=_("Category")
    )
    
    # Basic Information
    title = models.CharField(_("Product Title"), max_length=200)
    title_ar = models.CharField(_("Arabic Title"), max_length=200, blank=True)
    description = models.TextField(_("Description"))
    description_ar = models.TextField(_("Arabic Description"), blank=True)
    
    # Pricing & Quantity
    price = models.DecimalField(
        _("Price"),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    quantity = models.PositiveIntegerField(
        _("Quantity"),
        default=1,
        validators=[MinValueValidator(1)]
    )
    unit = models.CharField(
        _("Unit"),
        max_length=50,
        default='kg',
        help_text=_("Unit of measurement (kg, ton, piece, etc.)")
    )
    
    # Product Details
    condition = models.CharField(
        _("Condition"),
        max_length=20,
        choices=CONDITION_CHOICES,
        default=GOOD
    )
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT
    )
    
    # Location
    location = models.CharField(_("Location"), max_length=255)
    latitude = models.DecimalField(
        _("Latitude"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        _("Longitude"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    # Engagement Metrics
    views_count = models.PositiveIntegerField(_("Views Count"), default=0)
    favorites_count = models.PositiveIntegerField(_("Favorites Count"), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(_("Published At"), null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.status == self.ACTIVE and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
```

#### **الفرق بين Product و MaterialListing:**

| Feature | Product | MaterialListing |
|---------|---------|-----------------|
| **Title** | حر (أي عنوان) | مرتبط بـ Material |
| **Pricing** | `price` (إجمالي) | `price_per_unit` |
| **Quantity** | PositiveIntegerField | DecimalField |
| **Condition** | 5 خيارات (new-poor) | 4 خيارات (excellent-poor) |
| **Use Case** | منتج واحد/عدة منتجات | كميات كبيرة من مادة واحدة |

#### **لماذا استخدمنا Constants (ثوابت)؟**
```python
NEW = 'new'  # بدلاً من كتابة 'new' مباشرة في الكود
```

**المميزات:**
- ✅ تجنب الأخطاء الإملائية
- ✅ IntelliSense/Autocomplete في VS Code
- ✅ سهولة التعديل المستقبلي
- ✅ الكود أكثر قابلية للقراءة

#### **الحقول الرئيسية:**

```python
seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
```

| الحقل | العلاقة | الشرح |
|------|---------|-------|
| `seller` | User → Products | البائع (One-to-Many) |
| `category` | Category → Products | الفئة (One-to-Many) |

#### **Cascade vs Protect:**

```python
on_delete=models.CASCADE   # لو User اتمسح → امسح كل منتجاته
on_delete=models.PROTECT   # لو Category فيها منتجات → منع الحذف
```

#### **السعر والكمية:**

```python
price = models.DecimalField(
    _("Price"),
    max_digits=10,
    decimal_places=2,
    validators=[MinValueValidator(0)]
)
```

- `DecimalField`: أدق من Float للأموال
- `max_digits=10`: 10 أرقام كاملة (مثال: 99,999,999.99)
- `decimal_places=2`: رقمين عشريين
- `MinValueValidator(0)`: منع السعر السالب

#### **الموقع الجغرافي (GPS):**

```python
location = models.CharField(_("Location"), max_length=255)
latitude = models.DecimalField(_("Latitude"), max_digits=9, decimal_places=6)
longitude = models.DecimalField(_("Longitude"), max_digits=9, decimal_places=6)
```

- `latitude`: خط العرض (مثال: 30.044420)
- `longitude`: خط الطول (مثال: 31.235712)
- يمكن استخدامها في خرائط Google Maps

#### **عدادات المشاركة (Engagement Metrics):**

```python
views_count = models.PositiveIntegerField(_("Views Count"), default=0)
favorites_count = models.PositiveIntegerField(_("Favorites Count"), default=0)
```

- تزيد تلقائياً عند المشاهدة أو الإضافة للمفضلة
- تساعد في الترتيب حسب الشعبية
- تُحدث في Views و Custom Actions

---

### 🔸 Model 6: ProductImage (صور المنتجات)

**الهدف:** صور متعددة لكل منتج

```python
class ProductImage(models.Model):
    """Product Images Model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_("Product")
    )
    image = models.ImageField(
        _("Image"),
        upload_to="products/%Y/%m/"
    )
    is_primary = models.BooleanField(_("Primary Image"), default=False)
    order = models.PositiveIntegerField(_("Order"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Product Image")
        verbose_name_plural = _("Product Images")
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"Image for {self.product.title}"
```

#### **العلاقة One-to-Many:**

```
Product 1 ←→ Many ProductImage
```

- كل منتج له **عدة صور**
- `related_name='images'` يسمح بـ: `product.images.all()`

**مثال:**
```python
product = Product.objects.get(id='...')
primary_image = product.images.filter(is_primary=True).first()
all_images = product.images.order_by('order')
image_count = product.images.count()
```

---

## 2. لماذا نحتاج ProductImage و MaterialImage؟ {#why-images}

### ❓ السؤال الشائع: لماذا لا نضع الصور مباشرة في Product/MaterialListing؟

#### ❌ **الطريقة السيئة** (Bad Design):

```python
class Product(models.Model):
    image1 = models.ImageField(...)
    image2 = models.ImageField(...)
    image3 = models.ImageField(...)
    image4 = models.ImageField(...)
    image5 = models.ImageField(...)
```

**المشاكل:**
- 🔴 عدد صور محدود (5 صور فقط)
- 🔴 لو المستخدم رفع صورتين فقط → 3 حقول فارغة
- 🔴 لو احتاج 10 صور → لازم تعديل Database Schema
- 🔴 صعوبة في ترتيب الصور
- 🔴 لا يمكن تحديد صورة رئيسية بسهولة

#### ✅ **الطريقة الصحيحة** (Good Design):

```python
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images')
    image = models.ImageField(...)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
```

**المميزات:**
- ✅ عدد غير محدود من الصور
- ✅ مرونة كاملة (1 صورة أو 100)
- ✅ ترتيب قابل للتعديل (`order` field)
- ✅ صورة رئيسية واضحة (`is_primary`)
- ✅ سهولة الإضافة/الحذف/التعديل
- ✅ استعلامات SQL أسرع

### 📊 مقارنة الأداء:

#### Scenario: عرض 100 منتج في قائمة (List View)

**❌ مع حقول متعددة:**
```sql
SELECT id, title, price, image1, image2, image3, image4, image5 
FROM products
LIMIT 100;
-- يرجع 500 صورة (حتى لو غير مستخدمة)
```

**✅ مع جدول منفصل:**
```sql
SELECT products.*, primary_image.image
FROM products
LEFT JOIN product_images AS primary_image 
  ON products.id = primary_image.product_id 
  AND primary_image.is_primary = TRUE
LIMIT 100;
-- يرجع 100 صورة فقط (الصور الرئيسية)
```

### 🎯 Use Cases للصور المتعددة:

#### 1. **Product Listing:**
- صورة أمامية
- صورة خلفية
- close-up للعيوب أو الجودة
- صورة التغليف
- صورة مع مسطرة للحجم

#### 2. **Material Listing:**
- صورة الكومة الكاملة
- close-up لجودة المادة
- صورة الموقع/المستودع
- صورة للشوائب (إن وُجدت)
- صورة التخزين

### 🚀 Performance Benefits:

1. **Lazy Loading**:
   ```python
   # تحميل الصورة الرئيسية فقط
   products = Product.objects.all().prefetch_related(
       Prefetch('images', queryset=ProductImage.objects.filter(is_primary=True))
   )
   ```

2. **Pagination**:
   - List View: صورة واحدة (primary) × 20 منتج = 20 صورة
   - بدون جدول منفصل: 5 صور × 20 منتج = 100 صورة (غير ضرورية)

3. **Caching**:
   ```python
   # cache للصور الرئيسية فقط
   cache.set(f'product:{id}:primary', primary_image, timeout=3600)
   ```

### 📱 Frontend/Mobile Benefits:

```javascript
// React/Vue Component
<ProductCard>
  <img src={product.primary_image} />  // تحميل سريع
  {/* Secondary images lazy load on click */}
</ProductCard>

<ProductDetail>
  <ImageGallery images={product.all_images} />  // تحميل عند الطلب
</ProductDetail>
```

### 🔐 Security & Control:

```python
class ProductImage(models.Model):
    # يمكن إضافة حقول للتحكم
    is_approved = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(User, ...)
    file_size = models.IntegerField()  # للتحقق من الحجم
    
    def save(self, *args, **kwargs):
        # Image validation/resizing logic
        if self.image.size > 5 * 1024 * 1024:  # 5MB
            raise ValidationError("Image too large")
        super().save(*args, **kwargs)
```

### 📊 Database Normalization:

هذا يتبع **Third Normal Form (3NF)**:
- كل معلومة في مكانها الصحيح
- لا تكرار للبيانات
- سهولة الصيانة والتوسع

---

## 3. Favorite Model (المفضلة) {#favorite}

```python
class Favorite(models.Model):
    """User Favorites/Wishlist Model - Supports both Products and Material Listings"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name=_("User")
    )
    # Support for Products
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name=_("Product"),
        null=True,
        blank=True
    )
    # Support for Material Listings
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name=_("Material Listing"),
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, material_listing__isnull=True) |
                    models.Q(product__isnull=True, material_listing__isnull=False)
                ),
                name='favorite_either_product_or_material'
            ),
            models.UniqueConstraint(
                fields=['user', 'product'],
                condition=models.Q(product__isnull=False),
                name='unique_user_product_favorite'
            ),
            models.UniqueConstraint(
                fields=['user', 'material_listing'],
                condition=models.Q(material_listing__isnull=False),
                name='unique_user_material_favorite'
            ),
        ]
```

#### **Polymorphic Relationship:**

يدعم إما Product **أو** MaterialListing (ليس الاثنين معاً)

**CheckConstraint يضمن:**
```sql
(product IS NOT NULL AND material_listing IS NULL) 
OR 
(product IS NULL AND material_listing IS NOT NULL)
```

#### **Unique Constraints:**

```python
UniqueConstraint(fields=['user', 'product'], condition=Q(product__isnull=False))
```

**معناها:**
- المستخدم لا يمكنه إضافة نفس Product مرتين
- نفس الشيء لـ MaterialListing
- Conditional constraint (يطبق فقط لو product موجود)

#### **الاستخدام:**

```python
# إضافة product للمفضلة
Favorite.objects.create(user=request.user, product=product)

# إضافة material listing للمفضلة
Favorite.objects.create(user=request.user, material_listing=listing)

# جلب كل مفضلات المستخدم
user_favorites = Favorite.objects.filter(user=request.user)

# الفلترة حسب النوع
product_favorites = user_favorites.filter(product__isnull=False)
material_favorites = user_favorites.filter(material_listing__isnull=False)
```

---

## 4. Order Model (الطلبات) {#order}

```python
class Order(models.Model):
    """Order/Purchase Model - Supports both Products and Materials"""
    
    # Order Type Choices
    PRODUCT = 'product'
    MATERIAL = 'material'
    
    ORDER_TYPE_CHOICES = [
        (PRODUCT, _('Product')),
        (MATERIAL, _('Material')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(_("Order Number"), max_length=50, unique=True, editable=False)
    order_type = models.CharField(_("Order Type"), max_length=20, choices=ORDER_TYPE_CHOICES)
    
    buyer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='purchases')
    seller = models.ForeignKey(User, on_delete=models.PROTECT, related_name='sales')
    
    # Support for Products
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='orders',
        null=True,
        blank=True
    )
    # Support for Material Listings
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.PROTECT,
        related_name='orders',
        null=True,
        blank=True
    )
    
    # Order Details
    quantity = models.DecimalField(_("Quantity"), max_digits=10, decimal_places=2)
    unit = models.CharField(_("Unit"), max_length=50, default='piece')
    unit_price = models.DecimalField(_("Unit Price"), max_digits=10, decimal_places=2)
    total_price = models.DecimalField(_("Total Price"), max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(_("Order Status"), max_length=20, choices=STATUS_CHOICES, default=PENDING)
    payment_status = models.CharField(_("Payment Status"), max_length=20, choices=PAYMENT_STATUS_CHOICES, default=UNPAID)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(_("Confirmed At"), null=True, blank=True)
    completed_at = models.DateTimeField(_("Completed At"), null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            prefix = 'PRD' if self.order_type == self.PRODUCT else 'MAT'
            self.order_number = f"{prefix}-{timestamp}-{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate total price
        self.total_price = float(self.quantity) * float(self.unit_price)
        
        super().save(*args, **kwargs)
    
    @property
    def item(self):
        """Get the ordered item (product or material)"""
        return self.product if self.order_type == self.PRODUCT else self.material_listing
```

#### **رقم الطلب التلقائي:**

```python
order_number = f"{prefix}-{timestamp}-{str(uuid.uuid4())[:8].upper()}"
```

**أمثلة:**
- `PRD-20251211153045-A1B2C3D4` (Product Order)
- `MAT-20251211153045-X9Y8Z7W6` (Material Order)

**الفوائد:**
- ✅ فريد لكل طلب
- ✅ يحتوي على التاريخ (للتتبع)
- ✅ يحدد النوع (PRD vs MAT)
- ✅ آمن (UUID جزء منه)

#### **PROTECT للعلاقات:**

```python
buyer = models.ForeignKey(User, on_delete=models.PROTECT)
product = models.ForeignKey(Product, on_delete=models.PROTECT)
```

**لماذا PROTECT؟**
- يمنع حذف User أو Product لو عليه طلبات
- يحفظ سجل المبيعات للأبد
- مهم للتقارير المالية والضرائب

#### **حساب السعر التلقائي:**

```python
def save(self, *args, **kwargs):
    self.total_price = float(self.quantity) * float(self.unit_price)
    super().save(*args, **kwargs)
```

**الفائدة:**
- لا يحتاج Frontend لحساب السعر
- يضمن الدقة (Server-side calculation)
- يُحفظ سعر الشراء الفعلي (حتى لو تغير السعر لاحقاً)

#### **Property للوصول الموحد:**

```python
@property
def item(self):
    return self.product if self.order_type == self.PRODUCT else self.material_listing
```

**الاستخدام:**
```python
order = Order.objects.get(id='...')
print(f"Ordered: {order.item.title}")  # يعمل مع Product أو MaterialListing
```

---

## 5. Review, Message, Report Models

**ملاحظة:** هذه النماذج تتبع نفس النمط (Polymorphic) مثل Favorite و Order، وتدعم كلاً من Products و Material Listings.

### التفاصيل متوفرة في الملفات:
- [MARKETPLACE_DOCUMENTATION.md](MARKETPLACE_DOCUMENTATION.md)
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🎯 الخلاصة - Summary

### ما تم بناؤه:

1. **11 Models** مع علاقات معقدة:
   - Category (التصنيفات)
   - Material (المواد الخام - Master Data)
   - MaterialListing (إعلانات المواد)
   - MaterialImage (صور المواد)
   - Product (المنتجات)
   - ProductImage (صور المنتجات)
   - Favorite (المفضلة)
   - Order (الطلبات)
   - Review (المراجعات)
   - Message (الرسائل)
   - Report (التقارير)

2. **نظام مزدوج** يدعم:
   - Materials System (للمواد الخام بكميات تجارية)
   - Products System (للمنتجات الفردية)

3. **Polymorphic Relationships**:
   - Favorite, Order, Review, Message, Report تدعم كلا النظامين

4. **Image Management**:
   - جداول منفصلة للصور (ProductImage, MaterialImage)
   - صور متعددة، ترتيب، صورة رئيسية

### المفاهيم المستخدمة:

✅ UUID Primary Keys  
✅ Foreign Keys (One-to-Many)  
✅ Self-Referential Relations (Category tree)  
✅ Master Data Pattern (Material)  
✅ Polymorphic Relationships  
✅ Unique Together Constraints  
✅ Check Constraints  
✅ Conditional Unique Constraints  
✅ Database Indexes للأداء  
✅ Validators (Min/Max)  
✅ Override save() للمنطق المخصص  
✅ Property Methods للحسابات  
✅ DecimalField للدقة المالية  
✅ CASCADE vs PROTECT strategies  
✅ Related Names للعلاقات العكسية  
✅ Normalization (3NF)  

---

**🚀 هذا توثيق كامل لكل Model في النظام!**

---

# المراجع والملفات الإضافية

لمزيد من التفاصيل، راجع:
- [MARKETPLACE_DOCUMENTATION.md](MARKETPLACE_DOCUMENTATION.md) - API documentation
- [MATERIALS_IMPLEMENTATION.md](MATERIALS_IMPLEMENTATION.md) - Materials system details
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project overview
- [TEAM_GUIDE.md](TEAM_GUIDE.md) - Team collaboration guide
