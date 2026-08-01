import re

# Read the settings file
with open('jaddid/settings.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the entire CORS_ALLOWED_ORIGINS section
pattern = r'CORS_ALLOWED_ORIGINS = \[.*?\]'
replacement = '''CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",   # Vite dev server (current)
    "http://127.0.0.1:5174",   # Vite dev server (IP)
    "http://localhost:3000",   # React dev server
    "http://localhost:5173",   # Vite dev server
    "http://localhost:5178",   # Alternative Vite port
    "http://127.0.0.1:5173",   # Vite dev server (IP)
    "http://127.0.0.1:5178",   # Alternative Vite port (IP)
]'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write back
with open('jaddid/settings.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('CORS origins fixed!')
