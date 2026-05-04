import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from accounts.models import User


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

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name


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
    
    # Default unit options for this material
    default_unit = models.CharField(
        _("Default Unit"),
        max_length=50,
        default='kg',
        help_text=_("Common unit: kg, ton, bag, item, cubic meter, etc.")
    )
    
    # Material specifications
    icon = models.ImageField(
        _("Material Icon"), 
        upload_to="materials/%Y/%m/", 
        null=True, 
        blank=True
    )
    is_active = models.BooleanField(_("Active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Material")
        verbose_name_plural = _("Materials")
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category', 'is_active']),
        ]

    def __str__(self):
        return self.name


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
    is_active = models.BooleanField(default=True) 
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(_("Published At"), null=True, blank=True)

    class Meta:
        verbose_name = _("Material Listing")
        verbose_name_plural = _("Material Listings")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['material', 'status']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['-published_at']),
        ]

    def __str__(self):
        return f"{self.material.name} - {self.seller.email}"
    
    def save(self, *args, **kwargs):
        if self.status == self.ACTIVE and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
    
    def soft_delete(self):
        self.is_active = False
        self.save()
    
    @property
    def total_price(self):
        if self.quantity is None or getattr(self, "price", None) is None:
            return 0
        return self.quantity * self.price


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
    
    STATUS_CHOICES = [
        (DRAFT, _('Draft')),
        (ACTIVE, _('Active')),
        (SOLD, _('Sold')),
        (RESERVED, _('Reserved')),
        (DELETED, _('Deleted')),
    ]

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
        validators=[MinValueValidator(0)],
        help_text=_("Fixed price per item")
    )
    quantity = models.PositiveIntegerField(
        _("Quantity"),
        default=1,
        validators=[MinValueValidator(1)],
        help_text=_("Number of items available (stock)")
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
        default=ACTIVE
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

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['-published_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.seller.email}"
    
    def save(self, *args, **kwargs):
        if self.status == self.ACTIVE and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


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


class Cart(models.Model):
    """Shopping Cart Model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart',
        verbose_name=_("User")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Cart")
        verbose_name_plural = _("Carts")
        ordering = ['-updated_at']

    def __str__(self):
        return f"Cart for {self.user.email}"
    
    @property
    def total_items(self):
        """Get total number of items in cart"""
        return self.items.count()
    
    @property
    def total_price(self):
        """Calculate total price of all items in cart"""
        total = sum(item.subtotal for item in self.items.all())
        return total


class CartItem(models.Model):
    """Cart Item Model - Supports both Products and Material Listings"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_("Cart")
    )
    # Support for Products
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name=_("Product"),
        null=True,
        blank=True
    )
    # Support for Material Listings
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name=_("Material Listing"),
        null=True,
        blank=True
    )
    quantity = models.DecimalField(
        _("Quantity"),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Cart Item")
        verbose_name_plural = _("Cart Items")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['cart', '-created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, material_listing__isnull=True) |
                    models.Q(product__isnull=True, material_listing__isnull=False)
                ),
                name='cartitem_either_product_or_material'
            ),
            models.UniqueConstraint(
                fields=['cart', 'product'],
                condition=models.Q(product__isnull=False),
                name='unique_cart_product'
            ),
            models.UniqueConstraint(
                fields=['cart', 'material_listing'],
                condition=models.Q(material_listing__isnull=False),
                name='unique_cart_material'
            ),
        ]

    def __str__(self):
        if self.product:
            return f"{self.quantity} x {self.product.title}"
        elif self.material_listing:
            return f"{self.quantity} x {self.material_listing.material.name}"
        return f"Cart Item {self.id}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Ensure exactly one of product or material_listing is set
        if not self.product and not self.material_listing:
            raise ValidationError(_("Either product or material_listing must be set"))
        if self.product and self.material_listing:
            raise ValidationError(_("Cannot add both product and material_listing to cart"))
        
        # Validate quantity against available stock
        if self.product and self.quantity > self.product.quantity:
            raise ValidationError(_(f"Only {self.product.quantity} units available"))
        if self.material_listing and self.quantity > self.material_listing.quantity:
            raise ValidationError(_(f"Only {self.material_listing.quantity} units available"))
    
    @property
    def unit_price(self):
        """Get the unit price of the item"""
        if self.product:
            return self.product.price
        elif self.material_listing:
            return self.material_listing.price_per_unit
        return 0
    
    @property
    def subtotal(self):
        """Calculate subtotal for this cart item"""
        return float(self.quantity) * float(self.unit_price)
    
    @property
    def item(self):
        """Get the item (product or material)"""
        return self.product if self.product else self.material_listing


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
        verbose_name = _("Favorite")
        verbose_name_plural = _("Favorites")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
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

    def __str__(self):
        if self.product:
            return f"{self.user.email} - Product: {self.product.title}"
        elif self.material_listing:
            return f"{self.user.email} - Material: {self.material_listing.material.name}"
        return f"{self.user.email} - Favorite"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Ensure exactly one of product or material_listing is set
        if not self.product and not self.material_listing:
            raise ValidationError(_("Either product or material_listing must be set"))
        if self.product and self.material_listing:
            raise ValidationError(_("Cannot favorite both product and material_listing at the same time"))


class Order(models.Model):
    """Order/Purchase Model"""
    
    # Order Status Choices
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'
    
    STATUS_CHOICES = [
        (PENDING, _('Pending')),
        (CONFIRMED, _('Confirmed')),
        (IN_PROGRESS, _('In Progress')),
        (COMPLETED, _('Completed')),
        (CANCELLED, _('Cancelled')),
        (REFUNDED, _('Refunded')),
    ]
    
    # Payment Status
    UNPAID = 'unpaid'
    PAID = 'paid'
    PARTIAL = 'partial'
    
    PAYMENT_STATUS_CHOICES = [
        (UNPAID, _('Unpaid')),
        (PAID, _('Paid')),
        (PARTIAL, _('Partial')),
    ]

    # Order Type Choices
    PRODUCT = 'product'
    MATERIAL = 'material'
    
    ORDER_TYPE_CHOICES = [
        (PRODUCT, _('Product')),
        (MATERIAL, _('Material')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(
        _("Order Number"),
        max_length=50,
        unique=True,
        editable=False
    )
    order_type = models.CharField(
        _("Order Type"),
        max_length=20,
        choices=ORDER_TYPE_CHOICES,
        default=PRODUCT
    )
    buyer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='purchases',
        verbose_name=_("Buyer")
    )
    seller = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name=_("Seller")
    )
    # Support for Products
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name=_("Product"),
        null=True,
        blank=True
    )
    # Support for Material Listings
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name=_("Material Listing"),
        null=True,
        blank=True
    )
    
    # Order Details
    quantity = models.DecimalField(
        _("Quantity"),
        max_digits=10,
        decimal_places=2
    )
    unit = models.CharField(_("Unit"), max_length=50, default='piece')
    unit_price = models.DecimalField(
        _("Unit Price"),
        max_digits=10,
        decimal_places=2
    )
    total_price = models.DecimalField(
        _("Total Price"),
        max_digits=10,
        decimal_places=2
    )
    
    # Status
    status = models.CharField(
        _("Order Status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )
    payment_status = models.CharField(
        _("Payment Status"),
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=UNPAID
    )
    
    # Additional Information
    notes = models.TextField(_("Notes"), blank=True)
    delivery_address = models.TextField(_("Delivery Address"), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(_("Confirmed At"), null=True, blank=True)
    completed_at = models.DateTimeField(_("Completed At"), null=True, blank=True)

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', '-created_at']),
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['order_number']),
            models.Index(fields=['order_type', '-created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, material_listing__isnull=True, order_type='product') |
                    models.Q(product__isnull=True, material_listing__isnull=False, order_type='material')
                ),
                name='order_type_consistency'
            ),
        ]

    def __str__(self):
        return f"Order {self.order_number} ({self.get_order_type_display()})"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            prefix = 'PRD' if self.order_type == self.PRODUCT else 'MAT'
            self.order_number = f"{prefix}-{timestamp}-{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate total price
        self.total_price = float(self.quantity) * float(self.unit_price)
        
        super().save(*args, **kwargs)
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Ensure order type matches the item
        if self.order_type == self.PRODUCT and not self.product:
            raise ValidationError(_("Product order must have a product"))
        if self.order_type == self.MATERIAL and not self.material_listing:
            raise ValidationError(_("Material order must have a material listing"))
        if self.product and self.material_listing:
            raise ValidationError(_("Order cannot have both product and material listing"))
    
    @property
    def item(self):
        """Get the ordered item (product or material)"""
        return self.product if self.order_type == self.PRODUCT else self.material_listing


class Review(models.Model):
    """Review and Rating Model - Supports both Products and Material Listings"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Support for Products
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_("Product"),
        null=True,
        blank=True
    )
    # Support for Material Listings
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_("Material Listing"),
        null=True,
        blank=True
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_given',
        verbose_name=_("Reviewer")
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews',
        verbose_name=_("Order")
    )
    
    # Review Content
    rating = models.PositiveIntegerField(
        _("Rating"),
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(_("Review Title"), max_length=200, blank=True)
    comment = models.TextField(_("Comment"), blank=True)
    
    # Review Status
    is_verified_purchase = models.BooleanField(_("Verified Purchase"), default=False)
    is_approved = models.BooleanField(_("Approved"), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', '-created_at']),
            models.Index(fields=['material_listing', '-created_at']),
            models.Index(fields=['reviewer']),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, material_listing__isnull=True) |
                    models.Q(product__isnull=True, material_listing__isnull=False)
                ),
                name='review_either_product_or_material'
            ),
        ]

    def __str__(self):
        if self.product:
            return f"Review by {self.reviewer.email} for Product: {self.product.title}"
        elif self.material_listing:
            return f"Review by {self.reviewer.email} for Material: {self.material_listing.material.name}"
        return f"Review by {self.reviewer.email}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.product and not self.material_listing:
            raise ValidationError(_("Either product or material_listing must be set"))
        if self.product and self.material_listing:
            raise ValidationError(_("Cannot review both product and material_listing"))


class Message(models.Model):
    """Messaging System between Buyers and Sellers - Supports both Products and Materials"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_("Sender")
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        verbose_name=_("Recipient")
    )
    # Support for Products
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages',
        verbose_name=_("Product")
    )
    # Support for Material Listings
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages',
        verbose_name=_("Material Listing")
    )
    
    # Message Content
    subject = models.CharField(_("Subject"), max_length=200, blank=True)
    message = models.TextField(_("Message"))
    
    # Status
    is_read = models.BooleanField(_("Read"), default=False)
    read_at = models.DateTimeField(_("Read At"), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Message")
        verbose_name_plural = _("Messages")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['recipient', 'is_read', '-created_at']),
        ]

    def __str__(self):
        item_info = ""
        if self.product:
            item_info = f" (Product: {self.product.title})"
        elif self.material_listing:
            item_info = f" (Material: {self.material_listing.material.name})"
        return f"Message from {self.sender.email} to {self.recipient.email}{item_info}"


class Report(models.Model):
    """Report Model for flagging inappropriate content - Supports both Products and Materials"""
    
    # Report Reasons
    SPAM = 'spam'
    INAPPROPRIATE = 'inappropriate'
    FRAUD = 'fraud'
    DUPLICATE = 'duplicate'
    OTHER = 'other'
    
    REASON_CHOICES = [
        (SPAM, _('Spam')),
        (INAPPROPRIATE, _('Inappropriate Content')),
        (FRAUD, _('Fraud/Scam')),
        (DUPLICATE, _('Duplicate Listing')),
        (OTHER, _('Other')),
    ]
    
    # Report Status
    PENDING = 'pending'
    REVIEWING = 'reviewing'
    RESOLVED = 'resolved'
    DISMISSED = 'dismissed'
    
    STATUS_CHOICES = [
        (PENDING, _('Pending')),
        (REVIEWING, _('Reviewing')),
        (RESOLVED, _('Resolved')),
        (DISMISSED, _('Dismissed')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reports_made',
        verbose_name=_("Reporter")
    )
    # Support for Products
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name=_("Product"),
        null=True,
        blank=True
    )
    # Support for Material Listings
    material_listing = models.ForeignKey(
        MaterialListing,
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name=_("Material Listing"),
        null=True,
        blank=True
    )
    
    # Report Details
    reason = models.CharField(
        _("Reason"),
        max_length=20,
        choices=REASON_CHOICES
    )
    description = models.TextField(_("Description"))
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )
    
    # Admin Response
    admin_notes = models.TextField(_("Admin Notes"), blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_resolved',
        verbose_name=_("Resolved By")
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(_("Resolved At"), null=True, blank=True)

    class Meta:
        verbose_name = _("Report")
        verbose_name_plural = _("Reports")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['product']),
            models.Index(fields=['material_listing']),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, material_listing__isnull=True) |
                    models.Q(product__isnull=True, material_listing__isnull=False)
                ),
                name='report_either_product_or_material'
            ),
        ]

    def __str__(self):
        if self.product:
            return f"Report by {self.reporter.email} on Product: {self.product.title}"
        elif self.material_listing:
            return f"Report by {self.reporter.email} on Material: {self.material_listing.material.name}"
        return f"Report by {self.reporter.email}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.product and not self.material_listing:
            raise ValidationError(_("Either product or material_listing must be reported"))
        if self.product and self.material_listing:
            raise ValidationError(_("Cannot report both product and material_listing"))
