from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Material, MaterialListing, MaterialImage,
    Product, ProductImage, Cart, CartItem, Favorite,
    Order, Review, Message, Report
)


class MaterialImageInline(admin.TabularInline):
    """Inline admin for material listing images"""
    model = MaterialImage
    extra = 1
    fields = ['image', 'is_primary', 'order']


class ProductImageInline(admin.TabularInline):
    """Inline admin for product images"""
    model = ProductImage
    extra = 1
    fields = ['image', 'is_primary', 'order']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin for Category model"""
    list_display = ['name', 'name_ar', 'parent', 'is_active', 'product_count', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'name_ar', 'description']
    ordering = ['name']
    list_per_page = 50
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'name_ar', 'description', 'icon', 'parent')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def product_count(self, obj):
        return obj.products.filter(status='active').count()
    product_count.short_description = 'Active Products'


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    """Admin for Material (Master Data) model"""
    list_display = ['name', 'name_ar', 'category', 'default_unit', 'is_active', 'listing_count', 'created_at']
    list_filter = ['is_active', 'category', 'created_at']
    search_fields = ['name', 'name_ar', 'description']
    ordering = ['name']
    list_per_page = 50
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'name_ar', 'description', 'description_ar', 'icon')
        }),
        ('Category & Unit', {
            'fields': ('category', 'default_unit')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def listing_count(self, obj):
        return obj.listings.filter(status='active').count()
    listing_count.short_description = 'Active Listings'


@admin.register(MaterialListing)
class MaterialListingAdmin(admin.ModelAdmin):
    """Admin for Material Listing model"""
    list_display = [
        'title', 'material', 'seller_info', 'quantity', 'unit',
        'price_per_unit', 'total_price_display', 'condition', 'status',
        'views_count', 'favorites_count', 'created_at'
    ]
    list_filter = [
        'status', 'condition', 'material', 'created_at', 'published_at'
    ]
    search_fields = ['title', 'title_ar', 'description', 'location', 'seller__email', 'material__name']
    ordering = ['-created_at']
    list_per_page = 50
    inlines = [MaterialImageInline]
    readonly_fields = ['total_price', 'views_count', 'favorites_count', 'created_at', 'updated_at', 'published_at']
    
    fieldsets = (
        ('Seller Information', {
            'fields': ('seller',)
        }),
        ('Material Information', {
            'fields': (
                'material', 'title', 'title_ar', 'description', 'description_ar'
            )
        }),
        ('Quantity & Pricing', {
            'fields': ('quantity', 'unit', 'price_per_unit', 'total_price', 'minimum_order_quantity')
        }),
        ('Details', {
            'fields': ('condition', 'status')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Availability', {
            'fields': ('available_from', 'available_until', 'notes')
        }),
        ('Metrics', {
            'fields': ('views_count', 'favorites_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def seller_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.seller.id,
            obj.seller.email
        )
    seller_info.short_description = 'Seller'
    
    def total_price_display(self, obj):
        return f'{obj.total_price:.2f}'
    total_price_display.short_description = 'Total Price'
    
    actions = ['make_active', 'make_draft', 'make_sold']
    
    def make_active(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} listings marked as active.')
    make_active.short_description = 'Mark selected listings as active'
    
    def make_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} listings marked as draft.')
    make_draft.short_description = 'Mark selected listings as draft'
    
    def make_sold(self, request, queryset):
        updated = queryset.update(status='sold')
        self.message_user(request, f'{updated} listings marked as sold.')
    make_sold.short_description = 'Mark selected listings as sold'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin for Product model"""
    list_display = [
        'title', 'seller_info', 'category', 'price', 'quantity',
        'condition', 'status', 'views_count', 'favorites_count', 'created_at'
    ]
    list_filter = [
        'status', 'condition', 'category', 'created_at', 'published_at'
    ]
    search_fields = ['title', 'title_ar', 'description', 'location', 'seller__email']
    ordering = ['-created_at']
    list_per_page = 50
    inlines = [ProductImageInline]
    readonly_fields = ['views_count', 'favorites_count', 'created_at', 'updated_at', 'published_at']
    
    fieldsets = (
        ('Seller Information', {
            'fields': ('seller',)
        }),
        ('Product Information', {
            'fields': (
                'category', 'title', 'title_ar', 'description', 'description_ar'
            )
        }),
        ('Pricing & Quantity', {
            'fields': ('price', 'quantity')
        }),
        ('Details', {
            'fields': ('condition', 'status')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Metrics', {
            'fields': ('views_count', 'favorites_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def seller_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.seller.id,
            obj.seller.email
        )
    seller_info.short_description = 'Seller'
    
    actions = ['make_active', 'make_draft', 'make_sold']
    
    def make_active(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} products marked as active.')
    make_active.short_description = 'Mark selected products as active'
    
    def make_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} products marked as draft.')
    make_draft.short_description = 'Mark selected products as draft'
    
    def make_sold(self, request, queryset):
        updated = queryset.update(status='sold')
        self.message_user(request, f'{updated} products marked as sold.')
    make_sold.short_description = 'Mark selected products as sold'


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin for ProductImage model"""
    list_display = ['product', 'is_primary', 'order', 'image_preview', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__title']
    ordering = ['product', 'order']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Preview'


class CartItemInline(admin.TabularInline):
    """Inline admin for cart items"""
    model = CartItem
    extra = 0
    fields = ['item_display', 'quantity', 'unit_price_display', 'subtotal_display']
    readonly_fields = ['item_display', 'unit_price_display', 'subtotal_display']
    can_delete = True
    
    def item_display(self, obj):
        """Display the cart item"""
        if obj.product:
            return format_html(
                '📦 <a href="/admin/marketplace/product/{}/change/">{}</a>',
                obj.product.id,
                obj.product.title
            )
        elif obj.material_listing:
            return format_html(
                '🧱 <a href="/admin/marketplace/materiallisting/{}/change/">{}</a>',
                obj.material_listing.id,
                obj.material_listing.material.name
            )
        return '-'
    item_display.short_description = 'Item'
    
    def unit_price_display(self, obj):
        return f'{obj.unit_price:.2f}'
    unit_price_display.short_description = 'Unit Price'
    
    def subtotal_display(self, obj):
        return f'{obj.subtotal:.2f}'
    subtotal_display.short_description = 'Subtotal'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin for Cart model"""
    list_display = ['user_info', 'total_items_display', 'total_price_display', 'updated_at', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    ordering = ['-updated_at']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CartItemInline]
    
    fieldsets = (
        ('Cart Information', {
            'fields': ('user',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.user.id,
            obj.user.email
        )
    user_info.short_description = 'User'
    
    def total_items_display(self, obj):
        return obj.total_items
    total_items_display.short_description = 'Total Items'
    
    def total_price_display(self, obj):
        return f'{obj.total_price:.2f}'
    total_price_display.short_description = 'Total Price'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin for CartItem model"""
    list_display = ['cart_user', 'item_type_display', 'item_display', 'quantity', 'unit_price_display', 'subtotal_display', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = [
        'cart__user__email', 'product__title',
        'material_listing__material__name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['unit_price_display', 'subtotal_display', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Cart', {
            'fields': ('cart',)
        }),
        ('Item', {
            'fields': ('product', 'material_listing'),
            'description': 'Select either a product OR a material listing (not both).'
        }),
        ('Quantity', {
            'fields': ('quantity',)
        }),
        ('Pricing', {
            'fields': ('unit_price_display', 'subtotal_display'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cart_user(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.cart.user.id,
            obj.cart.user.email
        )
    cart_user.short_description = 'User'
    
    def item_type_display(self, obj):
        """Display item type"""
        if obj.product:
            return format_html('<span style="color: #28a745;">📦 Product</span>')
        elif obj.material_listing:
            return format_html('<span style="color: #fd7e14;">🧱 Material</span>')
        return '-'
    item_type_display.short_description = 'Type'
    
    def item_display(self, obj):
        """Display the cart item"""
        if obj.product:
            return format_html(
                '<a href="/admin/marketplace/product/{}/change/">{}</a>',
                obj.product.id,
                obj.product.title
            )
        elif obj.material_listing:
            return format_html(
                '<a href="/admin/marketplace/materiallisting/{}/change/">{}</a>',
                obj.material_listing.id,
                obj.material_listing.material.name
            )
        return '-'
    item_display.short_description = 'Item'
    
    def unit_price_display(self, obj):
        return f'{obj.unit_price:.2f}'
    unit_price_display.short_description = 'Unit Price'
    
    def subtotal_display(self, obj):
        return f'{obj.subtotal:.2f}'
    subtotal_display.short_description = 'Subtotal'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    """Admin for Favorite model"""
    list_display = ['user_info', 'item_type_display', 'item_display', 'created_at']
    list_filter = ['created_at']
    search_fields = [
        'user__email', 'product__title', 
        'material_listing__material__name_en'
    ]
    ordering = ['-created_at']
    
    def user_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.user.id,
            obj.user.email
        )
    user_info.short_description = 'User'
    
    def item_type_display(self, obj):
        """Display favorite type"""
        if obj.product:
            return format_html('<span style="color: #28a745;">📦 Product</span>')
        elif obj.material_listing:
            return format_html('<span style="color: #fd7e14;">🧱 Material</span>')
        return '-'
    item_type_display.short_description = 'Type'
    
    def item_display(self, obj):
        """Display the favorited item"""
        if obj.product:
            return format_html(
                '<a href="/admin/marketplace/product/{}/change/">{}</a>',
                obj.product.id,
                obj.product.title
            )
        elif obj.material_listing:
            return format_html(
                '<a href="/admin/marketplace/materiallisting/{}/change/">{}</a>',
                obj.material_listing.id,
                obj.material_listing.material.name_en
            )
        return '-'
    item_display.short_description = 'Item'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin for Order model"""
    list_display = [
        'order_number', 'buyer_info', 'seller_info', 'order_type_display',
        'item_display', 'quantity', 'total_price', 'status', 
        'payment_status', 'created_at'
    ]
    list_filter = [
        'order_type', 'status', 'payment_status', 'created_at', 
        'confirmed_at', 'completed_at'
    ]
    search_fields = [
        'order_number', 'buyer__email', 'seller__email', 
        'product__title', 'material_listing__material__name_en'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'order_number', 'order_type', 'total_price', 'created_at', 
        'updated_at', 'confirmed_at', 'completed_at'
    ]
    
    fieldsets = (
        ('Order Type', {
            'fields': ('order_type',),
            'description': 'This field is automatically set based on whether a product or material is selected.'
        }),
        ('Order Information', {
            'fields': ('order_number', 'buyer', 'seller')
        }),
        ('Item Information', {
            'fields': ('product', 'material_listing'),
            'description': 'Select either a product OR a material listing (not both).'
        }),
        ('Order Details', {
            'fields': ('quantity', 'unit_price', 'total_price')
        }),
        ('Status', {
            'fields': ('status', 'payment_status')
        }),
        ('Additional Information', {
            'fields': ('notes', 'delivery_address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def buyer_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.buyer.id,
            obj.buyer.email
        )
    buyer_info.short_description = 'Buyer'
    
    def seller_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.seller.id,
            obj.seller.email
        )
    seller_info.short_description = 'Seller'
    
    def order_type_display(self, obj):
        """Display order type with visual indicator"""
        if obj.order_type == 'product':
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; '
                'border-radius: 3px; font-weight: bold;">📦 PRODUCT</span>'
            )
        elif obj.order_type == 'material':
            return format_html(
                '<span style="background-color: #fd7e14; color: white; padding: 3px 8px; '
                'border-radius: 3px; font-weight: bold;">🧱 MATERIAL</span>'
            )
        return '-'
    order_type_display.short_description = 'Order Type'
    
    def item_display(self, obj):
        """Display the item (product or material) with link"""
        if obj.product:
            return format_html(
                '<a href="/admin/marketplace/product/{}/change/">{}</a>',
                obj.product.id,
                obj.product.title
            )
        elif obj.material_listing:
            return format_html(
                '<a href="/admin/marketplace/materiallisting/{}/change/">{} ({})</a>',
                obj.material_listing.id,
                obj.material_listing.material.name_en,
                obj.material_listing.get_condition_display()
            )
        return '-'
    item_display.short_description = 'Item'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin for Review model"""
    list_display = [
        'item_type_display', 'item_display', 'reviewer_info', 'rating', 
        'is_verified_purchase', 'is_approved', 'created_at'
    ]
    list_filter = [
        'rating', 'is_verified_purchase', 'is_approved', 'created_at'
    ]
    search_fields = [
        'product__title', 'material_listing__material__name_en',
        'reviewer__email', 'title', 'comment'
    ]
    ordering = ['-created_at']
    readonly_fields = ['is_verified_purchase', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Review Item', {
            'fields': ('product', 'material_listing'),
            'description': 'Select either a product OR a material listing (not both).'
        }),
        ('Review Information', {
            'fields': ('reviewer', 'order')
        }),
        ('Review Content', {
            'fields': ('rating', 'title', 'comment')
        }),
        ('Status', {
            'fields': ('is_verified_purchase', 'is_approved')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def item_type_display(self, obj):
        """Display review type"""
        if obj.product:
            return format_html('<span style="color: #28a745;">📦 Product</span>')
        elif obj.material_listing:
            return format_html('<span style="color: #fd7e14;">🧱 Material</span>')
        return '-'
    item_type_display.short_description = 'Type'
    
    def item_display(self, obj):
        """Display the reviewed item"""
        if obj.product:
            return format_html(
                '<a href="/admin/marketplace/product/{}/change/">{}</a>',
                obj.product.id,
                obj.product.title
            )
        elif obj.material_listing:
            return format_html(
                '<a href="/admin/marketplace/materiallisting/{}/change/">{}</a>',
                obj.material_listing.id,
                obj.material_listing.material.name_en
            )
        return '-'
    item_display.short_description = 'Item'
    
    def reviewer_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.reviewer.id,
            obj.reviewer.email
        )
    reviewer_info.short_description = 'Reviewer'
    
    actions = ['approve_reviews', 'disapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} reviews approved.')
    approve_reviews.short_description = 'Approve selected reviews'
    
    def disapprove_reviews(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} reviews disapproved.')
    disapprove_reviews.short_description = 'Disapprove selected reviews'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin for Message model"""
    list_display = [
        'sender_info', 'recipient_info', 'item_type_display', 
        'item_display', 'subject', 'is_read', 'created_at'
    ]
    list_filter = ['is_read', 'created_at']
    search_fields = [
        'sender__email', 'recipient__email', 
        'subject', 'message', 'product__title',
        'material_listing__material__name_en'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Related Item', {
            'fields': ('product', 'material_listing'),
            'description': 'Select either a product OR a material listing (not both).'
        }),
        ('Message Information', {
            'fields': ('sender', 'recipient')
        }),
        ('Content', {
            'fields': ('subject', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    def sender_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.sender.id,
            obj.sender.email
        )
    sender_info.short_description = 'Sender'
    
    def recipient_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.recipient.id,
            obj.recipient.email
        )
    recipient_info.short_description = 'Recipient'
    
    def item_type_display(self, obj):
        """Display message item type"""
        if obj.product:
            return format_html('<span style="color: #28a745;">📦 Product</span>')
        elif obj.material_listing:
            return format_html('<span style="color: #fd7e14;">🧱 Material</span>')
        return '-'
    item_type_display.short_description = 'Type'
    
    def item_display(self, obj):
        """Display the message item"""
        if obj.product:
            return format_html(
                '<a href="/admin/marketplace/product/{}/change/">{}</a>',
                obj.product.id,
                obj.product.title
            )
        elif obj.material_listing:
            return format_html(
                '<a href="/admin/marketplace/materiallisting/{}/change/">{}</a>',
                obj.material_listing.id,
                obj.material_listing.material.name_en
            )
        return '-'
    item_display.short_description = 'Item'


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin for Report model"""
    list_display = [
        'reporter_info', 'item_type_display', 'item_display', 'reason', 
        'status', 'created_at', 'resolved_at'
    ]
    list_filter = ['status', 'reason', 'created_at', 'resolved_at']
    search_fields = [
        'reporter__email', 'product__title', 
        'material_listing__material__name_en',
        'description', 'admin_notes'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']
    
    fieldsets = (
        ('Reported Item', {
            'fields': ('product', 'material_listing'),
            'description': 'Select either a product OR a material listing (not both).'
        }),
        ('Report Information', {
            'fields': ('reporter',)
        }),
        ('Report Details', {
            'fields': ('reason', 'description', 'status')
        }),
        ('Admin Response', {
            'fields': ('admin_notes', 'resolved_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    
    def reporter_info(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.reporter.id,
            obj.reporter.email
        )
    reporter_info.short_description = 'Reporter'
    
    def item_type_display(self, obj):
        """Display reported item type"""
        if obj.product:
            return format_html('<span style="color: #28a745;">📦 Product</span>')
        elif obj.material_listing:
            return format_html('<span style="color: #fd7e14;">🧱 Material</span>')
        return '-'
    item_type_display.short_description = 'Type'
    
    def item_display(self, obj):
        """Display the reported item"""
        if obj.product:
            return format_html(
                '<a href="/admin/marketplace/product/{}/change/">{}</a>',
                obj.product.id,
                obj.product.title
            )
        elif obj.material_listing:
            return format_html(
                '<a href="/admin/marketplace/materiallisting/{}/change/">{}</a>',
                obj.material_listing.id,
                obj.material_listing.material.name_en
            )
        return '-'
    item_display.short_description = 'Item'
    
    actions = ['mark_reviewing', 'mark_resolved', 'mark_dismissed']
    
    def mark_reviewing(self, request, queryset):
        updated = queryset.update(status='reviewing')
        self.message_user(request, f'{updated} reports marked as reviewing.')
    mark_reviewing.short_description = 'Mark as reviewing'
    
    def mark_resolved(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            status='resolved',
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(request, f'{updated} reports marked as resolved.')
    mark_resolved.short_description = 'Mark as resolved'
    
    def mark_dismissed(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            status='dismissed',
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(request, f'{updated} reports marked as dismissed.')
    mark_dismissed.short_description = 'Mark as dismissed'
