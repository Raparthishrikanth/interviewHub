from django.contrib import admin
from .models import Interview, Comment, HistoryLog, InterviewCategory

@admin.register(InterviewCategory)
class InterviewCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "name")
    list_filter = ("type",)
    search_fields = ("name",)

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ("id", "candidate_name", "role", "type", "mode", "date", "status", "interviewer", "interview_handler")
    list_filter = ("status", "type", "mode", "date")
    search_fields = ("role", "interviewer", "interview_handler", "candidate__name", "candidate__email")
    ordering = ("-date",)

    def candidate_name(self, obj):
        return obj.candidate.name
    candidate_name.short_description = "Candidate"

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "interview", "author", "created_at")
    list_filter = ("created_at",)
    search_fields = ("text", "author__name", "author__email", "interview__id")

@admin.register(HistoryLog)
class HistoryLogAdmin(admin.ModelAdmin):
    list_display = ("id", "interview", "actor_name", "message", "created_at")
    list_filter = ("created_at",)
    search_fields = ("message", "actor_name", "interview__id")
