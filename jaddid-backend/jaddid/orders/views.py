from math import perm
import stat
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.db.models import F, Q
from yaml import serialize
from decimal import Decimal
import stripe
from django.conf import settings
from .models import Order, OrderItem, OrderStatusTracking
from accounts.models import User
from .serializers import OrderSerializer
from marketplace.models import Product, MaterialListing, Cart, CartItem
from django.contrib.auth import get_user_model


stripe.api_key = settings.STRIPE_SECRET_KEY

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_id'
    lookup_url_kwarg = 'order_id'

    def get_queryset(self):
        """Filter orders to only show orders where user is buyer or seller"""
        # return Order.objects.filter(
        #     Q(buyer=self.request.user) | Q(seller=self.request.user)
        # ).distinct()
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Order.objects.all()
        
        return Order.objects.filter(
        Q(buyer=self.request.user) | Q(seller=self.request.user)
        ).distinct()

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to add logging"""
        print(f"OrderViewSet.retrieve: pk={kwargs.get('pk')}, user={request.user}, user_id={request.user.id}")
        queryset = self.get_queryset()
        print(f"Filtered queryset count: {queryset.count()}")
        try:
            instance = self.get_object()
            print(f"Found order: {instance}, buyer={instance.buyer}, seller={instance.seller}")
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error retrieving order: {e}")
            # Try to find the order without filtering
            try:
                order = Order.objects.get(order_id=kwargs.get('pk'))
                print(f"Order exists in DB: {order}, buyer={order.buyer}, seller={order.seller}")
                print(f"User is buyer: {order.buyer == request.user}, User is seller: {order.seller == request.user}")
            except Order.DoesNotExist:
                print("Order does not exist in database")
            except Exception as e2:
                print(f"Error checking order: {e2}")
            raise

    def create(self, request, *args, **kwargs):
        """Create a new order with service fee and delivery fee"""
        raw_data = request.data
        order_data = raw_data.get('order_data', raw_data)
        
        try:
            with transaction.atomic():
                # 1. Create the Main Order
                order = Order.objects.create(
                    buyer=request.user,
                    seller_id=order_data.get('seller_id'),
                    delivery_address=order_data.get('delivery_address'),
                    customer_lat=order_data.get('customer_lat'),
                    customer_lng=order_data.get('customer_lng'),
                    order_type=order_data.get('order_type', 'product'),
                    order_status=order_data.get('status', 'pending'),
                    stripe_payment_intent_id=order_data.get('stripe_payment_id'),
                    payment_status='paid' if order_data.get('stripe_payment_id') else 'pending'
                )

                # 2. Create Order Items and calculate subtotal
                items_data = order_data.get('items', [])
                subtotal = Decimal('0')

                for item in items_data:
                    p_id = item.get('product_id')
                    m_id = item.get('material_listing_id')
                    qty = int(item.get('quantity', 1))
                    
                    price = Decimal('0')
                    product_obj = None
                    material_obj = None
                    
                    # Get the product or material and check inventory
                    if p_id:
                        product_obj = Product.objects.select_for_update().get(id=p_id)
                        price = product_obj.price
                        
                        # Check if enough inventory
                        if product_obj.quantity < qty:
                            raise ValueError(f"Insufficient stock for {product_obj.title}. Available: {product_obj.quantity}, Requested: {qty}")
                        
                        # Reduce inventory
                        product_obj.quantity = F('quantity') - qty
                        product_obj.save()
                        product_obj.refresh_from_db()  # Get updated quantity
                        
                    elif m_id:
                        material_obj = MaterialListing.objects.select_for_update().get(id=m_id)
                        price = material_obj.price_per_unit
                        
                        # Check if enough inventory
                        if material_obj.quantity < qty:
                            raise ValueError(f"Insufficient stock for {material_obj.material.name}. Available: {material_obj.quantity}, Requested: {qty}")
                        
                        # Reduce inventory
                        material_obj.quantity = F('quantity') - qty
                        material_obj.save()
                        material_obj.refresh_from_db()  # Get updated quantity
                    # Create the Item
                    OrderItem.objects.create(
                        order=order,
                        product_id=p_id,
                        material_listing_id=m_id,
                        quantity=qty,
                        unit_price=price
                    )
                    
                    subtotal += (price * qty)

                order.subtotal = subtotal
                order.calculate_fees()  
                order.save()

                order.refresh_from_db()
                serializer = self.get_serializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"CRITICAL ERROR: {str(e)}")
            return Response(
                {'error': f"Failed to create order: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def confirm(self, request, pk=None):
        """Seller confirms the order - changes status from IN_PROGRESS to CONFIRMED"""
        order = get_object_or_404(Order, pk=pk)
        
        #only seller can confirm
        if order.seller != request.user:
            return Response({
                'error': 'Only the seller can confirm this order'
            }, status=status.HTTP_403_FORBIDDEN)

        old_status = order.order_status
        order.order_status = 'confirmed'
        order.save()

        OrderStatusTracking.objects.create(
            order=order,
            old_status=old_status,
            new_status='confirmed'
        )

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)



    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def update_status(self, request, pk=None):
        order = self.get_object()
    
        new_status = request.data.get('status')
        new_payment_status = request.data.get('payment_status') 
    
        old_status = order.order_status
        if new_status:
            order.order_status = new_status
        if new_payment_status:
            order.payment_status = new_payment_status
        order.save() 
        OrderStatusTracking.objects.create(
            order=order, 
            old_status=old_status, 
            new_status=new_status
    )
        return Response(self.get_serializer(order).data)



    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def buyer_update(self, request, pk=None):
        """Buyer updates order before confirmation"""
        order = get_object_or_404(Order, pk=pk, buyer=request.user)
        if order.order_status != Order.IN_PROGRESS:
            return Response({
                'detail': 'Cannot update after order is confirmed.'
            }, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        delivery_address = data.get('delivery_address')
        items_data = data.get('items', [])

        if delivery_address:
            order.delivery_address = delivery_address

        # Recalculate subtotal
        subtotal = Decimal('0')
        for item_data in items_data:
            item = get_object_or_404(OrderItem, pk=item_data['id'], order=order)

            if item.product:
                max_qty = item.product.quantity
            elif item.material_listing:
                max_qty = item.material_listing.quantity
            else:
                continue

            requested_qty = item_data.get('quantity', item.quantity)
            if requested_qty > max_qty:
                requested_qty = max_qty

            item.quantity = requested_qty
            item.save()
            subtotal += item.quantity * item.unit_price

        order.subtotal = subtotal
        order.calculate_fees()
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def cancel(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk, buyer=request.user)
        if order.order_status in [Order.DELIVERED, Order.CANCELLED]:
            return Response({'detail': 'Cannot cancel delivered or already cancelled orders.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.order_status
        order.order_status = Order.CANCELLED
        order.cancelled_at = timezone.now()
        order.save()
        OrderStatusTracking.objects.create(order=order, old_status=old_status, new_status=Order.CANCELLED)

        #restore inventory
        for item in order.items.all():
            if item.product:
                item.product.quantity = F('quantity') + item.quantity
                item.product.save()
            elif item.material_listing:
                item.material_listing.quantity = F('quantity') + item.quantity
                item.material_listing.save()

        #update cart items
        carts = Cart.objects.filter(items__product__in=[i.product for i in order.items.all() if i.product])
        
        for cart in carts:
            for cart_item in cart.items.all():
                if cart_item.product and cart_item.product.quantity < cart_item.quantity:
                    cart_item.quantity = cart_item.product.quantity
                    if cart_item.quantity == 0:
                        cart_item.delete()
                    else:
                        cart_item.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_orders(self, request):
        """get current user's order as buyer"""
        orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def seller_orders(self, request):
        """Get current user's order as seller"""
        orders = Order.objects.filter(seller=request.user).order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Create a Stripe PaymentIntent for the order
    """
    try:
        # Get amount from request
        amount = request.data.get('amount')
        
        if not amount:
            return Response({
                'error': 'Amount is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to cents and ensure it's an integer
        try:
            amount_decimal = Decimal(str(amount))
            amount_cents = int(amount_decimal * 100)
        except (ValueError, TypeError):
            return Response({
                'error': 'Invalid amount format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure minimum amount (50 cents for USD)
        if amount_cents < 50:
            return Response({
                'error': 'Amount must be at least $0.50'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create PaymentIntent
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='usd',
                metadata={
                    'user_id': str(request.user.id),
                    'user_email': request.user.email,
                }
            )
            
            return Response({
                'clientSecret': intent.client_secret,
                'paymentIntentId': intent.id
            }, status=status.HTTP_200_OK)
            
        except stripe.error.CardError as e:
            # Card was declined
            return Response({
                'error': str(e.user_message)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.InvalidRequestError as e:
            # Invalid parameters
            return Response({
                'error': f'Invalid request: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe failed
            return Response({
                'error': 'Payment authentication failed. Please contact support.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except stripe.error.APIConnectionError as e:
            # Network communication failed
            return Response({
                'error': 'Network error. Please try again.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except stripe.error.StripeError as e:
            # Generic Stripe error
            return Response({
                'error': f'Payment error: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        # Catch any other errors
        return Response({
            'error': f'An unexpected error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order_with_payment(request):
    """
    Create order and process Stripe payment
    """
    try:
        # Extract data from request
        seller_id = request.data.get('seller_id')
        delivery_address = request.data.get('delivery_address')
        customer_lat = request.data.get('customer_lat')
        customer_lng = request.data.get('customer_lng')
        order_type = request.data.get('order_type')
        items = request.data.get('items', [])
        payment_method_id = request.data.get('payment_method_id')
        
        # Calculate total amount
        total_amount = sum(
            item.get('unit_price', 0) * item.get('quantity', 0)
            for item in items
        )
        
        # Convert to cents for Stripe
        amount_cents = int(total_amount * 100)
        
        # Create Stripe PaymentIntent
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='usd',
                payment_method=payment_method_id,
                confirm=True,
                automatic_payment_methods={
                    'enabled': True,
                    'allow_redirects': 'never'
                },
                metadata={
                    'seller_id': seller_id,
                    'buyer_id': str(request.user.id),
                    'order_type': order_type,
                }
            )
            
            # Check payment status
            if payment_intent.status == 'succeeded':
                # Create the order
                order = Order.objects.create(
                    seller_id=seller_id,
                    buyer=request.user,
                    delivery_address=delivery_address,
                    customer_lat=customer_lat,
                    customer_lng=customer_lng,
                    order_type=order_type,
                    payment_method_id=payment_method_id,
                    stripe_payment_intent_id=payment_intent.id,
                    payment_status='paid',
                    total_price=total_amount,
                    status='pending'
                )
                
                # Create order items
                for item_data in items:
                    OrderItem.objects.create(
                        order=order,
                        product_id=item_data.get('product_id'),
                        material_listing_id=item_data.get('material_listing_id'),
                        quantity=item_data.get('quantity'),
                        unit_price=item_data.get('unit_price'),
                        unit=item_data.get('unit', 'piece')
                    )
                
                return Response({
                    'id': str(order.id),
                    'payment_status': 'paid',
                    'message': 'Order created and payment successful'
                }, status=status.HTTP_201_CREATED)
            
            else:
                return Response({
                    'error': 'Payment not completed',
                    'payment_status': payment_intent.status
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except stripe.error.CardError as e:
            return Response({
                'error': f'Card error: {str(e.user_message)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': f'Payment error: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Order creation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Create a Stripe PaymentIntent for the order
    """
    try:
        # Get amount from request
        amount = request.data.get('amount')
        
        if not amount:
            return Response({
                'error': 'Amount is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to cents and ensure it's an integer
        try:
            amount_decimal = Decimal(str(amount))
            amount_cents = int(amount_decimal * 100)
        except (ValueError, TypeError):
            return Response({
                'error': 'Invalid amount format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure minimum amount (50 cents for USD)
        if amount_cents < 50:
            return Response({
                'error': 'Amount must be at least $0.50'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create PaymentIntent
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='usd',
                metadata={
                    'user_id': str(request.user.id),
                    'user_email': request.user.email,
                }
            )
            
            return Response({
                'clientSecret': intent.client_secret,
                'paymentIntentId': intent.id
            }, status=status.HTTP_200_OK)
            
        except stripe.error.CardError as e:
            # Card was declined
            return Response({
                'error': str(e.user_message)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.InvalidRequestError as e:
            # Invalid parameters
            return Response({
                'error': f'Invalid request: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe failed
            return Response({
                'error': 'Payment authentication failed. Please contact support.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except stripe.error.APIConnectionError as e:
            # Network communication failed
            return Response({
                'error': 'Network error. Please try again.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except stripe.error.StripeError as e:
            # Generic Stripe error
            return Response({
                'error': f'Payment error: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        # Catch any other errors
        return Response({
            'error': f'An unexpected error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment_and_create_order(request):
    """
    Verify payment succeeded and create the order
    """
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        order_data = request.data.get('order_data')
        
        if not payment_intent_id or not order_data:
            return Response({
                'error': 'Payment intent ID and order data are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify payment with Stripe
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status != 'succeeded':
                return Response({
                    'error': f'Payment not completed. Status: {payment_intent.status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': f'Failed to verify payment: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Payment successful, create the order
        from .models import Order, OrderItem
        
        try:
            order = Order.objects.create(
                seller_id=order_data.get('seller_id'),
                buyer=request.user,
                delivery_address=order_data.get('delivery_address'),
                customer_lat=order_data.get('customer_lat'),
                customer_lng=order_data.get('customer_lng'),
                order_type=order_data.get('order_type'),
                stripe_payment_intent_id=payment_intent_id,
                payment_status='paid',
                status='pending'
            )
            
            # Create order items
            total_price = Decimal('0')
            for item_data in order_data.get('items', []):
                unit_price = Decimal(str(item_data.get('unit_price', 0)))
                quantity = int(item_data.get('quantity', 1))
                total_price += unit_price * quantity
                
                OrderItem.objects.create(
                    order=order,
                    product_id=item_data.get('product_id'),
                    material_listing_id=item_data.get('material_listing_id'),
                    quantity=quantity,
                    unit_price=unit_price,
                    unit=item_data.get('unit', 'piece')
                )
            
            order.total_price = total_price
            order.save()
            
            return Response({
                'id': str(order.id),
                'status': order.status,
                'payment_status': 'paid',
                'message': 'Order created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'error': f'An unexpected error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

