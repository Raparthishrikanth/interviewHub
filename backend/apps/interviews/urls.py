from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InterviewViewSet, CommentViewSet

router = DefaultRouter()
router.register(r"", InterviewViewSet, basename="interview")

urlpatterns = [
    path("", include(router.urls)),
    path("<uuid:interview_pk>/comments/", CommentViewSet.as_view({"get": "list", "post": "create"}), name="interview-comments"),
    path("<uuid:interview_pk>/comments/<uuid:pk>/", CommentViewSet.as_view({"delete": "destroy"}), name="interview-comment-detail"),
]
