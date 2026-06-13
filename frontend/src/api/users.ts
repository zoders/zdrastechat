import api from './axios';
import type { UserProfile } from '../types/user';

export async function getCurrentUser() {
  const { data } = await api.get<UserProfile>('/users/me/');
  return data;
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<UserProfile>('/users/me/avatar/', formData);
  return data;
}

export async function deleteAvatar() {
  await api.delete('/users/me/avatar/');
}
