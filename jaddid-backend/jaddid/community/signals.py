from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Count
from .models import Review, Notification
from accounts.models import Profile

# @receiver(post_save, sender=Review)
# def create_review_notification(sender, instance, created, **kwargs):
#     """only send notification when a new review is created not updated"""
#     if created:
#         Notification.objects.create(
#             user=instance.target_user,
#             type=Notification.SYSTEM,
#             title_en="New Review Received",
#             title_ar="تم استلام تقييم جديد",
#             msg_en=f"User {instance.reviewer} gave you a {instance.rating}/10 rating.",
#             msg_ar=f"قام المستخدم {instance.reviewer} بتقييمك بمعدل {instance.rating}/10.",
#             is_read=False
#         )


@receiver(post_save, sender=Review)
def update_user_review_stats(sender, instance, created, **kwargs):
    target_user = instance.target_user

    #get all reviews for this user
    stats = Review.objects.filter(target_user=target_user).aggregate(
        avg_rating=Avg('rating'),
        total_reviews=Count('id')
    )

    #update profile cache
    profile, _ = Profile.objects.get_or_create(user=target_user)
    profile.average_rating = round(stats['avg_rating'] or 0.0, 1)
    profile.review_count = stats['total_reviews'] or 0
    profile.save()

    #create notification
    if created:
        Notification.objects.create(
            user=instance.target_user,
            type=Notification.SYSTEM,
            title_en="New Review Received",
            title_ar="تم استلام تقييم جديد",
            msg_en=f"User {instance.reviewer} gave you a {instance.rating}/5 rating.",
            msg_ar=f"قام المستخدم {instance.reviewer} بتقييمك بمعدل {instance.rating}/5.",
            is_read=False
        )



@receiver(post_delete, sender=Review)
def update_stats_on_delete(sender, instance, **kwargs):
    """update stats if a review is deleted"""
    update_user_review_stats(sender, instance, created=False)