import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("SECRET_KEY", default="django-insecure-key-here")
DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "channels",

    # Custom local apps
    "apps.users",
    "apps.interviews",
    "apps.notices",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database
# We will parse DATABASE_URL
import dj_database_url
DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL", default="sqlite:///db.sqlite3")
    )
}

# Ensure SQLite paths are absolute and point to the pre-populated root database if it exists
if DATABASES["default"]["ENGINE"] == "django.db.backends.sqlite3":
    db_name = DATABASES["default"]["NAME"]
    if db_name and not os.path.isabs(db_name):
        root_db = os.path.join(BASE_DIR.parent, db_name)
        if os.path.exists(root_db):
            DATABASES["default"]["NAME"] = root_db
        else:
            DATABASES["default"]["NAME"] = os.path.join(BASE_DIR, db_name)

# Custom User Model
AUTH_USER_MODEL = "users.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

# CORS configuration
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
]

# Append any custom origins configured in the environment variables
env_cors_origins = config("CORS_ALLOWED_ORIGINS", default="")
if env_cors_origins:
    for origin in env_cors_origins.split(","):
        clean_origin = origin.strip()
        if clean_origin and clean_origin not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(clean_origin)


# REST Framework settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.users.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

# SimpleJWT configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default=15, cast=int)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=config("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default=7, cast=int)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_OBTAIN_SERIALIZER": "apps.users.serializers.CustomTokenObtainPairSerializer",
}

# Custom simplejwt Cookie configuration
JWT_COOKIE_ACCESS_NAME = "access_token"
JWT_COOKIE_REFRESH_NAME = "refresh_token"
JWT_COOKIE_SECURE = False  # Set to True in production
JWT_COOKIE_HTTPONLY = True
JWT_COOKIE_SAMESITE = "Lax"

# Channels Configuration
REDIS_URL = config("REDIS_URL", default=None)
if REDIS_URL:
    import redis
    try:
        # Check if Redis is actually running with a quick connect timeout (0.2s)
        conn = redis.Redis.from_url(REDIS_URL, socket_timeout=0.2, socket_connect_timeout=0.2)
        conn.ping()
        CHANNEL_LAYERS = {
            "default": {
                "BACKEND": "channels_redis.core.RedisChannelLayer",
                "CONFIG": {
                    "hosts": [REDIS_URL],
                },
            },
        }
    except Exception:
        import sys
        print(
            "WARNING: Redis is offline or unreachable at {}. "
            "Falling back to InMemoryChannelLayer for local development.".format(REDIS_URL),
            file=sys.stderr
        )
        CHANNEL_LAYERS = {
            "default": {
                "BACKEND": "channels.layers.InMemoryChannelLayer",
            },
        }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        },
    }

# Email configurations
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="localhost")
EMAIL_PORT_val = config("EMAIL_PORT", default="1025").strip()
if not EMAIL_PORT_val:
    EMAIL_PORT = 1025
else:
    try:
        EMAIL_PORT = int(EMAIL_PORT_val)
    except ValueError:
        EMAIL_PORT = 1025
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@interviewhub.com")

# Automatically set TLS/SSL based on port if not explicitly configured in environment
EMAIL_USE_TLS_str = config("EMAIL_USE_TLS", default="")
EMAIL_USE_SSL_str = config("EMAIL_USE_SSL", default="")

if EMAIL_USE_TLS_str == "":
    EMAIL_USE_TLS = (EMAIL_PORT == 587)
else:
    EMAIL_USE_TLS = EMAIL_USE_TLS_str.lower() in ("true", "1", "yes", "on")

if EMAIL_USE_SSL_str == "":
    EMAIL_USE_SSL = (EMAIL_PORT == 465)
else:
    EMAIL_USE_SSL = EMAIL_USE_SSL_str.lower() in ("true", "1", "yes", "on")



# Media files configurations for resume uploads
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# WhiteNoise storage configuration
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

# Case-insensitive authentication backend
AUTHENTICATION_BACKENDS = [
    "apps.users.backends.CaseInsensitiveModelBackend",
]


