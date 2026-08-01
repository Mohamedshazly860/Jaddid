from django.test import TestCase

from accounts.models import User
from logistics.models import Courier, CourierAssignment
from logistics.serializers import CourierSerializer
from logistics.services import CourierService
from orders.models import Order


class LogisticsAvailabilityTests(TestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(
            email='buyer@example.com',
            first_name='Buyer',
            last_name='One',
            password='StrongPass123!'
        )
        self.seller = User.objects.create_user(
            email='seller@example.com',
            first_name='Seller',
            last_name='One',
            password='StrongPass123!'
        )
        self.courier = Courier.objects.create(
            email='courier@example.com',
            password='StrongPass123!',
            first_name='Test',
            last_name='Courier',
            phone='01012345678',
            transport_type='CAR',
            vehicle_number='ABC-123',
            current_lat=30.0,
            current_lng=31.0,
            is_available=True,
        )

    def test_serializer_exposes_is_available_field(self):
        serializer = CourierSerializer(self.courier)
        self.assertIn('is_available', serializer.data)
        self.assertTrue(serializer.data['is_available'])

    def test_find_nearest_courier_uses_is_available_field(self):
        unavailable_courier = Courier.objects.create(
            email='busy-courier@example.com',
            password='StrongPass123!',
            first_name='Busy',
            last_name='Courier',
            phone='01098765432',
            transport_type='MOTORCYCLE',
            vehicle_number='XYZ-456',
            current_lat=30.01,
            current_lng=31.01,
            is_available=False,
        )

        result = CourierService.find_nearest_courier(30.0, 31.0)

        self.assertEqual(result, self.courier)
        self.assertNotEqual(result, unavailable_courier)

    def test_signal_marks_courier_available_when_assignment_is_rejected(self):
        order = Order.objects.create(
            buyer=self.buyer,
            seller=self.seller,
            order_type=Order.PRODUCT,
            order_status='pending',
        )

        assignment = CourierAssignment.objects.create(order=order, courier=self.courier)
        self.courier.refresh_from_db()
        self.assertFalse(self.courier.is_available)

        assignment.rejected = True
        assignment.save()
        self.courier.refresh_from_db()
        self.assertTrue(self.courier.is_available)
