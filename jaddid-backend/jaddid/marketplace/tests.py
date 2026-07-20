from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Product


class ProductCreationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='seller@example.com',
            password='StrongPass123',
            first_name='Seller',
            last_name='User',
        )
        self.category = Category.objects.create(
            name='Test Category',
            name_ar='فئة تجريبية',
            description='Test category',
            is_active=True,
        )

    def test_regular_user_product_is_published_when_draft_is_submitted(self):
        self.client.force_authenticate(self.user)

        response = self.client.post('/api/marketplace/products/', {
            'category': self.category.id,
            'title': 'Test Product',
            'description': 'A test product',
            'price': '12.50',
            'quantity': 1,
            'condition': 'good',
            'location': 'Cairo',
            'status': 'draft',
        }, format='json')

        self.assertEqual(response.status_code, 201, response.data)
        product = Product.objects.get(id=response.data['id'])
        self.assertEqual(product.status, 'active')
        self.assertIsNotNone(product.published_at)
