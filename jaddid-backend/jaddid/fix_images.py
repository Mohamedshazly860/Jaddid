#!/usr/bin/env python
"""Fix incorrect image paths in MaterialImage records"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jaddid.settings')
django.setup()

from marketplace.models import MaterialImage
from django.conf import settings

print("=== Fixing MaterialImage Paths ===\n")

# Find the incorrect record
incorrect_images = MaterialImage.objects.filter(image__contains='_dVjgtkk')

for mi in incorrect_images:
    old_path = str(mi.image)
    print(f"Found incorrect path: {old_path}")
    
    # Remove the _dVjgtkk suffix
    new_path = old_path.replace('_dVjgtkk', '')
    
    # Check if the correct file exists
    full_path = os.path.join(settings.MEDIA_ROOT, new_path)
    if os.path.exists(full_path):
        print(f"Correct file exists: {new_path}")
        mi.image = new_path
        mi.save()
        print(f"✓ Updated MaterialImage record")
    else:
        print(f"✗ Correct file not found: {full_path}")
    print("-" * 50)

print("\n=== Verification ===\n")
for mi in MaterialImage.objects.all()[:5]:
    full_path = os.path.join(settings.MEDIA_ROOT, str(mi.image))
    exists = os.path.exists(full_path)
    status = "✓" if exists else "✗"
    print(f"{status} {mi.image} - Exists: {exists}")
