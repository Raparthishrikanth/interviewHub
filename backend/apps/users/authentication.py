from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # 1. Try to read the access token from cookies
        access_token = request.COOKIES.get(getattr(settings, "JWT_COOKIE_ACCESS_NAME", "access_token"))
        
        if access_token is None:
            # Fallback to standard Authorization header
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None
        else:
            # SimpleJWT expects a byte string
            raw_token = access_token.encode("utf-8")

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except Exception:
            return None
