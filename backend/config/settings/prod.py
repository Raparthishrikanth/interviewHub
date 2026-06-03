from .base import *

DEBUG = False

# Production security policies
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
JWT_COOKIE_SECURE = True

# Production allowed hosts
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="").split(",")
