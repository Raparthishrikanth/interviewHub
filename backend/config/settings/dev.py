from .base import *

DEBUG = True

# We can override any dev specific configs here
# e.g., console email backend for easier testing
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
