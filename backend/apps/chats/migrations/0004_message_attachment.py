from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("chats", "0003_alter_chat_id_alter_message_id"),
        ("core", "0002_alter_uploadedfile_file_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="attachment",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="messages", to="core.uploadedfile"),
        ),
    ]
