from django.contrib import admin
from .models import CourierAssignment, LiveTracking, Order, Courier
# Register your models here.

@admin.register(Courier)
class CourierAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'email', 'transport_type', 'is_available', 'current_lat', 'current_lng')
    list_filter = ('transport_type', 'is_available')
    search_fields = ('first_name', 'last_name', 'email')
    # readonly_fields = ('current_lat', 'current_lng')



@admin.register(CourierAssignment)
class CourierAssignmentAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'courier', 'accepted', 'assigned_at', 'rejected')
    list_filter = ('accepted', 'rejected')
    def order_id(self, obj):
        return obj.order.order_id
    order_id.short_description = 'ORDER ID'


@admin.register(LiveTracking)
class LiveTrackingAdmin(admin.ModelAdmin):
    list_display = ('courier', 'latitude', 'longitude', 'timestamp')
    readonly_fields = ('timestamp',)