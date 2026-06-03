from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoticeViewSet, NoticeCommentViewSet

router = DefaultRouter()
router.register(r"", NoticeViewSet, basename="notice")

urlpatterns = [
    path("", include(router.urls)),
    path("<uuid:notice_pk>/comments/", NoticeCommentViewSet.as_view({"get": "list", "post": "create"}), name="notice-comments"),
    path("<uuid:notice_pk>/comments/<uuid:pk>/", NoticeCommentViewSet.as_view({"delete": "destroy"}), name="notice-comment-detail"),
]
