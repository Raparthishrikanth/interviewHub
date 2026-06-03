from django.contrib import admin
from .models import Notice

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "priority", "author_name", "created_at")
    list_filter = ("type", "priority", "created_at")
    search_fields = ("title", "body", "author__name", "author__email")
    ordering = ("-created_at",)

    def author_name(self, obj):
        return obj.author.name
    author_name.short_description = "Author"
