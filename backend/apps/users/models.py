from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import BaseModel
from apps.core.models import UploadedFile


class User(BaseModel, AbstractUser):
    username = models.CharField(max_length=50, unique=True)  # ник
    avatar = models.ForeignKey(
        UploadedFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="avatar_users",
    )
    # password хэшируется автоматически Django

    class Meta:
        db_table = "users"
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        return self.username
