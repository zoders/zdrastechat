import apps.core.models
import shortuuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="UploadedFile",
            fields=[
                ("id", models.CharField(default=shortuuid.uuid, editable=False, max_length=22, primary_key=True, serialize=False, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("file", models.FileField(upload_to=apps.core.models.uploaded_file_path)),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                ("file_type", models.CharField(choices=[("avatar", "Avatar")], max_length=32)),
            ],
            options={
                "db_table": "uploaded_files",
            },
        ),
    ]
