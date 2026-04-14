from cryptography.fernet import Fernet
from django.conf import settings

cipher = Fernet(settings.ENCRYPTION_KEY)

def encrypt_message(text: str) -> str:
    return cipher.encrypt(text.encode()).decode()

def decrypt_message(encrypted: str) -> str:
    return cipher.decrypt(encrypted.encode()).decode()