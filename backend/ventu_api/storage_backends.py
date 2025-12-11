"""
Custom storage backends para separar archivos static y media en S3
"""
from storages.backends.s3boto3 import S3Boto3Storage


class StaticStorage(S3Boto3Storage):
    """Storage para archivos estáticos (CSS, JS)"""
    location = 'static'
    default_acl = 'public-read'


class MediaStorage(S3Boto3Storage):
    """Storage para archivos subidos por usuarios (imágenes de tours)"""
    location = 'media'
    default_acl = 'public-read'
    file_overwrite = False
