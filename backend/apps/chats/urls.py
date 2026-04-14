from django.urls import path
from .views import (
    ChatListView,
    ChatMessagesView,
    SendMessageView,
    ChatCreateView,
)

urlpatterns = [
    path("", ChatListView.as_view(), name="chat-list"),
    path("create/", ChatCreateView.as_view(), name="chat-create"),   # ← эта строка была нужна
    path("<str:chat_id>/messages/", ChatMessagesView.as_view(), name="chat-messages"),
    path("<str:chat_id>/send/", SendMessageView.as_view(), name="send-message"),
]