"""Redis based per user rate limiter for AI chatbot endpoint"""

from django.core.cache import cache
from django.conf import settings


class RateLimiter:
    """Limit each user to RATE_LIMIT_MAX_REQUESTS per RATE_LIMIT_WINDOW_SECONDS"""

    MAX_REQUESTS = getattr(settings, 'CHAT_RATE_LIMIT_MAX', 20)
    WINDOW_SECONDS = getattr(settings, 'CHAT_RATE_LIMIT_WINDOW', 3600)

    def __init__(self, user):
        self.user = user
        self.cache_key = f"chat_rate_limit:user:{user.id}"

    def is_allowed(self) -> bool:
        """Return True if the user is within the rate limit, and False if exceeded"""
        try:
            new_count = cache.incr(self.cache_key)
            
            if new_count == 1:
                cache.expire(self.cache_key, self.WINDOW_SECONDS)
            
            return new_count <= self.MAX_REQUESTS
        
        except Exception:
            return True
    
    def get_remaining(self) -> int:
        """Return how many requests the user has left in the current window."""
        current = cache.get(self.cache_key, 0)
        return max(0, self.MAX_REQUESTS - current)