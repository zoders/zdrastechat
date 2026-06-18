from django.db import models
from apps.core.models import BaseModel, UploadedFile
from apps.users.models import User
from apps.core.encryption import encrypt_message, decrypt_message


class Chat(BaseModel):
    participants = models.ManyToManyField(
        User,
        related_name="chats",
        verbose_name="Участники"
    )

    class Meta:
        db_table = "chats"

    def __str__(self):
        return f"Chat {self.id}"


class Message(BaseModel):
    chat = models.ForeignKey(
        Chat, 
        on_delete=models.CASCADE, 
        related_name="messages"
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    encrypted_text = models.TextField()
    attachment = models.ForeignKey(
        UploadedFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="messages",
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def set_text(self, text: str):
        self.encrypted_text = encrypt_message(text)

    def get_text(self):
        return decrypt_message(self.encrypted_text)

    class Meta:
        db_table = "messages"
        ordering = ["timestamp"]

    def __str__(self):
        return f"Message {self.id} in {self.chat_id}"
