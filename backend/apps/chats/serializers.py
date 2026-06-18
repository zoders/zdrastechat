from rest_framework import serializers
from .models import Chat, Message
from apps.users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()
    sender_id = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    attachment_type = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender_id", "text", "attachment_url", "attachment_type", "timestamp", "is_read"]
        read_only_fields = ["id", "timestamp", "is_read"]

    def get_text(self, obj):
        return obj.get_text()

    def get_sender_id(self, obj):
        return str(obj.sender.id)

    def get_attachment_url(self, obj):
        if not obj.attachment or not obj.attachment.file:
            return None

        request = self.context.get("request")
        url = obj.attachment.file.url
        return request.build_absolute_uri(url) if request else url

    def get_attachment_type(self, obj):
        return obj.attachment.file_type if obj.attachment else None


class ChatSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ["id", "participants", "last_message", "other_user"]

    def get_participants(self, obj):
        """Работает и с моделью Chat, и с dict (при создании)"""
        if isinstance(obj, dict):
            # При создании чата obj — это validated_data
            participant_ids = obj.get('participants', [])
            # Если нужно — можно здесь вернуть ники, но проще вернуть как есть
            return participant_ids
        else:
            # Обычный случай — модель Chat
            current_user = self.context.get('current_user')
            usernames = [user.username for user in obj.participants.all()]
            if current_user:
                usernames = [u for u in usernames if u != current_user.username]
            return usernames

    def get_last_message(self, obj):
        if isinstance(obj, dict):
            return None
        last = obj.messages.last()
        return MessageSerializer(last).data if last else None

    def get_other_user(self, obj):
        if isinstance(obj, dict):
            return None

        current_user = self.context.get('current_user')
        if not current_user:
            return None

        other = obj.participants.exclude(id=current_user.id).first()
        return UserSerializer(other, context=self.context).data if other else None
