import sys

# Read the settings file
with open('jaddid/settings.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the new ports to CORS_ALLOWED_ORIGINS
old_text = 'CORS_ALLOWED_ORIGINS = ['
new_text = '''CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",   # Vite dev server (current)
    "http://127.0.0.1:5174",   # Vite dev server (IP)'''

content = content.replace(old_text, new_text)

# Write back
with open('jaddid/settings.py', 'w', encoding='utf-8') as f:
    f.write(content)

print(' CORS origins updated successfully!')
print('Added http://localhost:5174 and http://127.0.0.1:5174')
