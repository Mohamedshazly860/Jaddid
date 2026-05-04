from pkg_resources import require
from rest_framework import serializers

from logistics.models import Courier, CourierAssignment
from logistics.serializers import CourierSerializer
from .models import Order, OrderItem, OrderStatusTracking
from marketplace.models import Product, MaterialListing
from django.db import transaction
from accounts.models import User
class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', required=False, allow_null=True)
    material_listing_id = serializers.PrimaryKeyRelatedField(queryset=MaterialListing.objects.all(), source='material_listing', required=False, allow_null=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    material_name = serializers.CharField(source='material_listing.material.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'material_listing', 'quantity', 'unit_price', 'product_title', 'material_name', 'product_id', 'material_listing_id']
        read_only_fields = ['unit_price', 'product_title', 'material_name', 'order']

    def validate(self, data):
        product = data.get('product')
        listing = data.get('material_listing')
        if (product and listing) or (not product and not listing):
            raise serializers.ValidationError("Each item must have either product or material_listing, not both or none.")

        order = self.context.get('order')
        if order:
            if order.order_type == Order.PRODUCT and listing:
                raise serializers.ValidationError("Product order cannot have a material listing item.")
            if order.order_type == Order.MATERIAL and product:
                raise serializers.ValidationError("Material order cannot have a product item.")
        return data


class OrderStatusTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusTracking
        fields = ['log_id', 'order', 'old_status', 'new_status', 'changed_at']
        read_only_fields = ['log_id', 'order', 'old_status', 'new_status', 'changed_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=True)
    seller_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='seller')
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)
    seller_email = serializers.CharField(source='seller.email', read_only=True)
    status_logs = OrderStatusTrackingSerializer(many=True, read_only=True)
    courier_details = CourierSerializer(source="courier", read_only=True)
    courier_name = serializers.SerializerMethodField()
    courier_assigned = serializers.SerializerMethodField()
    assignment_id = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'order_id', 'buyer', 'buyer_email', 'seller', 'seller_id', 'seller_email',
            'order_type','courier_details','stripe_payment_intent_id', 'delivery_address', 'total_price', 'order_status',
            'payment_status', 'payment_method_id', 'created_at', 'updated_at',
            'delivered_at', 'cancelled_at', 'items', 'status_logs', 'customer_lat', 'customer_lng',
            'courier_name', 'courier_assigned', 'assignment_id'
        ]
        read_only_fields = ['total_price', 'order_status', 'created_at', 'updated_at', 'delivered_at', 'cancelled_at']
        ref_name = 'OrdersOrderSerializer'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['buyer'] = self.context['request'].user

        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            running_total = 0
            for item_data in items_data:
                if item_data.get('product'):
                    item_data['unit_price'] = item_data['product'].price
                elif item_data.get('material_listing'):
                    # listing = MaterialListing.objects.get(pk=item_data['material_listing'].id)
                    item_data['unit_price'] = item_data['material_listing'].price_per_unit
                OrderItem.objects.create(order=order, **item_data)
                
                qty = float(item_data.get('quantity', 0))
                price = float(item_data.get('unit_price', 0))
                running_total += qty * price

            order.total_price = running_total
            order.save()
            OrderStatusTracking.objects.create(order=order, old_status=None, new_status=Order.IN_PROGRESS)

        return order
    
    def get_courier_name(self, obj):
        """Get courier name if assigned"""
        try:
            assignment = CourierAssignment.objects.get(order=obj)
            return f"{assignment.courier.first_name} {assignment.courier.last_name}"
        except CourierAssignment.DoesNotExist:
            return None
    
    def get_courier_phone(self, obj):
        """Get courier phone if assigned"""
        try:
            assignment = CourierAssignment.objects.get(order=obj)
            return assignment.courier.phone_number
        except CourierAssignment.DoesNotExist:
            return None
    
    def get_courier_assigned(self, obj):
        """Check if courier is assigned"""
        return CourierAssignment.objects.filter(order=obj).exists()
    
    def get_assignment_id(self, obj):
        """Get assignment ID if exists"""
        try:
            assignment = CourierAssignment.objects.get(order=obj)
            return str(assignment.id)
        except CourierAssignment.DoesNotExist:
            return None

