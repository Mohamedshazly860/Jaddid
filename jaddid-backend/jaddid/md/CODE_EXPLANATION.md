# شرح مفصل للكود - Detailed Code Explanation
# توثيق تقني كامل لتطبيق Marketplace

**آخر تحديث: ديسمبر 2025**

---

## 📋 فهرس المحتويات - Table of Contents

1. [نظرة عامة - Overview](#overview)
2. [Models - النماذج](#models)
3. [Serializers - المسلسلات](#serializers)
4. [Views - طبقة العرض](#views)
5. [Admin - لوحة الإدارة](#admin)
6. [Permissions - الصلاحيات](#permissions)
7. [URLs - المسارات](#urls)
8. [Settings Configuration - إعدادات المشروع](#settings)

---

## 📊 نظرة عامة - Overview {#overview}

### نظام مزدوج للتعامل مع المواد القابلة لإعادة التدوير

التطبيق يدعم نوعين من العناصر:

#### 1️⃣ **Materials System** (نظام المواد الخام)
- **Master Data**: قائمة موحدة للمواد (خشب، بلاستيك، ورق، معادن)
- **Material Listings**: إعلانات البائعين للمواد الخام
- **Use Case**: شراء كميات كبيرة من المواد الخام لإعادة التدوير

#### 2️⃣ **Products System** (نظام المنتجات)
- **Direct Listings**: منتجات فردية للبيع المباشر
- **Use Case**: بيع منتجات معاد تدويرها أو منتجات مستعملة

### الفرق بين Material و Product

| Feature | Material | Product |
|---------|----------|---------|
| **البيانات الأساسية** | من Master Data | بيانات حرة |
| **التسعير** | سعر لكل وحدة (kg/ton) | سعر إجمالي |
| **الكمية** | DecimalField (دقيق) | Integer (عدد صحيح) |
| **الاستخدام** | تجاري، كميات كبيرة | فردي، منتجات محددة |

---

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
- مثال: "البلاستيك" → "زجاجات بلاستيك"، "أكياس بلاستيك"

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
- `indexes`: فهارس للبحث السريع

---

### 🔸 Model 2: Product (المنتجات)

```python
class Product(models.Model):
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
    
    STATUS_CHOICES = [
        (DRAFT, _('Draft')),
        (ACTIVE, _('Active')),
        (SOLD, _('Sold')),
        (RESERVED, _('Reserved')),
        (DELETED, _('Deleted')),
    ]
```

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
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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

#### **الحقول الثنائية اللغة:**

```python
title = models.CharField(_("Product Title"), max_length=200)
title_ar = models.CharField(_("Arabic Title"), max_length=200, blank=True)
description = models.TextField(_("Description"))
description_ar = models.TextField(_("Arabic Description"), blank=True)
```

- حقلين لكل بيانة: إنجليزي + عربي
- الإنجليزي إلزامي، العربي اختياري

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

#### **Override save() Method:**

```python
def save(self, *args, **kwargs):
    if self.status == self.ACTIVE and not self.published_at:
        self.published_at = timezone.now()
    super().save(*args, **kwargs)
```

**ماذا يحدث؟**
1. لو المنتج أصبح `active` لأول مرة
2. احفظ `published_at` بالتاريخ الحالي
3. نفذ الحفظ العادي

---

### 🔸 Model 3: ProductImage (صور المنتجات)

```python
class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(_("Image"), upload_to="products/%Y/%m/")
    is_primary = models.BooleanField(_("Primary Image"), default=False)
    order = models.PositiveIntegerField(_("Order"), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### **العلاقة One-to-Many:**

```
Product 1 ←→ Many ProductImage
```

- كل منتج له **عدة صور**
- `related_name='images'` يسمح بـ: `product.images.all()`

#### **الصورة الأساسية (Primary Image):**

```python
is_primary = models.BooleanField(_("Primary Image"), default=False)
```

- صورة واحدة فقط تكون `is_primary=True`
- تُعرض في القوائم والبطاقات

#### **ترتيب الصور (Order):**

```python
order = models.PositiveIntegerField(_("Order"), default=0)
```

- يحدد ترتيب عرض الصور (0, 1, 2, ...)
- في `Meta.ordering = ['order', '-created_at']`

---

### 🔸 Model 4: Favorite (المفضلة)

```python
class Favorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
```

#### **Unique Together Constraint:**

```python
unique_together = ['user', 'product']
```

**معناها:** لا يمكن للمستخدم إضافة نفس المنتج مرتين للمفضلة

#### **العلاقات:**

```
User 1 ←→ Many Favorite ←→ Many Product
```

- المستخدم يمكنه حفظ عدة منتجات
- المنتج يمكن أن يكون مفضلاً لعدة مستخدمين
- **Many-to-Many** relationship عبر Favorite model

---

### 🔸 Model 5: Order (الطلبات)

```python
class Order(models.Model):
    # Order Status
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'
    
    # Payment Status
    UNPAID = 'unpaid'
    PAID = 'paid'
    PARTIAL = 'partial'
```

#### **رقم الطلب التلقائي:**

```python
order_number = models.CharField(_("Order Number"), max_length=50, unique=True, editable=False)

def save(self, *args, **kwargs):
    if not self.order_number:
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        self.order_number = f"ORD-{timestamp}-{str(uuid.uuid4())[:8].upper()}"
    
    # حساب السعر الإجمالي
    self.total_price = self.quantity * self.unit_price
    
    super().save(*args, **kwargs)
```

**مثال على order_number:**
```
ORD-20251210120000-A1B2C3D4
```

- `ORD`: بادئة ثابتة
- `20251210120000`: التاريخ والوقت
- `A1B2C3D4`: 8 أحرف من UUID

#### **حساب السعر الإجمالي:**

```python
self.total_price = self.quantity * self.unit_price
```

- يحسب تلقائياً عند الحفظ
- لا يحتاج المستخدم لإرساله

#### **العلاقات الثلاثية:**

```python
buyer = models.ForeignKey(User, related_name='purchases')
seller = models.ForeignKey(User, related_name='sales')
product = models.ForeignKey(Product, related_name='orders')
```

- `buyer.purchases.all()`: كل مشتريات المستخدم
- `seller.sales.all()`: كل مبيعات البائع
- `product.orders.all()`: كل طلبات المنتج

---

### 🔸 Model 6: Review (المراجعات)

```python
class Review(models.Model):
    rating = models.PositiveIntegerField(
        _("Rating"),
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    is_verified_purchase = models.BooleanField(_("Verified Purchase"), default=False)
    is_approved = models.BooleanField(_("Approved"), default=True)
    
    class Meta:
        unique_together = ['product', 'reviewer', 'order']
```

#### **التقييم من 1-5:**

```python
validators=[MinValueValidator(1), MaxValueValidator(5)]
```

- يمنع القيم خارج النطاق
- Django يرفض القيم 0 أو 6+

#### **Unique Together (ثلاثي):**

```python
unique_together = ['product', 'reviewer', 'order']
```

- المستخدم يراجع المنتج **لكل طلب**
- لو اشترى نفس المنتج مرتين = مراجعتين

#### **Verified Purchase Badge:**

```python
is_verified_purchase = models.BooleanField(default=False)
```

- `True`: المستخدم اشترى المنتج فعلاً
- يُحدد في Serializer بناءً على Order

---

### 🔸 Model 7: Message (الرسائل)

```python
class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages')
    recipient = models.ForeignKey(User, related_name='received_messages')
    product = models.ForeignKey(Product, null=True, blank=True, related_name='messages')
    
    message = models.TextField(_("Message"))
    is_read = models.BooleanField(_("Read"), default=False)
    read_at = models.DateTimeField(_("Read At"), null=True, blank=True)
```

#### **العلاقات:**

```
User (Sender) → Message ← User (Recipient)
         ↓
      Product (optional)
```

- رسالة بين مستخدمين
- اختيارياً مرتبطة بمنتج معين

#### **حالة القراءة:**

```python
is_read = models.BooleanField(default=False)
read_at = models.DateTimeField(null=True, blank=True)
```

- عند فتح الرسالة: `is_read=True` + حفظ `read_at`

---

### 🔸 Model 8: Report (التقارير)

```python
class Report(models.Model):
    # Report Reasons
    SPAM = 'spam'
    INAPPROPRIATE = 'inappropriate'
    FRAUD = 'fraud'
    DUPLICATE = 'duplicate'
    OTHER = 'other'
    
    # Report Status
    PENDING = 'pending'
    REVIEWING = 'reviewing'
    RESOLVED = 'resolved'
    DISMISSED = 'dismissed'
```

#### **سير عمل التقرير:**

```
1. المستخدم يبلغ → status = PENDING
2. المسؤول يراجع → status = REVIEWING
3. يتخذ قرار → status = RESOLVED أو DISMISSED
```

#### **العلاقات:**

```python
reporter = models.ForeignKey(User, related_name='reports_made')
product = models.ForeignKey(Product, related_name='reports')
resolved_by = models.ForeignKey(User, null=True, blank=True, related_name='reports_resolved')
```

- `reporter`: من أبلغ
- `resolved_by`: المسؤول الذي حل المشكلة

---

## 2. Serializers - المسلسلات {#serializers}

### 📁 الملف: `marketplace/serializers.py`

Serializers تحول البيانات من Python Objects إلى JSON والعكس.

---

### 🔹 Serializer Pattern: Base → List → Detail → Create/Update

#### **Pattern 1: CategorySerializer (الأساسي)**

```python
class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'name_ar', 'description', 'icon',
            'parent', 'subcategories', 'is_active', 
            'product_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

#### **SerializerMethodField شرح:**

```python
subcategories = serializers.SerializerMethodField()

def get_subcategories(self, obj):
    if obj.subcategories.exists():
        return CategorySerializer(
            obj.subcategories.filter(is_active=True), 
            many=True, 
            context=self.context
        ).data
    return []
```

**ماذا يحدث؟**
1. Django يستدعي `get_subcategories(obj)` تلقائياً
2. `obj` = Category instance الحالية
3. نجيب كل الـ subcategories النشطة
4. نحولها لـ JSON باستخدام نفس الـ Serializer (Recursive)
5. نرجع array أو `[]` لو مفيش

**لماذا `context=self.context`؟**
- ينقل الـ request للـ serializer الداخلي
- مهم لبناء الروابط الكاملة (absolute URLs)

---

#### **Pattern 2: ProductListSerializer (للقوائم - خفيف)**

```python
class ProductListSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
```

#### **source attribute شرح:**

```python
seller_name = serializers.CharField(source='seller.get_full_name')
```

**معناها:**
- بدلاً من `seller` (object كامل)
- نجيب `seller.get_full_name()` مباشرة
- يوفر Bandwidth ويسرع Response

#### **Primary Image Logic:**

```python
def get_primary_image(self, obj):
    primary = obj.images.filter(is_primary=True).first()
    if primary:
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(primary.image.url)
    return None
```

**الخطوات:**
1. ابحث عن أول صورة `is_primary=True`
2. لو موجودة، ابني رابط كامل:
   - `/media/products/2025/12/image.jpg` ← `http://localhost:8000/media/products/2025/12/image.jpg`
3. لو مفيش، ارجع `null`

#### **is_favorited للمستخدم الحالي:**

```python
def get_is_favorited(self, obj):
    request = self.context.get('request')
    if request and request.user.is_authenticated:
        return obj.favorited_by.filter(user=request.user).exists()
    return False
```

**المنطق:**
1. هل فيه `request` في الـ context؟
2. هل المستخدم مسجل دخول؟
3. هل المنتج في favorites المستخدم؟
4. لو أي شرط `False` → ارجع `False`

---

#### **Pattern 3: ProductDetailSerializer (للتفاصيل - كامل)**

```python
class ProductDetailSerializer(serializers.ModelSerializer):
    seller = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
```

#### **Nested Serializers:**

```python
category = CategorySerializer(read_only=True)
images = ProductImageSerializer(many=True, read_only=True)
```

**الفرق:**
- **List View**: `category_name` (string فقط)
- **Detail View**: `category` (object كامل مع subcategories)

#### **حساب متوسط التقييم:**

```python
def get_average_rating(self, obj):
    reviews = obj.reviews.filter(is_approved=True)
    if reviews.exists():
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)
    return 0.0
```

**الخطوات:**
1. جيب كل المراجعات المعتمدة
2. لو فيه مراجعات:
   - اجمع كل الـ ratings: `[5, 4, 5, 3]`
   - اقسم على العدد: `17 / 4 = 4.25`
   - قرّب لرقم عشري واحد: `4.3`
3. لو مفيش: `0.0`

---

#### **Pattern 4: ProductCreateUpdateSerializer (للإنشاء/التعديل)**

```python
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    @transaction.atomic
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        validated_data['seller'] = self.context['request'].user
        product = Product.objects.create(**validated_data)
        
        for idx, image in enumerate(uploaded_images):
            ProductImage.objects.create(
                product=product,
                image=image,
                is_primary=(idx == 0),
                order=idx
            )
        
        return product
```

#### **@transaction.atomic شرح:**

```python
@transaction.atomic
def create(self, validated_data):
    # كل هذا الكود في transaction واحدة
```

**فائدته:**
- لو حصل خطأ في أي خطوة → **Rollback كامل**
- مثال: لو Product اتحفظ لكن الصور فشلت → Django يلغي كل حاجة
- يضمن **Data Integrity**

#### **Dynamic Primary Image:**

```python
for idx, image in enumerate(uploaded_images):
    ProductImage.objects.create(
        product=product,
        image=image,
        is_primary=(idx == 0),  # أول صورة فقط primary
        order=idx               # 0, 1, 2, 3, ...
    )
```

---

#### **Write-Only vs Read-Only:**

```python
uploaded_images = serializers.ListField(..., write_only=True)  # للإدخال فقط
images = ProductImageSerializer(many=True, read_only=True)     # للعرض فقط
```

**في POST/PUT:**
```json
{
  "uploaded_images": [<file1>, <file2>]  // يُرسل
}
```

**في GET Response:**
```json
{
  "images": [                    // يُرجع
    {"id": "...", "image": "...", "is_primary": true}
  ]
}
```

---

### 🔹 Advanced Patterns

#### **Pattern: Custom Validation**

```python
class OrderSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        request = self.context['request']
        product_id = validated_data.pop('product_id', None)
        
        if product_id:
            product = Product.objects.get(id=product_id)
            validated_data['product'] = product
            validated_data['seller'] = product.seller
        
        validated_data['buyer'] = request.user
        validated_data['unit_price'] = validated_data['product'].price
        
        return super().create(validated_data)
```

**المنطق:**
1. المستخدم يرسل `product_id` فقط
2. Serializer يجيب `seller` من المنتج تلقائياً
3. يحدد `buyer` من `request.user`
4. يحدد `unit_price` من سعر المنتج الحالي (لو السعر اتغير لاحقاً)

---

## 3. Views - طبقة العرض {#views}

### 📁 الملف: `marketplace/views.py`

Views تتحكم في منطق الـ API وتربط Models مع Serializers.

---

### 🔹 ViewSet Pattern: ModelViewSet

```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
```

#### **ModelViewSet يوفر تلقائياً:**

| HTTP Method | Endpoint | Action | معناها |
|------------|----------|--------|--------|
| GET | `/products/` | list | قائمة المنتجات |
| POST | `/products/` | create | إنشاء منتج |
| GET | `/products/{id}/` | retrieve | تفاصيل منتج |
| PUT | `/products/{id}/` | update | تحديث كامل |
| PATCH | `/products/{id}/` | partial_update | تحديث جزئي |
| DELETE | `/products/{id}/` | destroy | حذف |

---

### 🔹 Dynamic Serializer Class

```python
def get_serializer_class(self):
    if self.action == 'list':
        return ProductListSerializer      # خفيف للقوائم
    elif self.action in ['create', 'update', 'partial_update']:
        return ProductCreateUpdateSerializer  # للإنشاء/التعديل
    return ProductDetailSerializer        # كامل للتفاصيل
```

**الفائدة:**
- **List**: يرجع 100 منتج → لا نحتاج كل التفاصيل
- **Detail**: منتج واحد → نعرض كل حاجة
- **Create**: نحتاج حقول معينة فقط

---

### 🔹 Custom QuerySet Filtering

```python
def get_queryset(self):
    queryset = super().get_queryset()
    
    # Filter by status for non-owners
    if self.action == 'list':
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='active')
        else:
            # Show user's own products regardless of status
            queryset = queryset.filter(
                Q(status='active') | Q(seller=self.request.user)
            )
    
    # Filter by price range
    min_price = self.request.query_params.get('min_price')
    max_price = self.request.query_params.get('max_price')
    
    if min_price:
        queryset = queryset.filter(price__gte=min_price)
    if max_price:
        queryset = queryset.filter(price__lte=max_price)
    
    return queryset
```

#### **Q Objects للشروط المعقدة:**

```python
Q(status='active') | Q(seller=self.request.user)
```

**معناها:**
```sql
WHERE status = 'active' OR seller_id = current_user_id
```

#### **Query Parameters:**

```python
min_price = self.request.query_params.get('min_price')
```

**من URL:**
```
GET /api/products/?min_price=100&max_price=500
```

---

### 🔹 Override retrieve() لزيادة المشاهدات

```python
def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    instance.views_count += 1
    instance.save(update_fields=['views_count'])
    
    serializer = self.get_serializer(instance)
    return Response(serializer.data)
```

**الخطوات:**
1. جيب المنتج (`get_object()`)
2. زود `views_count` بـ 1
3. احفظ الحقل ده فقط (`update_fields` للسرعة)
4. ارجع Response عادي

**لماذا `update_fields`؟**
- بدون: Django يحفظ **كل الحقول** (slow)
- معاه: يحفظ `views_count` فقط (fast)

---

### 🔹 Custom Actions (@action decorator)

```python
@action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
def toggle_favorite(self, request, pk=None):
    product = self.get_object()
    favorite, created = Favorite.objects.get_or_create(
        user=request.user,
        product=product
    )
    
    if not created:
        favorite.delete()
        product.favorites_count = max(0, product.favorites_count - 1)
        product.save(update_fields=['favorites_count'])
        return Response({
            'message': 'Product removed from favorites',
            'is_favorited': False
        })
    else:
        product.favorites_count += 1
        product.save(update_fields=['favorites_count'])
        return Response({
            'message': 'Product added to favorites',
            'is_favorited': True
        }, status=status.HTTP_201_CREATED)
```

#### **@action شرح:**

```python
@action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
```

| Parameter | Value | معناها |
|-----------|-------|--------|
| `detail=True` | نعم | يحتاج `{id}` في URL |
| `methods=['post']` | POST | HTTP Method |
| `permission_classes` | IsAuthenticated | يجب تسجيل الدخول |

**Endpoint النهائي:**
```
POST /api/products/{id}/toggle_favorite/
```

#### **get_or_create() Pattern:**

```python
favorite, created = Favorite.objects.get_or_create(
    user=request.user,
    product=product
)
```

**ماذا يحدث؟**
- لو موجود: `created=False`، يرجع الموجود
- لو مش موجود: `created=True`، ينشئه

**الفائدة:**
- عملية واحدة بدلاً من:
  ```python
  if Favorite.objects.filter(...).exists():
      favorite = Favorite.objects.get(...)
  else:
      favorite = Favorite.objects.create(...)
  ```

---

### 🔹 List Action (بدون detail)

```python
@action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
def my_products(self, request):
    products = self.queryset.filter(seller=request.user)
    page = self.paginate_queryset(products)
    
    if page is not None:
        serializer = ProductListSerializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)
    
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)
```

**Endpoint:**
```
GET /api/products/my_products/
```

#### **Pagination Handling:**

```python
page = self.paginate_queryset(products)
if page is not None:
    # Return paginated response
else:
    # Return all results
```

**Response مع Pagination:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/products/my_products/?page=2",
  "previous": null,
  "results": [...]
}
```

---

### 🔹 Order Confirmation Workflow

```python
@action(detail=True, methods=['post'])
def confirm(self, request, pk=None):
    order = self.get_object()
    
    if order.seller != request.user:
        return Response(
            {'error': 'Only seller can confirm orders'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if order.status != 'pending':
        return Response(
            {'error': 'Order is not in pending status'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.status = 'confirmed'
    order.confirmed_at = timezone.now()
    order.save()
    
    serializer = self.get_serializer(order)
    return Response(serializer.data)
```

#### **Business Logic Validation:**

```python
if order.seller != request.user:
    return Response({'error': '...'}, status=403)
```

**الشروط:**
1. ✅ فقط البائع يؤكد
2. ✅ الطلب لازم يكون `pending`
3. ✅ غيّر الحالة واحفظ التاريخ

---

## 4. Admin - لوحة الإدارة {#admin}

### 📁 الملف: `marketplace/admin.py`

---

### 🔹 Basic Admin Registration

```python
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller_info', 'category', 'price', 'status', 'created_at']
    list_filter = ['status', 'condition', 'category', 'created_at']
    search_fields = ['title', 'description', 'seller__email']
    ordering = ['-created_at']
```

#### **list_display:**
الأعمدة في جدول Admin:

| Column | Displayed |
|--------|-----------|
| title | عنوان المنتج |
| seller_info | البائع (custom method) |
| category | الفئة |
| price | السعر |
| status | الحالة |

#### **Custom Method في list_display:**

```python
def seller_info(self, obj):
    return format_html(
        '<a href="/admin/accounts/user/{}/change/">{}</a>',
        obj.seller.id,
        obj.seller.email
    )
seller_info.short_description = 'Seller'
```

**الفائدة:**
- رابط قابل للنقر للبائع
- يفتح صفحة المستخدم مباشرة

---

### 🔹 Inline Editing

```python
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_primary', 'order']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
```

**الفائدة:**
- تعديل صور المنتج **بدون مغادرة صفحة المنتج**
- `extra=1`: صف فارغ للإضافة

---

### 🔹 Custom Admin Actions

```python
actions = ['make_active', 'make_draft', 'make_sold']

def make_active(self, request, queryset):
    updated = queryset.update(status='active')
    self.message_user(request, f'{updated} products marked as active.')
make_active.short_description = 'Mark selected products as active'
```

**كيفية الاستخدام:**
1. حدد عدة منتجات من القائمة
2. اختر "Mark selected products as active" من القائمة المنسدلة
3. اضغط "Go"
4. يحدث Bulk Update لكل المنتجات المحددة

---

### 🔹 Fieldsets Organization

```python
fieldsets = (
    ('Seller Information', {
        'fields': ('seller',)
    }),
    ('Product Information', {
        'fields': ('category', 'title', 'title_ar', 'description', 'description_ar')
    }),
    ('Pricing & Quantity', {
        'fields': ('price', 'quantity', 'unit')
    }),
    ('Metrics', {
        'fields': ('views_count', 'favorites_count'),
        'classes': ('collapse',)
    }),
)
```

**الفائدة:**
- تنظيم الحقول في **أقسام منطقية**
- `'collapse'`: القسم مطوي بشكل افتراضي

---

## 5. Permissions - الصلاحيات {#permissions}

### 📁 الملف: `marketplace/permissions.py`

---

### 🔹 IsSellerOrReadOnly

```python
class IsSellerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.seller == request.user
```

#### **SAFE_METHODS:**

```python
SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')
```

**المنطق:**
- **GET/HEAD/OPTIONS**: الجميع يقرأ ✅
- **POST/PUT/PATCH/DELETE**: فقط البائع يعدل ✅

---

### 🔹 IsOwnerOrReadOnly

```python
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.user == request.user
```

**الاستخدام:**
- Favorite: المستخدم يحذف مفضلته فقط
- Review: المستخدم يعدل مراجعته فقط

---

### 🔹 Permission في ViewSet

```python
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]
```

**التطبيق:**
1. `IsAuthenticatedOrReadOnly`: يجب تسجيل الدخول للكتابة
2. `IsSellerOrReadOnly`: فقط البائع يعدل منتجه

**مثال:**
- User A ينشئ Product
- User B يحاول يعدله → **403 Forbidden** ❌
- User A يعدله → **200 OK** ✅

---

## 6. URLs - المسارات {#urls}

### 📁 الملف: `marketplace/urls.py`

```python
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
```

### **Router يولد تلقائياً:**

```
products/ → list, create
products/{id}/ → retrieve, update, destroy
products/my_products/ → custom action
products/{id}/toggle_favorite/ → custom action
```

---

## 7. Settings Configuration {#settings}

### 📁 الملف: `jaddid/settings.py`

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    'accounts',
    'marketplace',  # ← التطبيق الجديد
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
}
```

---

## 🎯 الخلاصة - Summary

### ما تم بناؤه:

1. **8 Models** مع علاقات معقدة
2. **10 Serializers** مع تحسينات الأداء
3. **7 ViewSets** مع 40+ endpoint
4. **3 Custom Permissions** للأمان
5. **8 Admin Classes** مع inline editing
6. **URL Routing** مع Router
7. **Settings Configuration** كامل

### المفاهيم المستخدمة:

✅ UUID Primary Keys
✅ Foreign Keys (One-to-Many)
✅ Self-Referential Relations
✅ Unique Together Constraints
✅ Database Indexes
✅ Validators (Min/Max)
✅ Override save()
✅ Serializer Methods
✅ Nested Serializers
✅ Transaction Atomic
✅ Custom Actions
✅ Permission Classes
✅ Query Filtering
✅ Pagination
✅ Admin Customization

---

**هذا شرح تفصيلي لكل سطر كود تقريباً! 🚀**
