import shortuuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chats", "0002_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="chat",
            name="id",
            field=models.CharField(default=shortuuid.uuid, editable=False, max_length=22, primary_key=True, serialize=False, unique=True),
        ),
        migrations.AlterField(
            model_name="message",
            name="id",
            field=models.CharField(default=shortuuid.uuid, editable=False, max_length=22, primary_key=True, serialize=False, unique=True),
        ),
    ]
