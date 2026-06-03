from rest_framework import serializers
from .models import Notice, NoticeComment
from apps.users.serializers import UserSerializer

class NoticeCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = NoticeComment
        fields = ("id", "notice", "author", "text", "created_at")
        read_only_fields = ("id", "notice", "author", "created_at")

class NoticeSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Notice
        fields = ("id", "title", "body", "type", "priority", "author", "created_at", "updated_at", "comments")
        read_only_fields = ("id", "author", "created_at", "updated_at")

    def get_comments(self, obj):
        # Retrieve and serialize all notice comments ordered by creation date
        comments = obj.comments.all().order_by("created_at")
        return NoticeCommentSerializer(comments, many=True).data

