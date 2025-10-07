#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Crear directorio para archivos estáticos
mkdir -p staticfiles

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate