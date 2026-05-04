from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet
from . import views

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
    path('payments/create-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('payments/confirm/', views.confirm_payment_and_create_order, name='confirm-payment'),
    path('create-with-payment/', views.create_order_with_payment, name='create-order-with-payment'),


]
