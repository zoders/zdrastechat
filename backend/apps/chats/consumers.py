import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

from .models import Chat, Message
from .serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.chat_id}"
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close(code=4401)
            return

        self.chat = await self.get_chat()
        if not self.chat:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"type": "error", "detail": "Invalid JSON"}))
            return

        text = data.get("text", "").strip()
        if not text:
            await self.send(text_data=json.dumps({"type": "error", "detail": "Message is empty"}))
            return

        message = await self.create_message(text)

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": message},
        )

        for user_id in await self.get_participant_ids():
            await self.channel_layer.group_send(
                f"user_{user_id}",
                {
                    "type": "chat_updated",
                    "chat_id": str(self.chat_id),
                    "message": message,
                },
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
        }))

    @database_sync_to_async
    def get_chat(self):
        try:
            return Chat.objects.get(id=self.chat_id, participants=self.user)
        except Chat.DoesNotExist:
            return None

    @database_sync_to_async
    def create_message(self, text):
        message = Message(chat=self.chat, sender=self.user, encrypted_text="")
        message.set_text(text)
        message.save()
        return dict(MessageSerializer(message).data)

    @database_sync_to_async
    def get_participant_ids(self):
        return list(self.chat.participants.values_list("id", flat=True))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close(code=4401)
            return

        self.room_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def chat_updated(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_updated",
            "chat_id": event["chat_id"],
            "message": event.get("message"),
            "timestamp": timezone.now().isoformat(),
        }))
