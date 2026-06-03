from django.urls import re_path
from .consumers import InterviewHubConsumer

websocket_urlpatterns = [
    re_path(r"ws/interviewhub/$", InterviewHubConsumer.as_asgi()),
]
