from rest_framework import serializers
from .models import Interview, Comment, HistoryLog, InterviewCategory
from apps.users.serializers import UserSerializer

class InterviewCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewCategory
        fields = ("id", "type", "name")

class HistoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryLog
        fields = ("id", "message", "actor_name", "created_at")

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "interview", "author", "text", "created_at")
        read_only_fields = ("id", "interview", "author", "created_at")

class InterviewSerializer(serializers.ModelSerializer):
    candidate = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = (
            "id", "candidate", "role", "department", "type", "mode", "category",
            "date", "duration_min", "interviewer", "interview_handler", "meeting_link",
            "notes", "status", "created_at", "updated_at",
            "comments", "history"
        )
        read_only_fields = ("id", "candidate", "created_at", "updated_at")

    def get_comments(self, obj):
        # Retrieve and serialize all comments ordered by creation date
        comments = obj.comments.all().order_by("created_at")
        return CommentSerializer(comments, many=True).data

    def get_history(self, obj):
        # Retrieve and serialize history logs, newest first
        history = obj.history.all().order_by("-created_at")
        return HistoryLogSerializer(history, many=True).data
