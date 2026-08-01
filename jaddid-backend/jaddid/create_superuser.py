import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jaddid.settings')
django.setup()

from accounts.models import User

# Create superuser
email = 'admin@jaddid.com'
password = 'admin123'

if User.objects.filter(email=email).exists():
    print(f'Superuser with email {email} already exists!')
    user = User.objects.get(email=email)
else:
    user = User.objects.create_superuser(
        email=email,
        password=password,
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    print(f'Superuser created successfully!')

print(f'\n Email: {email}')
print(f' Password: {password}')
print(f'\n Access admin panel at: http://127.0.0.1:8000/admin/')
