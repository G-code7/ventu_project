# Usar una imagen oficial de Python como base
FROM python:3.11-slim

# Establecer variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de requerimientos
COPY requirements.txt /app/

# Instalar las dependencias de Python
# psycopg2-binary es el driver para conectar Django con PostgreSQL
# boto3 es el SDK de AWS para Python, lo usaremos para S3
# django-storages simplifica el uso de almacenamientos externos como S3
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación al directorio de trabajo
# Esto se hará después de inicializar el proyecto Django
COPY . /app/
