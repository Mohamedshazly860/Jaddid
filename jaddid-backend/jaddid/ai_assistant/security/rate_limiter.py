"""Redis based per user rate limiter for AI chatbot endpoint"""

from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """Limit each user to RATE_LIMIT_MAX_REQUESTS per RATE_LIMIT_WINDOW_SECONDS"""

    MAX_REQUESTS = getattr(settings, 'CHAT_RATE_LIMIT_MAX', 20)
    WINDOW_SECONDS = getattr(settings, 'CHAT_RATE_LIMIT_WINDOW', 3600)

    def __init__(self, user):
        self.user = user
        self.cache_key = f"chat_rate_limit:user:{user.id}"

    def is_allowed(self) -> bool:
        """Atomic fixed-window counter that works on LocMem and Redis."""
        try:
            # add() only sets the key if it doesn't exist, and sets the TTL with it
            cache.add(self.cache_key, 0, timeout=self.WINDOW_SECONDS)
            try:
                new_count = cache.incr(self.cache_key)
            except ValueError:
                # Key expired between add() and incr(), so start a new window
                cache.set(self.cache_key, 1, timeout=self.WINDOW_SECONDS)
                new_count = 1
            return new_count <= self.MAX_REQUESTS
        except Exception:
            # Fail open if the cache is down, but log it so it's never silent
            logger.exception("Rate limiter unavailable, allowing request")
            return True
        
        def get_remaining(self) -> int:
            """Return how many requests the user has left in the current window."""
            current = cache.get(self.cache_key, 0)
            return max(0, self.MAX_REQUESTS - current)