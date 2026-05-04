from django.contrib import admin
from .models import Order, OrderItem, OrderStatusTracking

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    autocomplete_fields = ['product', 'material_listing'] 
    readonly_fields = ['unit_price']
    
class OrderStatusTrackingInline(admin.TabularInline):
    model = OrderStatusTracking
    extra = 0
    readonly_fields = ['changed_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'buyer', 'order_status', 'payment_status'] 
    list_filter = ['order_status', 'order_type', 'payment_status'] # Use existing fields
    search_fields = ['order_id', 'payment_method_id']
    inlines = [OrderItemInline, OrderStatusTrackingInline]
    readonly_fields = ['total_price', 'order_status', 'payment_status', 'created_at', 'updated_at', 'delivered_at', 'cancelled_at']
