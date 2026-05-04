from django.apps import AppConfig

from jaddid.settings import DEFAULT_AUTO_FIELD

class CommunityConfig(AppConfig):
    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
    name = 'community'

    def ready(self):
        import community.signals