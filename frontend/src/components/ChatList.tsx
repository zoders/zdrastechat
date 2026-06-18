import { useState, useEffect } from 'react';
import api from '../api/axios';
import { WS_URL, USE_WEBSOCKET } from '../config';
import IconButton from './ui/IconButton';
import TextInput from './ui/TextInput';
import Avatar from './ui/Avatar';
import { chatList } from '../styles/ui';
import type { Chat, FoundUser } from '../types/chat';

export default function ChatList({
  onChatSelect,
  selectedChatId,
}: {
  onChatSelect: (chatId: string, otherName: string, otherAvatarUrl: string | null) => void;
  selectedChatId: string | null;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);

  const currentUsername = localStorage.getItem('username') || '';

  const loadMyChats = async () => {
    const { data } = await api.get<Chat[]>('/chats/');
    setChats(data);
  };

  useEffect(() => {
    loadMyChats();

    if (USE_WEBSOCKET) {
      const token = localStorage.getItem('access_token');
      const socket = new WebSocket(`${WS_URL}/notifications/?token=${token}`);

      socket.onopen = () => console.log('🟢 WS уведомления');
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_updated') loadMyChats();
      };
      socket.onclose = () => console.log('🔴 WS отключён');

      return () => socket.close();
    } else {
      const interval = setInterval(loadMyChats, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const searchUser = async () => {
    if (!searchUsername.trim()) return;
    try {
      const { data } = await api.get<FoundUser[]>(`/users/search/?username=${searchUsername}`);
      setFoundUser(data.length > 0 ? data[0] : null);
    } catch {
      setFoundUser(null);
    }
  };

  const startChat = async () => {
    if (!foundUser) return;
    try {
      const { data } = await api.post('/chats/create/', {
        participants: [foundUser.id],
      });
      loadMyChats();
      const otherName = foundUser.username;
      onChatSelect(data.id, otherName, foundUser.avatar_url);
      setFoundUser(null);
      setSearchUsername('');
    } catch {
      alert('Не удалось создать чат');
    }
  };

  const getOtherParticipant = (participants: string[]) => {
    return participants.find(name => name !== currentUsername) || participants[0] || 'Чат';
  };

  return (
    <div className={chatList.root}>
      <div className={chatList.searchPanel}>
        <div className={chatList.searchRow}>
          <TextInput
            type="text"
            placeholder="Точный ник..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="flex-1"
          />
          <IconButton
            onClick={searchUser}
            label="Найти пользователя"
            title="Найти"
            variant="primary"
            className="px-4 text-sm"
          >
            🔎
          </IconButton>
        </div>

        {foundUser && (
          <div className={chatList.foundUser}>
            <Avatar src={foundUser.avatar_url} label={`@${foundUser.username}`} />
            <span className="font-medium truncate">@{foundUser.username}</span>
            <IconButton
              onClick={startChat}
              label="Начать чат"
              title="Начать чат"
              variant="success"
              className="px-4 text-sm"
            >
              ➕
            </IconButton>
          </div>
        )}
      </div>

      <div className={chatList.list}>
        {chats.map((chat) => {
          const otherName = chat.other_user?.username ?? getOtherParticipant(chat.participants);
          const otherAvatarUrl = chat.other_user?.avatar_url ?? null;
          return (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id, otherName, otherAvatarUrl)}
              className={chatList.item(selectedChatId === chat.id)}
            >
              <Avatar src={otherAvatarUrl} label={`@${otherName}`} />
              <div className={chatList.itemBody}>
                <div className="font-semibold truncate">@{otherName}</div>
                {chat.last_message && (
                  <div className="text-xs text-gray-400 mt-1 truncate">
                    {chat.last_message.attachment_url ? 'Фото' : chat.last_message.text}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {chats.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Чатов пока нет.<br />
            Найдите пользователя выше
          </div>
        )}
      </div>
    </div>
  );
}
