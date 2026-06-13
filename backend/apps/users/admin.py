from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Recruiter

class CustomUserAdmin(UserAdmin):
    list_display = ("email", "name", "role", "is_staff", "is_active", "can_view_recruiters", "created_at")
    list_filter = ("role", "is_staff", "is_active", "can_view_recruiters")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("name",)}),
        ("Permissions", {"fields": ("role", "is_staff", "is_active", "is_superuser", "can_view_recruiters", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "password", "role", "is_staff", "is_active", "can_view_recruiters"),
        }),
    )
    search_fields = ("email", "name")

admin.site.register(User, CustomUserAdmin)

@admin.register(Recruiter)
class RecruiterAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "number", "created_at")
    search_fields = ("name", "company")

