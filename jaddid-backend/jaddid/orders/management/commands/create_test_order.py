from django.core.management.base import BaseCommand
from orders.models import Order, OrderItem
from accounts.models import User
from marketplace.models import Product
from django.utils import timezone

class Command(BaseCommand):
    help = 'Create test order with delivered status for testing notifications and reviews'

    def handle(self, *args, **options):
        # Get or create a test user
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        if created:
            user.set_password('test123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created test user'))

        # Get or create a test product
        product, created = Product.objects.get_or_create(
            title='Test Product for Review',
            defaults={
                'description': 'Test product for testing review functionality',
                'price': 25.00,
                'owner': user,
                'category': 'electronics',
                'condition': 'new'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created test product'))

        # Create a test order with delivered status
        order = Order.objects.create(
            buyer=user,
            seller=user,  # Self-purchase for testing
            order_type='product',
            delivery_address='123 Test Street, Test City',
            total_price=25.00,
            order_status='delivered',
            payment_status='paid',
            delivered_at=timezone.now()
        )

        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=1,
            unit_price=25.00
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created test order with ID: {order.order_id}\n'
                f'Order details: buyer={order.buyer.email}, status={order.order_status}\n'
                f'Product ID: {product.id}\n'
                f'You can now test the notification and review functionality!'
            )
        )