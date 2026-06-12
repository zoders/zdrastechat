from rest_framework import generics, status, serializers
from django.shortcuts import get_object_or_404
from .models import Chat, Message, User
from .serializers import ChatSerializer, MessageSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class ChatListView(generics.ListAPIView):
    serializer_class = ChatSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['current_user'] = self.request.user
        return context

    def get_queryset(self):
        return self.request.user.chats.all()


class ChatCreateView(generics.CreateAPIView):
    serializer_class = ChatSerializer

    def perform_create(self, serializer):
        participants_ids = self.request.data.get("participants", [])

        if len(participants_ids) != 1:
            raise serializers.ValidationError("Пока поддерживаются только чаты 1:1")

        other_user_id = participants_ids[0]
        current_user = self.request.user

        # Проверяем, есть ли уже чат
        existing_chat = Chat.objects.filter(participants=current_user).filter(
            participants=other_user_id
        ).distinct().first()

        if existing_chat:
            return existing_chat

        chat = serializer.save()
        chat.participants.set([current_user.id, other_user_id])
        chat.save()
        return chat


class ChatMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        chat_id = self.kwargs["chat_id"]
        chat = get_object_or_404(Chat, id=chat_id, participants=self.request.user)
        Message.objects.filter(chat=chat, is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)
        return chat.messages.all()


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer

    def perform_create(self, serializer):
        chat_id = self.kwargs["chat_id"]
        chat = get_object_or_404(Chat, id=chat_id, participants=self.request.user)

        message = serializer.save(chat=chat, sender=self.request.user, encrypted_text="")
        message.set_text(self.request.data.get("text", ""))
        message.save()

        # === WebSocket уведомление всем участникам чата ===
        channel_layer = get_channel_layer()
        for participant in chat.participants.all():
            async_to_sync(channel_layer.group_send)(
                f"user_{participant.id}",
                {
                    "type": "chat_updated",
                    "chat_id": str(chat.id),
                }
            )

        return message
