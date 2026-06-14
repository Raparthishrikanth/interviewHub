from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from apps.users.views import RecruiterViewSet, CandidateManagementViewSet

router = DefaultRouter()
router.register(r"recruiters", RecruiterViewSet, basename="recruiter")
router.register(r"candidates", CandidateManagementViewSet, basename="candidate")

def api_root(request):
    return JsonResponse({
        "name": "InterviewHub API",
        "status": "healthy",
        "version": "1.0.0",
        "message": "Welcome to the InterviewHub REST API. Please access the user interface via the React frontend at http://localhost:5173",
        "endpoints": {
            "admin": "/admin/",
            "auth": "/api/auth/",
            "interviews": "/api/interviews/",
            "notices": "/api/notices/",
            "recruiters": "/api/recruiters/",
            "candidates": "/api/candidates/"
        }
    })

urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/interviews/", include("apps.interviews.urls")),
    path("api/notices/", include("apps.notices.urls")),
    path("api/", include(router.urls)),
]

from django.conf import settings
admin.site.site_url = settings.FRONTEND_URL
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


