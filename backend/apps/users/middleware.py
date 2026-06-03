from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_string):
    try:
        token = AccessToken(token_string)
        user_id = token["user_id"]
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Custom Channels middleware that authenticates users via JWT.
    Supports token in connection query parameters (e.g., ws://.../?token=<token>)
    or via access_token cookie in headers.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        token = None
        
        # 1. Look in query parameters
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        # 2. Look in cookies if query string token not found
        if not token:
            headers = dict(scope.get("headers", []))
            cookie_bytes = headers.get(b"cookie", b"")
            cookies = cookie_bytes.decode("utf-8")
            cookie_dict = {}
            for cookie in cookies.split(";"):
                if "=" in cookie:
                    k, v = cookie.strip().split("=", 1)
                    cookie_dict[k] = v
            token = cookie_dict.get("access_token")

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
