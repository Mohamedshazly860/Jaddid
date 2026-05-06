from django.db.models.signals import post_save
from django.dispatch import receiver, Signal
from .models import User, Profile
import redis
import os
import json
from django.contrib.auth.signals import user_logged_in

# Custom signal for logout to clear cache
user_logged_out = Signal()


def get_redis_connection():
    """Get Redis connection with fallback options"""
    try:
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            return redis.from_url(redis_url, decode_responses=True)
        else:
            redis_host = os.getenv("REDIS_HOST", "localhost")
            redis_port = int(os.getenv("REDIS_PORT", 6379))
            return redis.Redis(host=redis_host, port=redis_port, db=0, decode_responses=True)
    except Exception as e:
        print(f"Redis connection error: {e}")
        return None


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create a profile when a user is created"""
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the profile whenever the user is saved"""
    if hasattr(instance, "profile"):
        instance.profile.save()


@receiver(user_logged_in)
def cache_user_profile_on_login(sender, request, user, **kwargs):
    """Cache user profile in Redis when user logs in or registers"""
    try:
        r = get_redis_connection()
        if not r:
            return
        
        # Get user profile
        profile = getattr(user, 'profile', None)
        if not profile:
            return
        
        # Prepare cache data
        cache_key = f"user:{user.id}"
        cache_data = {
            'user_id': str(user.id),
            'profile_id': str(profile.id) if profile.id else None,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name(),
            'role': user.role,
            'is_verified': user.is_verified,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            'phone': profile.phone or '',
            'address': profile.address or '',
            'bio': profile.bio or '',
            'profile_image': profile.profile_image.url if profile.profile_image else None,
            'average_rating': float(profile.average_rating) if profile.average_rating else 0.0,
            'review_count': profile.review_count or 0,
            'push_token': profile.push_token or '',
        }
        
        # Cache with 24 hour expiration
        r.setex(cache_key, 86400, json.dumps(cache_data))
        print(f"✓ Cached profile for user: {user.email}")
        
    except Exception as e:
        print(f"Error caching profile on login: {str(e)}")


@receiver(user_logged_out)
def delete_user_profile_from_cache(sender, user_id, **kwargs):
    """Delete user profile from Redis cache on logout"""
    try:
        r = get_redis_connection()
        if not r:
            return
        
        cache_key = f"user:{user_id}"
        
        # Delete the cache key
        deleted = r.delete(cache_key)
        
        if deleted:
            print(f"✓ Cleared cache for user ID: {user_id}")
        else:
            print(f"⚠ No cache found for user ID: {user_id}")
            
    except Exception as e:
        print(f"Error deleting profile from cache: {str(e)}")




