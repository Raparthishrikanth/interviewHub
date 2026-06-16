from .base import *

DEBUG = True

# We can override any dev specific configs here
# By default in dev we use console backend, but let the environment override it
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
