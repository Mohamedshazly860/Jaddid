from django.urls import path
from . import views

urlpatterns = [
    #Authentication
    path('courier/register/', views.courier_register, name='courier-register'),
    path('courier/login/', views.courier_login, name='courier-login'),

    #Courier Profile & Status
    path('courier/profile/', views.get_courier_profile, name='courier-profile'),
    path('courier/profile/update/', views.update_courier_profile, name='courier-profile-update'),
    path('courier/toggle-availability/', views.toggle_courier_availability, name='courier-toggle-availability'),
    path('courier/location/update/', views.update_courier_location, name='courier-location-update'),

    #Assignments & Delivery Operations
    path('courier/assignments/', views.get_courier_assignments, name='courier-assignments'),
    # This endpoint is manually called to trigger assignment logic for a specific order
    path('order/<str:order_id>/assign/', views.assign_courier_to_order, name='assign-courier'),
    # This endpoint triggers the simulation logic for a specific assignment
    path('assignment/<str:assignment_id>/start/', views.start_delivery, name='start-delivery'),

    #Live Tracking (For Buyers)
    path('tracking/<str:order_id>/', views.get_order_tracking, name='order-tracking'),
    path('tracking/<str:order_id>', views.get_order_tracking, name='order-tracking-no-slash'),

    #Admin/Testing Utilities
    path('couriers/available/', views.get_available_couriers, name='available-couriers'),
]