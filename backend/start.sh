#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e

# Run migrations
python manage.py migrate

# Start Daphne server on the port specified by Render ($PORT)
exec daphne -b 0.0.0.0 -p $PORT config.asgi:application
