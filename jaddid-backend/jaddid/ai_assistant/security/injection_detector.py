"""Prompt injection pattern detection for the AI chat endpoint"""

import re

_INJECTION_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r'ignore\s+(all\s+)?previous\s+instructions',
        r'forget\s+(you\s+are|your\s+role|your\s+instructions)',
        r'you\s+are\s+now\s+(DAN|an?\s+AI\s+without\s+restrictions)',
        r'reveal\s+(your\s+)?(system\s+)?prompt',
        r'pretend\s+(you\s+are|to\s+be)\s+',
        r'act\s+as\s+(if\s+you\s+(have\s+no|are\s+a\s+different)|a\s+different\s+AI)',
        r'disregard\s+(your\s+)?(previous\s+)?instructions',
        r'override\s+(your\s+)?(safety|restrictions|guidelines)',
        r'jailbreak',
        r'do\s+anything\s+now',
        r'DAN\s+mode',
    ]
]


class InjectionDetector:
    @staticmethod
    def detect(message: str) -> bool:
        """Return True if the message matches a known injection pattern"""
        return any(pattern.search(message) for pattern in _INJECTION_PATTERNS)

    @staticmethod
    def get_matched_pattern(message: str) -> str | None:
        """Return the first matched pattern string, or None"""
        for pattern in _INJECTION_PATTERNS:
            if pattern.search(message):
                return pattern.pattern
        return None