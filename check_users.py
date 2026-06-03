import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("Listing all users in the database:")
for user in User.objects.all():
    print(f"Name: {user.name} | Email: {user.email} | Role: {user.role} | Is Active: {user.is_active} | Is Staff: {user.is_staff}")
