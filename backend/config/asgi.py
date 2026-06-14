import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

django_asgi_app = get_asgi_application()

# Import Channels routing and middleware AFTER django setup
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.users.middleware import JWTAuthMiddleware
import apps.interviews.routing as ws_routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(ws_routing.websocket_urlpatterns)
    ),
})
