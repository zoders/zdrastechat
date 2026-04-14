import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.auth import get_user


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.chat_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": data},
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await get_user(self.scope)  # нормальная авторизация
        if self.user.is_anonymous:
            await self.close()
            return

        self.room_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"✅ Notification WebSocket подключён для пользователя {self.user.username}")

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def chat_updated(self, event):
        await self.send(text_data=json.dumps(event))