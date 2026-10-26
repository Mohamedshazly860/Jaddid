from django.apps import AppConfig


class AiAssistantConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_assistant'

    def ready(self):
        import ai_assistant.signals  # noqa: F401
        try:
            from .guardrail.scope_guardrail import ScopeGuardrail
            ScopeGuardrail()._get_scope_embeddings()
        except Exception:
            pass

