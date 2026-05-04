import uuid
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Review, Notification

User = get_user_model()


class ReviewModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@example.com', password='pass123', first_name='User', last_name='One')
        self.user2 = User.objects.create_user(email='user2@example.com', password='pass123', first_name='User', last_name='Two')

    def test_review_creation(self):
        review = Review.objects.create(
            reviewer=self.user1,
            target_user=self.user2,
            rating=5,
            comment='Great service!'
        )
        self.assertEqual(review.reviewer, self.user1)
        self.assertEqual(review.target_user, self.user2)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, 'Great service!')
        self.assertIsNotNone(review.created_at)


class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='user@example.com', password='pass123', first_name='User', last_name='One')

    def test_notification_creation(self):
        notification = Notification.objects.create(
            user=self.user,
            type='system',
            title_en='System Update',
            title_ar='System Update',
            msg_en='Your system has been updated.',
            msg_ar='Your system has been updated.'
        )
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.type, 'system')
        self.assertEqual(notification.title_en, 'System Update')
        self.assertFalse(notification.is_read)
        self.assertIsNotNone(notification.created_at)


class ReviewAPITest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@example.com', password='pass123', first_name='User', last_name='One')
        self.user2 = User.objects.create_user(email='user2@example.com', password='pass123', first_name='User', last_name='Two')
        self.client.force_authenticate(user=self.user1)

    def test_create_review(self):
        data = {
            'target_user': self.user2.id,
            'rating': 4,
            'comment': 'Good job!'
        }
        response = self.client.post('/api/community/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        review = Review.objects.first()
        self.assertEqual(review.reviewer, self.user1)

    def test_list_reviews(self):
        Review.objects.create(reviewer=self.user1, target_user=self.user2, rating=3, comment='Okay')
        response = self.client.get('/api/community/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_retrieve_review(self):
        review = Review.objects.create(reviewer=self.user1, target_user=self.user2, rating=4, comment='Good')
        response = self.client.get(f'/api/community/reviews/{review.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rating'], 4)

    def test_update_review(self):
        review = Review.objects.create(reviewer=self.user1, target_user=self.user2, rating=3, comment='Okay')
        update_data = {'rating': 5, 'comment': 'Excellent!'}
        response = self.client.patch(f'/api/community/reviews/{review.id}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.rating, 5)

    def test_delete_review(self):
        review = Review.objects.create(reviewer=self.user1, target_user=self.user2, rating=2, comment='Bad')
        response = self.client.delete(f'/api/community/reviews/{review.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Review.objects.count(), 0)


class NotificationAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='user@example.com', password='pass123', first_name='User', last_name='One')
        self.client.force_authenticate(user=self.user)

    def test_create_notification(self):
        data = {
            'type': 'discount',
            'title_en': 'Discount Available',
            'title_ar': 'Discount Available',
            'msg_en': 'You have a discount.',
            'msg_ar': 'You have a discount.'
        }
        response = self.client.post('/api/community/notifications/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.count(), 1)
        notification = Notification.objects.first()
        self.assertEqual(notification.user, self.user)

    def test_list_notifications(self):
        Notification.objects.create(
            user=self.user,
            type='update',
            title_en='Update',
            title_ar='Update',
            msg_en='Update message',
            msg_ar='Update message'
        )
        response = self.client.get('/api/community/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_retrieve_notification(self):
        notif = Notification.objects.create(
            user=self.user,
            type='system',
            title_en='System',
            title_ar='System',
            msg_en='System message',
            msg_ar='System message'
        )
        response = self.client.get(f'/api/community/notifications/{notif.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['type'], 'system')

    def test_update_notification(self):
        notif = Notification.objects.create(
            user=self.user,
            type='discount',
            title_en='Discount',
            title_ar='Discount',
            msg_en='Discount message',
            msg_ar='Discount message'
        )
        update_data = {'title_en': 'Updated Discount'}
        response = self.client.patch(f'/api/community/notifications/{notif.id}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertEqual(notif.title_en, 'Updated Discount')

    def test_delete_notification(self):
        notif = Notification.objects.create(
            user=self.user,
            type='update',
            title_en='Update',
            title_ar='Update',
            msg_en='Update message',
            msg_ar='Update message'
        )
        response = self.client.delete(f'/api/community/notifications/{notif.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Notification.objects.count(), 0)

    def test_mark_as_read(self):
        notification = Notification.objects.create(
            user=self.user,
            type='system',
            title_en='System',
            title_ar='System',
            msg_en='System message',
            msg_ar='System message'
        )
        response = self.client.post(f'/api/community/notifications/{notification.id}/mark_as_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)