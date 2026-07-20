from rest_framework import serializers
from django.db import transaction
from .models import (
    Category, Material, MaterialListing, MaterialImage,
    Product, ProductImage, Cart, CartItem, Favorite,
    Order, Review, Message, Report
)
from accounts.models import User


class CategorySerializer(serializers.ModelSerializer):
    """Category Serializer"""
    
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
    
    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return CategorySerializer(
                obj.subcategories.filter(is_active=True), 
                many=True, 
                context=self.context
            ).data
        return []
    
    def get_product_count(self, obj):
        return obj.products.filter(status='active').count()


class MaterialSerializer(serializers.ModelSerializer):
    """Material (Master Data) Serializer"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    listing_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = [
            'id', 'name', 'name_ar', 'description', 'description_ar',
            'category', 'category_name', 'default_unit', 'icon',
            'is_active', 'listing_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_listing_count(self, obj):
        return obj.listings.filter(status='active').count()


class MaterialImageSerializer(serializers.ModelSerializer):
    """Material Listing Image Serializer"""
    
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = MaterialImage
        fields = ['id', 'image', 'is_primary', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class MaterialListingListSerializer(serializers.ModelSerializer):
    """Material Listing List Serializer - Lightweight for list views"""
    seller = serializers.ReadOnlyField(source='seller.id')
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_name_ar = serializers.CharField(source='material.name_ar', read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = MaterialListing
        fields = [
            'id', 'material', 'material_name', 'material_name_ar',
            'title', 'title_ar', 'quantity', 'unit', 'price_per_unit',
            'total_price', 'minimum_order_quantity', 'condition', 'status',
            'location', 'seller_name', 'seller_email', 'primary_image',
            'views_count', 'favorites_count', 'is_favorited',
            'available_from', 'available_until', 'created_at', 'published_at', 'seller'
        ]
        read_only_fields = ['id', 'views_count', 'favorites_count', 'created_at', 'published_at']
    
    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
        return None
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class MaterialListingDetailSerializer(serializers.ModelSerializer):
    """Material Listing Detail Serializer - Complete information"""
    
    seller = serializers.SerializerMethodField()
    seller_id = serializers.UUIDField(source='seller.id', read_only=True) 
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    material = MaterialSerializer(read_only=True)
    images = MaterialImageSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = MaterialListing
        fields = [
            'id', 'seller','seller_id', 'seller_name', 'material', 'title', 'title_ar',
            'description', 'description_ar', 'quantity', 'unit',
            'price_per_unit', 'total_price', 'minimum_order_quantity',
            'condition', 'status', 'location', 'latitude', 'longitude',
            'available_from', 'available_until', 'notes', 'images',
            'views_count', 'favorites_count', 'is_favorited',
            'average_rating', 'review_count', 'created_at', 'updated_at',
            'published_at'
        ]
        read_only_fields = [
            'id', 'views_count', 'favorites_count',
            'created_at', 'updated_at', 'published_at'
        ]
    
    def get_seller(self, obj):
        return {
            'id': str(obj.seller.id),
            'name': obj.seller.get_full_name(),
            'email': obj.seller.email,
            'role': obj.seller.role
        }
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 0.0
    
    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class MaterialListingCreateUpdateSerializer(serializers.ModelSerializer):
    """Material Listing Create/Update Serializer"""
    
    images = MaterialImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = MaterialListing
        fields = [
            'id', 'material', 'title', 'title_ar', 'description',
            'description_ar', 'quantity', 'unit', 'price_per_unit',
            'minimum_order_quantity', 'condition', 'status', 'location',
            'latitude', 'longitude', 'available_from', 'available_until',
            'notes', 'images', 'uploaded_images'
        ]
        read_only_fields = ['id']
    
    @transaction.atomic
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        validated_data['seller'] = self.context['request'].user
        
        # Set default unit from material if not provided
        if 'unit' not in validated_data:
            material = validated_data.get('material')
            if material:
                validated_data['unit'] = material.default_unit
        
        material_listing = MaterialListing.objects.create(**validated_data)
        
        # Create material listing images
        for idx, image in enumerate(uploaded_images):
            MaterialImage.objects.create(
                material_listing=material_listing,
                image=image,
                is_primary=(idx == 0),
                order=idx
            )
        
        return material_listing
    
    @transaction.atomic
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update material listing fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images if provided
        if uploaded_images:
            current_count = instance.images.count()
            for idx, image in enumerate(uploaded_images):
                MaterialImage.objects.create(
                    material_listing=instance,
                    image=image,
                    is_primary=(current_count == 0 and idx == 0),
                    order=current_count + idx
                )
        
        return instance


class ProductImageSerializer(serializers.ModelSerializer):
    """Product Image Serializer"""
    
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductListSerializer(serializers.ModelSerializer):
    """Product List Serializer - Lightweight for list views"""
    
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_id = serializers.UUIDField(source='seller.id', read_only=True)
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'title_ar', 'price', 'quantity',
            'condition', 'status', 'location','seller', 'seller_id', 'seller_name', 
            'seller_email', 'category_name', 'primary_image',
            'views_count', 'favorites_count', 'is_favorited',
            'created_at', 'published_at'
        ]
        read_only_fields = ['id', 'views_count', 'favorites_count', 'created_at', 'published_at']
    
    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
        return None
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class ProductDetailSerializer(serializers.ModelSerializer):
    """Product Detail Serializer - Complete information"""
    
    seller = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'category', 'title', 'title_ar',
            'description', 'description_ar', 'price', 'quantity',
            'condition', 'status', 'location', 'latitude',
            'longitude', 'images', 'views_count', 'favorites_count',
            'is_favorited', 'average_rating', 'review_count',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = [
            'id', 'views_count', 'favorites_count', 
            'created_at', 'updated_at', 'published_at'
        ]
    
    def get_seller(self, obj):
        return {
            'id': str(obj.seller.id),
            'name': obj.seller.get_full_name(),
            'email': obj.seller.email,
            'role': obj.seller.role
        }
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 0.0
    
    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Product Create/Update Serializer"""
    
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'title', 'title_ar', 'description',
            'description_ar', 'price', 'quantity', 'condition',
            'status', 'location', 'latitude', 'longitude', 'images',
            'uploaded_images'
        ]
        read_only_fields = ['id']
    
    @transaction.atomic
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        validated_data['seller'] = self.context['request'].user

        # New products should be published immediately so they appear in the public marketplace.
        # This avoids creating invisible draft listings when the client submits a draft state.
        validated_data['status'] = Product.ACTIVE

        product = Product.objects.create(**validated_data)
        
        # Create product images
        for idx, image in enumerate(uploaded_images):
            ProductImage.objects.create(
                product=product,
                image=image,
                is_primary=(idx == 0),
                order=idx
            )
        
        return product
    
    @transaction.atomic
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images if provided
        if uploaded_images:
            current_count = instance.images.count()
            for idx, image in enumerate(uploaded_images):
                ProductImage.objects.create(
                    product=instance,
                    image=image,
                    is_primary=(current_count == 0 and idx == 0),
                    order=current_count + idx
                )
        
        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    """Favorite Serializer - Supports both Products and Material Listings"""
    
    product = ProductListSerializer(read_only=True)
    material_listing = MaterialListingListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True, required=False)
    material_listing_id = serializers.UUIDField(write_only=True, required=False)
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Favorite
        fields = [
            'id', 'user', 'product', 'product_id', 
            'material_listing', 'material_listing_id',
            'item_type', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_item_type(self, obj):
        if obj.product:
            return 'product'
        elif obj.material_listing:
            return 'material'
        return None
    
    def validate(self, attrs):
        product_id = attrs.get('product_id')
        material_listing_id = attrs.get('material_listing_id')
        
        # Ensure exactly one is provided
        if not product_id and not material_listing_id:
            raise serializers.ValidationError(
                "Either product_id or material_listing_id must be provided"
            )
        if product_id and material_listing_id:
            raise serializers.ValidationError(
                "Cannot favorite both product and material listing at the same time"
            )
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        
        product_id = validated_data.pop('product_id', None)
        material_listing_id = validated_data.pop('material_listing_id', None)
        
        if product_id:
            validated_data['product'] = Product.objects.get(id=product_id)
        if material_listing_id:
            validated_data['material_listing'] = MaterialListing.objects.get(id=material_listing_id)
        
        return super().create(validated_data)


class CartItemSerializer(serializers.ModelSerializer):
    """Cart Item Serializer - Supports both Products and Material Listings"""
    
    product_id = serializers.UUIDField(write_only=True, required=False)
    material_listing_id = serializers.UUIDField(write_only=True, required=False)
    product = ProductListSerializer(read_only=True)
    material_listing = MaterialListingListSerializer(read_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'cart', 'product', 'product_id', 'material_listing', 
            'material_listing_id', 'quantity', 'unit_price', 'subtotal',
            'item_type', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'cart', 'created_at', 'updated_at']
    
    def get_item_type(self, obj):
        """Return the type of item (product or material)"""
        if obj.product:
            return 'product'
        elif obj.material_listing:
            return 'material'
        return None
    
    def validate(self, data):
        """Validate that either product or material is provided, not both"""
        product_id = data.get('product_id')
        material_listing_id = data.get('material_listing_id')
        
        if not product_id and not material_listing_id:
            raise serializers.ValidationError(
                "Either product_id or material_listing_id must be provided"
            )
        
        if product_id and material_listing_id:
            raise serializers.ValidationError(
                "Cannot add both product and material to cart at the same time"
            )
        
        # Validate product availability
        if product_id:
            try:
                product = Product.objects.get(id=product_id)
                if product.status != 'active':
                    raise serializers.ValidationError(
                        f"Product is not available (status: {product.status})"
                    )
                if product.quantity < data.get('quantity', 1):
                    raise serializers.ValidationError(
                        f"Only {product.quantity} units available"
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError("Product not found")
        
        # Validate material listing availability
        if material_listing_id:
            try:
                material = MaterialListing.objects.get(id=material_listing_id)
                if material.status != 'active':
                    raise serializers.ValidationError(
                        f"Material listing is not available (status: {material.status})"
                    )
                if material.quantity < data.get('quantity', 1):
                    raise serializers.ValidationError(
                        f"Only {material.quantity} units available"
                    )
            except MaterialListing.DoesNotExist:
                raise serializers.ValidationError("Material listing not found")
        
        return data
    
    def create(self, validated_data):
        """Create cart item and link to product or material"""
        product_id = validated_data.pop('product_id', None)
        material_listing_id = validated_data.pop('material_listing_id', None)
        
        if product_id:
            validated_data['product'] = Product.objects.get(id=product_id)
        if material_listing_id:
            validated_data['material_listing'] = MaterialListing.objects.get(id=material_listing_id)
        
        return super().create(validated_data)


class CartSerializer(serializers.ModelSerializer):
    """Cart Serializer"""
    
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id', 'user', 'user_email', 'items', 'total_items',
            'total_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    """Order Serializer - Supports both Products and Material Listings"""
    
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True, required=False)
    material_title = serializers.SerializerMethodField()
    product_id = serializers.UUIDField(write_only=True, required=False)
    material_listing_id = serializers.UUIDField(write_only=True, required=False)
    item_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'order_type', 'buyer', 'buyer_name',
            'seller', 'seller_name', 'product', 'product_id', 'product_title',
            'material_listing', 'material_listing_id', 'material_title',
            'quantity', 'unit', 'unit_price', 'total_price', 'status',
            'payment_status', 'notes', 'delivery_address', 'item_details',
            'created_at', 'updated_at', 'confirmed_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'buyer', 'seller', 'total_price',
            'created_at', 'updated_at', 'confirmed_at', 'completed_at'
        ]
    
    def get_material_title(self, obj):
        if obj.material_listing:
            return obj.material_listing.title
        return None
    
    def get_item_details(self, obj):
        if obj.order_type == 'product' and obj.product:
            return {
                'type': 'product',
                'id': str(obj.product.id),
                'title': obj.product.title,
                'title_ar': obj.product.title_ar
            }
        elif obj.order_type == 'material' and obj.material_listing:
            return {
                'type': 'material',
                'id': str(obj.material_listing.id),
                'title': obj.material_listing.title,
                'title_ar': obj.material_listing.title_ar,
                'material_name': obj.material_listing.material.name
            }
        return None
    
    def validate(self, attrs):
        product_id = attrs.get('product_id')
        material_listing_id = attrs.get('material_listing_id')
        
        # Ensure exactly one is provided
        if not product_id and not material_listing_id:
            raise serializers.ValidationError(
                "Either product_id or material_listing_id must be provided"
            )
        if product_id and material_listing_id:
            raise serializers.ValidationError(
                "Cannot order both product and material listing at the same time"
            )
        
        return attrs
    
    def create(self, validated_data):
        request = self.context['request']
        product_id = validated_data.pop('product_id', None)
        material_listing_id = validated_data.pop('material_listing_id', None)
        
        if product_id:
            product = Product.objects.get(id=product_id)
            validated_data['product'] = product
            validated_data['seller'] = product.seller
            validated_data['order_type'] = Order.PRODUCT
            validated_data['unit_price'] = product.price
            if 'unit' not in validated_data:
                validated_data['unit'] = 'piece'  # Products are sold as pieces
        
        elif material_listing_id:
            material_listing = MaterialListing.objects.get(id=material_listing_id)
            validated_data['material_listing'] = material_listing
            validated_data['seller'] = material_listing.seller
            validated_data['order_type'] = Order.MATERIAL
            validated_data['unit_price'] = material_listing.price_per_unit
            if 'unit' not in validated_data:
                validated_data['unit'] = material_listing.unit
        
        validated_data['buyer'] = request.user
        
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    """Review Serializer - Supports both Products and Material Listings"""
    
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True, required=False)
    material_title = serializers.SerializerMethodField()
    product_id = serializers.UUIDField(write_only=True, required=False)
    material_listing_id = serializers.UUIDField(write_only=True, required=False)
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'product_id', 'product_title',
            'material_listing', 'material_listing_id', 'material_title',
            'item_type', 'reviewer', 'reviewer_name', 'order',
            'rating', 'title', 'comment', 'is_verified_purchase',
            'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reviewer', 'is_verified_purchase',
            'is_approved', 'created_at', 'updated_at'
        ]
        ref_name = "MarketplaceReview"
    
    def get_material_title(self, obj):
        if obj.material_listing:
            return obj.material_listing.title
        return None
    
    def get_item_type(self, obj):
        if obj.product:
            return 'product'
        elif obj.material_listing:
            return 'material'
        return None
    
    def validate(self, attrs):
        product_id = attrs.get('product_id')
        material_listing_id = attrs.get('material_listing_id')
        
        # Ensure exactly one is provided
        if not product_id and not material_listing_id:
            raise serializers.ValidationError(
                "Either product_id or material_listing_id must be provided"
            )
        if product_id and material_listing_id:
            raise serializers.ValidationError(
                "Cannot review both product and material listing"
            )
        
        return attrs
    
    def create(self, validated_data):
        request = self.context['request']
        product_id = validated_data.pop('product_id', None)
        material_listing_id = validated_data.pop('material_listing_id', None)
        
        if product_id:
            validated_data['product'] = Product.objects.get(id=product_id)
        if material_listing_id:
            validated_data['material_listing'] = MaterialListing.objects.get(id=material_listing_id)
        
        validated_data['reviewer'] = request.user
        
        # Check if this is a verified purchase
        if validated_data.get('order'):
            order = validated_data['order']
            if order.buyer == request.user and order.status == 'completed':
                validated_data['is_verified_purchase'] = True
        
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    """Message Serializer - Supports both Products and Material Listings"""
    
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True, required=False)
    material_title = serializers.SerializerMethodField()
    recipient_id = serializers.UUIDField(write_only=True, required=False)
    product_id = serializers.UUIDField(write_only=True, required=False)
    material_listing_id = serializers.UUIDField(write_only=True, required=False)
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'recipient', 'recipient_id',
            'recipient_name', 'product', 'product_id', 'product_title',
            'material_listing', 'material_listing_id', 'material_title',
            'item_type', 'subject', 'message', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'created_at']
    
    def get_material_title(self, obj):
        if obj.material_listing:
            return obj.material_listing.title
        return None
    
    def get_item_type(self, obj):
        if obj.product:
            return 'product'
        elif obj.material_listing:
            return 'material'
        return None
    
    def create(self, validated_data):
        request = self.context['request']
        recipient_id = validated_data.pop('recipient_id', None)
        product_id = validated_data.pop('product_id', None)
        material_listing_id = validated_data.pop('material_listing_id', None)
        
        if recipient_id:
            validated_data['recipient'] = User.objects.get(id=recipient_id)
        
        if product_id:
            validated_data['product'] = Product.objects.get(id=product_id)
        
        if material_listing_id:
            validated_data['material_listing'] = MaterialListing.objects.get(id=material_listing_id)
        
        validated_data['sender'] = request.user
        
        return super().create(validated_data)


class ReportSerializer(serializers.ModelSerializer):
    """Report Serializer - Supports both Products and Material Listings"""
    
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True, required=False)
    material_title = serializers.SerializerMethodField()
    product_id = serializers.UUIDField(write_only=True, required=False)
    material_listing_id = serializers.UUIDField(write_only=True, required=False)
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reporter_name', 'product', 'product_id',
            'product_title', 'material_listing', 'material_listing_id',
            'material_title', 'item_type', 'reason', 'description',
            'status', 'admin_notes', 'resolved_by', 'created_at',
            'updated_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'reporter', 'status', 'admin_notes',
            'resolved_by', 'created_at', 'updated_at', 'resolved_at'
        ]
    
    def get_material_title(self, obj):
        if obj.material_listing:
            return obj.material_listing.title
        return None
    
    def get_item_type(self, obj):
        if obj.product:
            return 'product'
        elif obj.material_listing:
            return 'material'
        return None
    
    def validate(self, attrs):
        product_id = attrs.get('product_id')
        material_listing_id = attrs.get('material_listing_id')
        
        # Ensure exactly one is provided
        if not product_id and not material_listing_id:
            raise serializers.ValidationError(
                "Either product_id or material_listing_id must be reported"
            )
        if product_id and material_listing_id:
            raise serializers.ValidationError(
                "Cannot report both product and material listing"
            )
        
        return attrs
    
    def create(self, validated_data):
        request = self.context['request']
        product_id = validated_data.pop('product_id', None)
        material_listing_id = validated_data.pop('material_listing_id', None)
        
        if product_id:
            validated_data['product'] = Product.objects.get(id=product_id)
        if material_listing_id:
            validated_data['material_listing'] = MaterialListing.objects.get(id=material_listing_id)
        
        validated_data['reporter'] = request.user
        
        return super().create(validated_data)
