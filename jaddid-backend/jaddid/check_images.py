#!/usr/bin/env python
"""Check and fix material listing image paths"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jaddid.settings')
django.setup()

from marketplace.models import MaterialListing, MaterialImage
from django.conf import settings

print("=== Checking MaterialListing Images ===\n")

for ml in MaterialListing.objects.all()[:10]:
    print(f"ID: {ml.id}")
    print(f"Title: {ml.title}")
    if hasattr(ml, 'image') and ml.image:
        print(f"Image path in DB: {ml.image}")
        full_path = os.path.join(settings.MEDIA_ROOT, str(ml.image))
        exists = os.path.exists(full_path)
        print(f"File exists: {exists}")
        if not exists:
            print(f"MISSING FILE: {full_path}")
    print("-" * 50)

print("\n=== Checking MaterialImage Records ===\n")

for mi in MaterialImage.objects.all()[:20]:
    print(f"Listing: {mi.material_listing.title}")
    print(f"Image path in DB: {mi.image}")
    full_path = os.path.join(settings.MEDIA_ROOT, str(mi.image))
    exists = os.path.exists(full_path)
    print(f"File exists: {exists}")
    if not exists:
        print(f"MISSING FILE: {full_path}")
        # Check if similar file exists
        directory = os.path.dirname(full_path)
        if os.path.exists(directory):
            files = os.listdir(directory)
            print(f"Files in directory: {files}")
    print("-" * 50)
