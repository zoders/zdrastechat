from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="uploadedfile",
            name="file_type",
            field=models.CharField(choices=[("avatar", "Avatar"), ("message_image", "Message image")], max_length=32),
        ),
    ]
