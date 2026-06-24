from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from pydantic import ValidationError

from shared.schemas import CreateInterviewSchema, UpdateStatusSchema
from .models import Interview, Comment, HistoryLog, Status, InterviewType, InterviewCategory
from apps.users.models import Role
from .serializers import InterviewSerializer, CommentSerializer, InterviewCategorySerializer
from .permissions import IsAdmin, IsCandidate, IsNotViewer, IsAdminOrCandidate
from .filters import InterviewFilter
from .services.email import (
    send_interview_scheduled_email,
    send_interview_status_changed_email,
    send_new_comment_email
)
from .services.csv_export import get_interviews_csv_streaming_response

# WebSocket Broadcast Helper
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def ws_broadcast(event_type, payload):
    channel_layer = get_channel_layer()
    if channel_layer:
        try:
            async_to_sync(channel_layer.group_send)(
                "interviewhub",
                {
                    "type": event_type,
                    **payload
                }
            )
        except Exception as e:
            print(f"WebSocket broadcast error: {e}")

User = get_user_model()

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all().order_by("-date")
    serializer_class = InterviewSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = InterviewFilter
    search_fields = ("role", "interviewer", "interview_handler", "candidate__name", "candidate__email")
    ordering_fields = ("date", "created_at")

    def get_permissions(self):
        """
        Gates actions based on User roles.
        """
        if self.action in ("create",):
            permission_classes = [IsAuthenticated, IsNotViewer] # Candidate and Admin can schedule
        elif self.action in ("update", "partial_update", "destroy", "status_update"):
            permission_classes = [IsAuthenticated, IsAdmin] # Admin full control
        elif self.action in ("cancel",):
            permission_classes = [IsAuthenticated, IsCandidate] # Candidates can cancel
        elif self.action in ("stats",):
            permission_classes = [IsAuthenticated] # All authenticated users can view dashboard stats
        elif self.action in ("export",):
            permission_classes = [IsAuthenticated, IsAdminOrCandidate] # Admin and Candidate can export
        else:
            permission_classes = [IsAuthenticated] # Read list & detail
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # Allow all authenticated roles (including CANDIDATE) to view all interviews
        return self.queryset

    def create(self, request, *args, **kwargs):
        # 1. Pydantic Validation
        try:
            schema = CreateInterviewSchema.model_validate(request.data)
        except ValidationError as e:
            return Response({"errors": e.errors()}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # 2. Get or create Candidate User
            email = schema.candidate_email
            role = Role.CANDIDATE
            
            # If standard candidate schedules, candidate_email MUST be their own email
            if request.user.role == Role.CANDIDATE and request.user.email != email:
                return Response(
                    {"error": "Candidates can only schedule interviews for themselves."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            candidate, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "name": email.split("@")[0].capitalize(),
                    "role": role
                }
            )

            # 3. Create Interview
            interview = Interview.objects.create(
                candidate=candidate,
                role=schema.role,
                department=schema.department or "",
                type=schema.type,
                mode=schema.mode,
                category=schema.category or "",
                date=schema.date,
                duration_min=schema.duration_min,
                interviewer=schema.interviewer or "",
                interview_handler=schema.interview_handler or "",
                meeting_link=str(schema.meeting_link) if schema.meeting_link else "",
                notes=schema.notes or "",
                status=Status.PENDING
            )

            # 4. Generate History Log
            actor_name = request.user.name
            HistoryLog.objects.create(
                interview=interview,
                message=f"Interview scheduled for {candidate.name} ({interview.type}).",
                actor_name=actor_name
            )

        # 5. Broadcast WebSocket and Send Email
        serializer = self.get_serializer(interview)
        ws_broadcast("interview_created", {"interview": serializer.data, "candidateId": str(interview.candidate.id)})
        send_interview_scheduled_email(interview)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_date = old_instance.date
        old_role = old_instance.role
        old_type = old_instance.type
        old_interviewer = old_instance.interviewer

        with transaction.atomic():
            instance = serializer.save()
            
            changes = []
            if old_date != instance.date:
                old_str = old_date.strftime("%Y-%m-%d %H:%M")
                new_str = instance.date.strftime("%Y-%m-%d %H:%M")
                changes.append(f"rescheduled to {new_str} UTC (was {old_str} UTC)")
            if old_role != instance.role:
                changes.append(f"role changed to '{instance.role}' (was '{old_role}')")
            if old_type != instance.type:
                changes.append(f"type changed to {instance.type} (was {old_type})")
            if old_interviewer != instance.interviewer:
                changes.append(f"interviewer changed to '{instance.interviewer}' (was '{old_interviewer}')")

            if changes:
                msg = f"Interview details updated: {', '.join(changes)}."
                HistoryLog.objects.create(
                    interview=instance,
                    message=msg,
                    actor_name=self.request.user.name
                )

        updated_data = self.get_serializer(instance).data
        ws_broadcast("interview_updated", {"interview": updated_data, "candidateId": str(instance.candidate.id)})

    def perform_destroy(self, instance):
        # Admin delete triggers delete and broadcasts status change or delete
        interview_id = str(instance.id)
        candidate_id = str(instance.candidate.id)
        instance.delete()
        ws_broadcast("interview_deleted", {"interviewId": interview_id, "candidateId": candidate_id})

    @action(detail=True, methods=["patch"], url_path="status")
    def status_update(self, request, pk=None):
        """
        Status-only update by Admin.
        """
        interview = self.get_object()
        
        # Check rule: If status is CANCELLED or COMPLETED, no further status changes allowed.
        if interview.status in (Status.CANCELLED, Status.COMPLETED):
            return Response(
                {"error": f"Cannot change status. Current status is {interview.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            schema = UpdateStatusSchema.model_validate(request.data)
        except ValidationError as e:
            return Response({"errors": e.errors()}, status=status.HTTP_400_BAD_REQUEST)

        old_status = interview.status
        new_status = schema.status

        # If no change, return early
        if old_status == new_status:
            return Response(self.get_serializer(interview).data)

        with transaction.atomic():
            interview.status = new_status
            interview.save()

            HistoryLog.objects.create(
                interview=interview,
                message=f"Status changed from {old_status} to {new_status}.",
                actor_name=request.user.name
            )

        # Broadcast and Notify
        ws_broadcast("interview_status_changed", {"interviewId": str(interview.id), "newStatus": new_status, "candidateId": str(interview.candidate.id)})
        send_interview_status_changed_email(interview, old_status, new_status)

        return Response(self.get_serializer(interview).data)

    @action(detail=True, methods=["patch"], url_path="cancel")
    def cancel(self, request, pk=None):
        """
        Candidate cancels their own PENDING interview.
        """
        interview = self.get_object()

        # Candidates can only cancel PENDING interviews
        if interview.status != Status.PENDING:
            return Response(
                {"error": "Only pending interviews can be cancelled by the candidate."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Confirm own interview
        if interview.candidate != request.user:
            return Response(
                {"error": "You can only cancel your own interviews."},
                status=status.HTTP_403_FORBIDDEN
            )

        old_status = interview.status
        with transaction.atomic():
            interview.status = Status.CANCELLED
            interview.save()

            HistoryLog.objects.create(
                interview=interview,
                message="Interview cancelled by Candidate.",
                actor_name=request.user.name
            )

        # Broadcast and Notify
        ws_broadcast("interview_status_changed", {"interviewId": str(interview.id), "newStatus": Status.CANCELLED, "candidateId": str(interview.candidate.id)})
        send_interview_status_changed_email(interview, old_status, Status.CANCELLED)

        return Response(self.get_serializer(interview).data)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """
        Dashboard stats aggregation for Admin.
        """
        # Count by status
        status_counts = Interview.objects.values("status").annotate(count=Count("status"))
        counts_dict = {s[0]: 0 for s in Status.choices}
        for entry in status_counts:
            counts_dict[entry["status"]] = entry["count"]

        # Count by type
        type_counts = Interview.objects.values("type").annotate(count=Count("type"))
        types_dict = {t[0]: 0 for t in InterviewType.choices}
        for entry in type_counts:
            types_dict[entry["type"]] = entry["count"]

        total_interviews = Interview.objects.count()

        return Response({
            "total": total_interviews,
            "status_breakdown": counts_dict,
            "type_breakdown": types_dict
        })

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request):
        """
        CSV Download for Admin.
        """
        # Apply current filter parameters
        queryset = self.filter_queryset(self.get_queryset())
        return get_interviews_csv_streaming_response(queryset)


class CommentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, interview_pk=None):
        interview = get_object_or_404(Interview, pk=interview_pk)
        
        comments = Comment.objects.filter(interview=interview).order_by("created_at")
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def create(self, request, interview_pk=None):
        # Viewers cannot comment
        if request.user.role == Role.VIEWER:
            return Response({"error": "Viewers cannot post comments."}, status=status.HTTP_403_FORBIDDEN)

        interview = get_object_or_404(Interview, pk=interview_pk)

        text = request.data.get("text")
        if not text or not text.strip():
            return Response({"error": "Comment text is required."}, status=status.HTTP_400_BAD_REQUEST)

        comment = Comment.objects.create(
            interview=interview,
            author=request.user,
            text=text.strip()
        )

        # History log for comment addition
        HistoryLog.objects.create(
            interview=interview,
            message=f"New comment posted by {request.user.name}.",
            actor_name=request.user.name
        )

        serializer = CommentSerializer(comment)
        # Broadcast comment WebSocket event
        ws_broadcast("comment_new", {"interviewId": str(interview.id), "comment": serializer.data, "candidateId": str(interview.candidate.id)})
        
        # Email candidate if not authored by candidate
        send_new_comment_email(comment)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, interview_pk=None, pk=None):
        comment = get_object_or_404(Comment, pk=pk)
        interview = comment.interview

        # Comments can only be deleted by author or admin
        if request.user.role != Role.ADMIN and comment.author != request.user:
            return Response({"error": "You cannot delete other users' comments."}, status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        
        # Add deletion log to history
        HistoryLog.objects.create(
            interview=interview,
            message="A comment was deleted.",
            actor_name=request.user.name
        )

        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_200_OK)


class InterviewCategoryViewSet(viewsets.ModelViewSet):
    queryset = InterviewCategory.objects.all().order_by("type", "name")
    serializer_class = InterviewCategorySerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            permission_classes = [IsAuthenticated, IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

