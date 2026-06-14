from .base import *

DEBUG = False

# Production security policies
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
JWT_COOKIE_SECURE = True
JWT_COOKIE_SAMESITE = "None"

# Production allowed hosts
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="").split(",")
