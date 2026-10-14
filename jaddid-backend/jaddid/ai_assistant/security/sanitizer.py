"""for Input and response sanitization"""

import re

# Control characters except tab (\x09), newline (\x0a), carriage return (\x0d)
_CONTROL_CHARS = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')

_LEAKED_PROMPT_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r'my\s+system\s+prompt',
        r'my\s+instructions\s+(say|are|tell\s+me)',
        r'i\s+was\s+(told|instructed|asked)\s+to',
        r'as\s+an?\s+AI\s+language\s+model,?\s+I',
        r'the\s+system\s+prompt\s+(says|states|reads)',
    ]
]

class InputSanitizer:

    @staticmethod
    def sanitize(message: str) -> str:
        """remove control characters and normalizer white space.
        raise ValueError if message is empty after sanitization
        """

        cleaned = _CONTROL_CHARS.sub('', message)
        cleaned = ' '.join(cleaned.split())
        if not cleaned.strip():
            raise ValueError("Message is empty after sanitization")
        return cleaned.strip()


class ResponseSanitizer:
    _SAFE_FALLBACK = (
        "I'm sorry, I wasn't able to generate a proper response. "
        "Please try asking your question differently."
    )

    @classmethod
    def sanitize(cls, response: str) -> tuple[str, bool]:
        """Check response for leaked prompt content.

        Returns (sanitized_response, was_sanitized).
        If a leak is detected, returns the safe fallback and True.
        """
        for pattern in _LEAKED_PROMPT_PATTERNS:
            if pattern.search(response):
                return cls._SAFE_FALLBACK, True
        return response, False