from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pydantic import ValidationError
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from shared.schemas import CreateNoticeSchema
from .models import Notice, NoticePriority, NoticeComment
from .serializers import NoticeSerializer, NoticeCommentSerializer
from apps.interviews.permissions import IsAdmin, IsNotViewer
from apps.interviews.views import ws_broadcast
from apps.interviews.services.email import send_new_notice_email
from apps.users.models import Role

User = get_user_model()

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by("-created_at")
    serializer_class = NoticeSerializer

    def get_permissions(self):
        """
        Only ADMIN can mutate (create, edit, delete) notices.
        CANDIDATE and VIEWER roles have read-only access.
        """
        if self.action in ("create", "update", "partial_update", "destroy"):
            permission_classes = [IsAuthenticated, IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        # 1. Validate using Pydantic
        try:
            schema = CreateNoticeSchema.model_validate(request.data)
        except ValidationError as e:
            return Response({"errors": e.errors()}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Save
        notice = Notice.objects.create(
            title=schema.title,
            body=schema.body,
            type=schema.type,
            priority=schema.priority,
            author=request.user
        )

        serializer = self.get_serializer(notice)

        # 3. Broadcast WebSocket event
        ws_broadcast("notice.new", {"notice": serializer.data})

        # 4. If priority is HIGH, email all active users asynchronously
        if notice.priority == NoticePriority.HIGH:
            user_emails = User.objects.filter(is_active=True).values_list("email", flat=True)
            send_new_notice_email(notice, user_emails)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        
        # Pydantic validation for update
        try:
            schema = CreateNoticeSchema.model_validate(request.data)
        except ValidationError as e:
            return Response({"errors": e.errors()}, status=status.HTTP_400_BAD_REQUEST)

        instance.title = schema.title
        instance.body = schema.body
        instance.type = schema.type
        instance.priority = schema.priority
        instance.save()

        serializer = self.get_serializer(instance)
        # Broadcast edit
        ws_broadcast("notice.new", {"notice": serializer.data})

        return Response(serializer.data)

    def perform_destroy(self, instance):
        notice_id = str(instance.id)
        instance.delete()
        # Broadcast delete
        ws_broadcast("notice.deleted", {"noticeId": notice_id})


class NoticeCommentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, notice_pk=None):
        notice = get_object_or_404(Notice, pk=notice_pk)
        comments = NoticeComment.objects.filter(notice=notice).order_by("created_at")
        serializer = NoticeCommentSerializer(comments, many=True)
        return Response(serializer.data)

    def create(self, request, notice_pk=None):
        # Viewers cannot comment
        if request.user.role == Role.VIEWER:
            return Response({"error": "Viewers cannot post comments."}, status=status.HTTP_403_FORBIDDEN)

        notice = get_object_or_404(Notice, pk=notice_pk)

        text = request.data.get("text")
        if not text or not text.strip():
            return Response({"error": "Comment text is required."}, status=status.HTTP_400_BAD_REQUEST)

        comment = NoticeComment.objects.create(
            notice=notice,
            author=request.user,
            text=text.strip()
        )

        serializer = NoticeCommentSerializer(comment)
        # Broadcast comment WebSocket event
        ws_broadcast("notice_comment_new", {"noticeId": str(notice.id), "comment": serializer.data})

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, notice_pk=None, pk=None):
        comment = get_object_or_404(NoticeComment, pk=pk)
        notice = comment.notice

        # Comments can only be deleted by author or admin
        if request.user.role != Role.ADMIN and comment.author != request.user:
            return Response({"error": "You cannot delete other users' comments."}, status=status.HTTP_403_FORBIDDEN)

        comment_id = str(comment.id)
        comment.delete()

        # Broadcast comment delete WebSocket event
        ws_broadcast("notice_comment_deleted", {"noticeId": str(notice.id), "commentId": comment_id})

        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_200_OK)

