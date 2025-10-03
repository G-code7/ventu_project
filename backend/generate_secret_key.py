#!/usr/bin/env python
"""
Script para generar un SECRET_KEY seguro para Django
Uso: python generate_secret_key.py
"""
from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    secret_key = get_random_secret_key()
    print("=" * 60)
    print("🔐 SECRET_KEY GENERADO:")
    print("=" * 60)
    print(secret_key)
    print("=" * 60)
    print("\n✅ Copia este valor en tu archivo .env")
    print("   SECRET_KEY=" + secret_key)