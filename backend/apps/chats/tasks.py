from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Message

@shared_task
def delete_old_messages():
    cutoff = timezone.now() - timedelta(days=5)
    Message.objects.filter(timestamp__lt=cutoff).delete()