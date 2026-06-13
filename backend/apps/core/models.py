import shortuuid
from django.db import models


class FileType:
    AVATAR = "avatar"

    CHOICES = [
        (AVATAR, "Avatar"),
    ]


def uploaded_file_path(instance, filename):
    return f"uploads/{instance.file_type}/{filename}"


class BaseModel(models.Model):
    id = models.CharField(
        max_length=22,
        primary_key=True,
        default=shortuuid.uuid,
        editable=False,
        unique=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UploadedFile(BaseModel):
    file = models.FileField(upload_to=uploaded_file_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_type = models.CharField(max_length=32, choices=FileType.CHOICES)

    class Meta:
        db_table = "uploaded_files"

    def delete(self, *args, **kwargs):
        storage = self.file.storage if self.file else None
        file_name = self.file.name if self.file else None
        super().delete(*args, **kwargs)
        if storage and file_name:
            storage.delete(file_name)
