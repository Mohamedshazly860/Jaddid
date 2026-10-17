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
        current = cache.get(self.cache_key, 0)
        if current >= self.MAX_REQUESTS:
            return False
        
        #Increment with expiry (atomic operation)
        cache.set(self.cache_key, current + 1, timeout=self.WINDOW_SECONDS)
        return True
    
    def get_remaining(self) -> int:
        """Return how many requests the user has left in the current window."""
        current = cache.get(self.cache_key, 0)
        return max(0, self.MAX_REQUESTS - current)