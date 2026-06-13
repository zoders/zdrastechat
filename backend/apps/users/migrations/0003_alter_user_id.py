import shortuuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_user_avatar"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="id",
            field=models.CharField(default=shortuuid.uuid, editable=False, max_length=22, primary_key=True, serialize=False, unique=True),
        ),
    ]
