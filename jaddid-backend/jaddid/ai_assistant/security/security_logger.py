"""Structured security event logging for the AI assistant."""

import logging

security_log = logging.getLogger('ai_assistant.security')


class SecurityLogger:
    @staticmethod
    def log_rate_limit_hit(user):
        security_log.warning(
            "Rate Limit Exceeded",
            extra={
                "event": "rate_limit_hit",
                "user_id": str(user.id),
                "email": user.email,
            }
        )

    
    @staticmethod
    def log_injection_attempt(user, message: str, matched_pattern: str):
        security_log.warning(
            "Prompt injection attempt detected",
            extra={
                "event": "injection_attempt",
                "user_id": str(user.id),
                "email": user.email,
                "matched_pattern": matched_pattern,
                "message_preview": message[:50]
            }

        )

    
    @staticmethod
    def log_response_leak(user, matched_pattern: str):
        security_log.error(
            "Potential system prompt leak in LLM response",
            extra={
                "event": "response_leak",
                "user_id": str(user.id),
                "email": user.email,
                "matched_pattern": matched_pattern,
            }
        )


    @staticmethod
    def log_guardrail_rejection(user, message: str, score: float):
        security_log.info(
            "Guardrail Rejected out of scope message",
            extra={
                "event": "guardrail_rejection",
                "user_id": str(user.id),
                "score": round(score, 4),
                "message_preview": message[:50],
            }
        )

    
    @staticmethod
    def log_conversation_limit(user):
        security_log.info(
            "User Reached Conversation Limit",
            extra={
                "event": "conversation_limit",
                "user_id": str(user.id),
            }
        )