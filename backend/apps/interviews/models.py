import uuid
from django.db import models
from django.conf import settings

class InterviewType(models.TextChoices):
    TECHNICAL   = "TECHNICAL"
    HR          = "HR"
    MANAGERIAL  = "MANAGERIAL"
    CULTURE_FIT = "CULTURE_FIT"
    FINAL_ROUND = "FINAL_ROUND"

class InterviewMode(models.TextChoices):
    ONLINE    = "ONLINE"
    IN_PERSON = "IN_PERSON"
    PHONE     = "PHONE"

class Status(models.TextChoices):
    PENDING     = "PENDING"
    CONFIRMED   = "CONFIRMED"
    COMPLETED   = "COMPLETED"
    CANCELLED   = "CANCELLED"
    RESCHEDULED = "RESCHEDULED"
class InterviewCategory(models.Model):
    id   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=InterviewType.choices)
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Interview Categories"
        unique_together = ("type", "name")

    def __str__(self):
        return f"{self.type} - {self.name}"

class Interview(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="interviews")
    role         = models.CharField(max_length=100)
    department   = models.CharField(max_length=100, blank=True)
    type         = models.CharField(max_length=20, choices=InterviewType.choices)
    mode         = models.CharField(max_length=20, choices=InterviewMode.choices)
    category     = models.CharField(max_length=100, blank=True, default="")
    date         = models.DateTimeField()
    duration_min = models.PositiveIntegerField(default=60)
    interviewer       = models.CharField(max_length=255, blank=True)
    interview_handler = models.CharField(max_length=255, blank=True, default="")
    meeting_link      = models.URLField(max_length=500, blank=True)
    notes        = models.TextField(blank=True, max_length=1000)
    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type} - {self.candidate.name} ({self.status})"

class Comment(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview   = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name="comments")
    author      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    text        = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.name} on {self.interview.id}"

class HistoryLog(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview   = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name="history")
    message     = models.TextField()
    actor_name  = models.CharField(max_length=255)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History: {self.message} (by {self.actor_name})"
