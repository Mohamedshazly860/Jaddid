from django.apps import AppConfig


class AiAssistantConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_assistant'


    def ready(self):
        try:
            from .services.rag_service import RAGservice
            RAGservice._get_embeddings()
            from .guardrail.scope_guardrail import ScopeGuardrail
            ScopeGuardrail._get_scope_embeddings()
        except Exception as e:
            pass