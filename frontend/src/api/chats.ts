import api from './axios';
import type { Message } from '../types/chat';

export async function sendChatPhoto(chatId: string, image: File) {
  const formData = new FormData();
  formData.append('image', image);

  const { data } = await api.post<Message>(`/chats/${chatId}/send-photo/`, formData);
  return data;
}
