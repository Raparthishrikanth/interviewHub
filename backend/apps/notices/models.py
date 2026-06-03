import uuid
from django.db import models
from django.conf import settings

class NoticeType(models.TextChoices):
    GENERAL   = "GENERAL"
    REMINDER  = "REMINDER"
    UPDATE    = "UPDATE"
    IMPORTANT = "IMPORTANT"
    HOLIDAY   = "HOLIDAY"

class NoticePriority(models.TextChoices):
    LOW    = "LOW"
    MEDIUM = "MEDIUM"
    HIGH   = "HIGH"

class Notice(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title      = models.CharField(max_length=200)
    body       = models.TextField(max_length=5000)
    type       = models.CharField(max_length=20, choices=NoticeType.choices, default=NoticeType.GENERAL)
    priority   = models.CharField(max_length=10, choices=NoticePriority.choices, default=NoticePriority.MEDIUM)
    author     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notices")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.priority})"

class NoticeComment(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notice      = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name="comments")
    author      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notice_comments")
    text        = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.name} on Notice {self.notice.id}"
